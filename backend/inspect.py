"""Read HDF5 structure without materializing scientific field arrays."""

import json
import os
from pathlib import Path

import h5py
import numpy as np


def _attribute(value):
    if isinstance(value, (bytes, np.bytes_)):
        return value.decode("utf-8", "replace")
    if isinstance(value, np.ndarray):
        return [_attribute(item) for item in value.tolist()]
    if isinstance(value, np.generic):
        return value.item()
    return value


def discover_metadata(file_path):
    if not file_path or not Path(file_path).is_file():
        raise FileNotFoundError("Set FLOWDB_HDF5_PATH to the downloaded HDF5 file.")
    result = {"fileSizeBytes": Path(file_path).stat().st_size, "fileAttributes": {}, "groups": {}, "datasets": {}}
    with h5py.File(file_path, "r") as file:
        result["fileAttributes"] = {key: _attribute(value) for key, value in file.attrs.items()}

        def visit(name, item):
            attributes = {key: _attribute(value) for key, value in item.attrs.items()}
            path = "/" + name
            if isinstance(item, h5py.Group):
                result["groups"][path] = {"attributes": attributes}
            elif isinstance(item, h5py.Dataset):
                result["datasets"][path] = {
                    "shape": list(item.shape), "dimensions": item.ndim, "dtype": str(item.dtype),
                    "attributes": attributes, "chunks": list(item.chunks) if item.chunks else None,
                    "compression": item.compression, "compressionOptions": item.compression_opts,
                    "shuffle": item.shuffle, "dimensionLabels": [dimension.label for dimension in item.dims],
                }

        file.visititems(visit)
    return result


if __name__ == "__main__":
    print(json.dumps(discover_metadata(os.environ.get("FLOWDB_HDF5_PATH")), indent=2))
