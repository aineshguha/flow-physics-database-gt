# Remote HDF5 Access

The verified `isotropic/emulsions/0.5` variant maps internally to the public dataset repository `Onirban1234/MFlowDB`, immutable commit `55532332ae64497403da215139e2ca076b3c31f2`, file `HIT/Low_We/emulsions/We_0_5/We_0_5.hdf5`. The shared `metadata/we-0.5.schema.json` records that source identity, including expected ETag `e50a2d6e4808ce678dfdaf7f557d5b1f926a4908703e7b094de5bc2ea6d1119c`. Hugging Face's dataset API reported the commit for `main`, and a HEAD request at the immutable URL confirmed the previously inspected 35,002,509,662-byte size and ETag. The browser cannot choose a repository, URL, or HDF5 path. The field allowlist, shapes, index ranges, 4,096-value limit, and 32-frame limit come from the existing verified schema and query validator.

## Methods Investigated

| Method | Observation | Decision |
| --- | --- | --- |
| Hugging Face HTTP ranges | An initial `/resolve/main/` probe returned HTTP 206, `Content-Range: bytes 0-15/35002509662`, and exactly 16 bytes. A 1 MiB-block file object opened this real HDF5 file with h5py and read `p[0,0,0,0] = 1.009291172027588`. Production reads now use the pinned commit URL. | Selected, with strict response checks and a transfer ceiling. |
| Hugging Face `HfFileSystem.open(..., block_size=1048576)` | Opened the real file and returned the same `p` value, step 16000, and time 0 in approximately 3 seconds. The tested library's `_fetch_range` used a Range header but read `response.content` without requiring HTTP 206 first. | Not used for this service because a server that ignores Range could return the entire file before the client rejects it. |
| h5py ROS3 | The installed h5py/HDF5 build reports `ros3=False`; ROS3 also targets S3 access rather than this Hugging Face resolve URL. | Unavailable in the reproducible Python environment. |
| `hf-mount` | Hugging Face documents FUSE/NFS mounts, which add mount privileges/system dependencies and an additional disk-cache surface. | Not used for this small deployable API. |

See the official [h5py file-object API](https://docs.h5py.org/en/latest/high/file.html), [Hugging Face filesystem API](https://huggingface.co/docs/huggingface_hub/main/en/package_reference/hf_file_system), and [Hugging Face mount guidance](https://huggingface.co/docs/hub/storage-buckets-access).

## Selected Reader

`backend/source.py` opens the pinned trusted URL with HEAD, checks the verified 35,002,509,662-byte size and exact expected ETag, and reads 1 MiB blocks with HTTP Range. Each block response must be HTTP 206 with the exact expected `Content-Range`, `Content-Length`, encoding, and byte count; any returned range ETag must match the HEAD ETag. A `200` full-file response is rejected **before its body is read**. Network operations have per-request and whole-query deadlines; each query can transfer at most 128 MiB. Failures return a controlled API error and never trigger a full-download fallback.

The reader's 16-block LRU cache is bounded to 16 MiB in process memory and is invalidated when the remote ETag changes. It creates no permanent file cache. In a measured point query, `p[0,0,0,0]` transferred four 1 MiB blocks (4 MiB) and returned in roughly 3 seconds on this machine; an immediate repeat transferred 0 additional range bytes due to cache reuse. The full file was not downloaded. Network timing varies with location and Hugging Face availability.

The query engine receives either `HuggingFaceHDF5Source` (default) or the optional `LocalHDF5Source` (`FLOWDB_DATA_SOURCE=local` plus `FLOWDB_HDF5_PATH`) and runs the same h5py field/slice logic. No local HDF5 file is needed in normal remote mode. CSV and JSON exports still serialize the returned query response in the browser; the optional complete-file download remains a separate direct link to the same pinned Hugging Face file.

## Testing and Deployment

Run the ordinary backend suite without network access using `.venv/bin/python -m unittest discover -s backend/tests`. Set `FLOWDB_REMOTE_INTEGRATION=1` to check all five numerical fields, `/step`, `/time`, staggered boundaries, multiple frames, and a small volume against the public file. If a reference file is locally available, set `FLOWDB_HDF5_PATH` during that suite to compare every remote result with local h5py results. The service does not use that path in default remote mode.

This is a local development HTTP server, not a public production deployment. Before hosting it, add a production HTTP server, authentication/authorization as appropriate, rate and concurrency limits, observability, and a network egress policy. Availability and latency depend on Hugging Face and its CDN. The pinned commit prevents a future `main` update from silently changing the selected file; the HEAD size and ETag check detects an unexpected file identity before any range read.
