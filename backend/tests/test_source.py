import io
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from urllib.error import URLError

import h5py

from backend.query import SCHEMA
from backend.source import (
    BLOCK_SIZE, CACHE_BLOCKS, HF_ETAG, HF_FILE, HF_REPO, HF_REVISION, HF_URL,
    HTTPRangeFile, HuggingFaceHDF5Source, LocalHDF5Source, SourceError,
    _BlockCache, source_from_environment,
)


class Response:
    def __init__(self, status, headers, data=b""):
        self.status = status
        self.headers = headers
        self.data = io.BytesIO(data)
        self.read_called = False

    def geturl(self):
        return "https://us.aws.cdn.hf.co/verified-file"

    def read(self, size=-1):
        self.read_called = True
        return self.data.read(size)

    def __enter__(self):
        return self

    def __exit__(self, *_):
        pass


class SourceTests(unittest.TestCase):
    def test_only_verified_hugging_face_mapping_is_used(self):
        self.assertEqual(HF_REPO, "Onirban1234/MFlowDB")
        self.assertEqual(HF_REVISION, "55532332ae64497403da215139e2ca076b3c31f2")
        self.assertEqual(HF_ETAG, "e50a2d6e4808ce678dfdaf7f557d5b1f926a4908703e7b094de5bc2ea6d1119c")
        self.assertEqual(HF_FILE, "HIT/Low_We/emulsions/We_0_5/We_0_5.hdf5")
        self.assertEqual(HF_URL, f"https://huggingface.co/datasets/{HF_REPO}/resolve/{HF_REVISION}/{HF_FILE}")
        self.assertIsInstance(source_from_environment(SCHEMA["localFileSizeBytes"], {}), HuggingFaceHDF5Source)
        local = source_from_environment(1, {"FLOWDB_DATA_SOURCE": "local", "FLOWDB_HDF5_PATH": "/missing.hdf5"})
        self.assertIsInstance(local, LocalHDF5Source)
        self.assertFalse(local.ready)
        with self.assertRaisesRegex(SourceError, "must be"):
            source_from_environment(1, {"FLOWDB_DATA_SOURCE": "unknown"})

    def test_range_reader_is_bounded_and_reuses_cached_blocks(self):
        payload = b"verified HDF5 bytes"
        requests = []

        def opener(request, timeout):
            requests.append(request)
            if request.get_method() == "HEAD":
                return Response(200, {"Content-Length": str(len(payload)), "ETag": f'"{HF_ETAG}"'})
            self.assertEqual(request.headers["Range"], f"bytes=0-{len(payload) - 1}")
            return Response(206, {"Content-Range": f"bytes 0-{len(payload) - 1}/{len(payload)}", "Content-Length": str(len(payload)), "ETag": f'"{HF_ETAG}"'}, payload)

        cache = _BlockCache()
        first = HTTPRangeFile(len(payload), cache, opener)
        self.assertEqual(first.read(8), payload[:8])
        self.assertEqual(first.seek(0), 0)
        self.assertEqual(first.read(len(payload)), payload)
        self.assertEqual(first.bytes_transferred, len(payload))
        second = HTTPRangeFile(len(payload), cache, opener)
        self.assertEqual(second.read(len(payload)), payload)
        self.assertEqual(second.bytes_transferred, 0)
        self.assertEqual(second.cache_hits, 1)
        self.assertEqual(len(requests), 3)

    def test_missing_range_support_fails_before_reading_body(self):
        response = Response(200, {"Content-Length": "16"}, b"x" * 16)

        def opener(request, timeout):
            return Response(200, {"Content-Length": "16", "ETag": f'"{HF_ETAG}"'}) if request.get_method() == "HEAD" else response

        reader = HTTPRangeFile(16, _BlockCache(), opener)
        with self.assertRaisesRegex(SourceError, "byte-range"):
            reader.read(1)
        self.assertFalse(response.read_called)
        self.assertEqual(reader.bytes_transferred, 0)

    def test_incomplete_or_wrong_range_is_rejected(self):
        def check(headers, data, expected):
            def opener(request, timeout):
                return Response(200, {"Content-Length": "16", "ETag": f'"{HF_ETAG}"'}) if request.get_method() == "HEAD" else Response(206, headers, data)
            with self.assertRaisesRegex(SourceError, expected):
                HTTPRangeFile(16, _BlockCache(), opener).read(1)

        check({"Content-Range": "bytes 1-16/16", "Content-Length": "16"}, b"x" * 16, "byte-range")
        check({"Content-Range": "bytes 0-15/16", "Content-Length": "16"}, b"short", "incomplete")

    def test_network_failure_and_size_mismatch_are_controlled(self):
        with self.assertRaisesRegex(SourceError, "contact"):
            HTTPRangeFile(16, _BlockCache(), lambda *args, **kwargs: (_ for _ in ()).throw(URLError("offline")))
        with self.assertRaisesRegex(SourceError, "metadata"):
            HTTPRangeFile(16, _BlockCache(), lambda *args, **kwargs: Response(200, {"Content-Length": "17", "ETag": f'"{HF_ETAG}"'}))

    def test_changed_source_etag_is_rejected_before_range_read(self):
        requests = []

        def opener(request, timeout):
            requests.append(request.get_method())
            return Response(200, {"Content-Length": "16", "ETag": '"unexpected"'})

        with self.assertRaisesRegex(SourceError, "metadata"):
            HTTPRangeFile(16, _BlockCache(), opener)
        self.assertEqual(requests, ["HEAD"])

    def test_transfer_ceiling_rejects_fetch_before_reading_body(self):
        calls = []

        def opener(request, timeout):
            calls.append(request.get_method())
            return Response(200, {"Content-Length": "16", "ETag": f'"{HF_ETAG}"'})

        with patch("backend.source.MAX_TRANSFER_BYTES", 8):
            reader = HTTPRangeFile(16, _BlockCache(), opener)
            with self.assertRaisesRegex(SourceError, "transfer safety limit"):
                reader.read(1)
        self.assertEqual(calls, ["HEAD"])

    def test_local_source_still_reads_without_remote_access(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "small.hdf5"
            with h5py.File(path, "w") as file:
                file.create_dataset("value", data=[3.25])
            source = LocalHDF5Source(path)
            self.assertTrue(source.ready)
            with source.open() as file:
                self.assertEqual(float(file["value"][0]), 3.25)

    def test_cache_is_capped_and_versioned(self):
        cache = _BlockCache()
        for index in range(CACHE_BLOCKS + 3):
            cache.put("v1", index, b"x")
        self.assertEqual(len(cache.blocks), CACHE_BLOCKS)
        self.assertIsNone(cache.get("v1", 0))
        self.assertIsNone(cache.get("v2", CACHE_BLOCKS + 2))
        self.assertEqual(len(cache.blocks), 0)
        self.assertEqual(BLOCK_SIZE * CACHE_BLOCKS, 16 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
