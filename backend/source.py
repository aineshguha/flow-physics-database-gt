"""Read-only HDF5 sources for the one verified dataset variant."""

from collections import OrderedDict
from contextlib import contextmanager
from pathlib import Path
from threading import Lock
from time import monotonic
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import os

import h5py

from .query import SCHEMA

HF_REPO = SCHEMA["remoteSource"]["repositoryId"]
HF_REVISION = SCHEMA["remoteSource"]["revision"]
HF_FILE = SCHEMA["remoteSource"]["filePath"]
HF_ETAG = SCHEMA["remoteSource"]["etag"]
HF_URL = f"https://huggingface.co/datasets/{HF_REPO}/resolve/{HF_REVISION}/{HF_FILE}"
BLOCK_SIZE = 1024 * 1024
CACHE_BLOCKS = 16
MAX_TRANSFER_BYTES = 128 * 1024 * 1024
QUERY_TIMEOUT_SECONDS = 60
REQUEST_TIMEOUT_SECONDS = 10


class SourceError(OSError):
    """A storage failure safe to report to the browser."""


class LocalHDF5Source:
    name = "local"

    def __init__(self, path):
        self.path = Path(path) if path else None

    @property
    def ready(self):
        return self.path is not None and self.path.is_file()

    @contextmanager
    def open(self):
        if not self.ready:
            raise SourceError("Local HDF5 source is not configured or cannot be found.")
        with h5py.File(self.path, "r") as file:
            yield file


class _BlockCache:
    def __init__(self):
        self.blocks = OrderedDict()
        self.version = None
        self.lock = Lock()

    def get(self, version, index):
        with self.lock:
            if version != self.version:
                self.blocks.clear()
                self.version = version
            value = self.blocks.get(index)
            if value is not None:
                self.blocks.move_to_end(index)
            return value

    def put(self, version, index, value):
        with self.lock:
            if version != self.version:
                self.blocks.clear()
                self.version = version
            self.blocks[index] = value
            self.blocks.move_to_end(index)
            while len(self.blocks) > CACHE_BLOCKS:
                self.blocks.popitem(last=False)


class HTTPRangeFile:
    """A bounded, seekable file object; never accepts a full-body response."""

    def __init__(self, expected_size, cache, opener=urlopen, expected_etag=HF_ETAG):
        self.opener = opener
        self.cache = cache
        self.deadline = monotonic() + QUERY_TIMEOUT_SECONDS
        self.position = 0
        self.bytes_transferred = 0
        self.range_requests = 0
        self.cache_hits = 0
        try:
            with self.opener(Request(HF_URL, method="HEAD"), timeout=self._timeout()) as response:
                self.url = response.geturl()
                self.size = int(response.headers.get("Content-Length", "0"))
                self.etag = response.headers.get("ETag")
                status = response.status
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            raise SourceError("Unable to contact the Hugging Face HDF5 source.") from error
        host = urlsplit(self.url).hostname or ""
        if urlsplit(self.url).scheme != "https" or not (host == "huggingface.co" or host.endswith((".hf.co", ".huggingface.co"))):
            raise SourceError("The remote HDF5 source redirected to an untrusted location.")
        if status != 200 or self.size != expected_size or not self.etag or self.etag.strip('"') != expected_etag:
            raise SourceError("The remote HDF5 file does not match the verified source metadata.")

    def _timeout(self):
        remaining = self.deadline - monotonic()
        if remaining <= 0:
            raise SourceError("Remote query timed out. Try a smaller index region.")
        return min(REQUEST_TIMEOUT_SECONDS, remaining)

    def _block(self, index):
        cached = self.cache.get(self.etag, index)
        if cached is not None:
            self.cache_hits += 1
            return cached
        start = index * BLOCK_SIZE
        end = min(start + BLOCK_SIZE, self.size) - 1
        length = end - start + 1
        if self.bytes_transferred + length > MAX_TRANSFER_BYTES:
            raise SourceError("Remote query exceeded the transfer safety limit. Reduce the index region.")
        request = Request(self.url, headers={"Range": f"bytes={start}-{end}", "Accept-Encoding": "identity"})
        try:
            with self.opener(request, timeout=self._timeout()) as response:
                if response.status != 206 or response.headers.get("Content-Range") != f"bytes {start}-{end}/{self.size}":
                    raise SourceError("Remote storage did not honor the required byte-range request.")
                if response.headers.get("Content-Length") != str(length) or response.headers.get("Content-Encoding") not in (None, "identity"):
                    raise SourceError("Remote storage returned an invalid byte-range response.")
                data = response.read(length + 1)
                if len(data) != length or response.headers.get("ETag") not in (None, self.etag):
                    raise SourceError("Remote storage returned an incomplete or changed HDF5 range.")
        except (HTTPError, URLError, TimeoutError) as error:
            raise SourceError("Unable to read a byte range from Hugging Face.") from error
        self.bytes_transferred += length
        self.range_requests += 1
        self.cache.put(self.etag, index, data)
        return data

    def read(self, size=-1):
        if size < 0 or size > MAX_TRANSFER_BYTES:
            raise SourceError("Unbounded remote HDF5 reads are not allowed.")
        result = bytearray()
        remaining = min(size, max(0, self.size - self.position))
        while remaining:
            block = self._block(self.position // BLOCK_SIZE)
            part = block[self.position % BLOCK_SIZE:self.position % BLOCK_SIZE + remaining]
            result.extend(part)
            self.position += len(part)
            remaining -= len(part)
        return bytes(result)

    def seek(self, offset, whence=0):
        origin = 0 if whence == 0 else self.position if whence == 1 else self.size if whence == 2 else None
        if origin is None or origin + offset < 0:
            raise SourceError("Invalid remote HDF5 seek.")
        self.position = origin + offset
        return self.position

    def tell(self):
        return self.position

    def flush(self):
        pass


class HuggingFaceHDF5Source:
    name = "remote"
    ready = True

    def __init__(self, expected_size, opener=urlopen):
        self.expected_size = expected_size
        self.opener = opener
        self.cache = _BlockCache()
        self.last_transfer = None

    @contextmanager
    def open(self):
        reader = HTTPRangeFile(self.expected_size, self.cache, self.opener)
        try:
            with h5py.File(reader, "r") as file:
                yield file
        except SourceError:
            raise
        except (OSError, RuntimeError) as error:
            raise SourceError("Unable to open or read the remote HDF5 data.") from error
        finally:
            self.last_transfer = {
                "bytes": reader.bytes_transferred,
                "ranges": reader.range_requests,
                "cacheHits": reader.cache_hits,
            }


def source_from_environment(expected_size, environ=None):
    environ = os.environ if environ is None else environ
    mode = environ.get("FLOWDB_DATA_SOURCE", "remote").lower()
    if mode == "remote":
        return HuggingFaceHDF5Source(expected_size)
    if mode == "local":
        return LocalHDF5Source(environ.get("FLOWDB_HDF5_PATH"))
    raise SourceError("FLOWDB_DATA_SOURCE must be 'remote' or 'local'.")
