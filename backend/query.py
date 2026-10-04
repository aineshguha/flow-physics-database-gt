"""Allowlisted, bounded reads of the inspected Emulsions HDF5 file."""

import json
import math
from pathlib import Path

import h5py


SCHEMA = json.loads((Path(__file__).resolve().parent.parent / "metadata" / "we-0.5.schema.json").read_text())
AXES = ("time", "x", "y", "z")
MAX_VALUES = 4096
MAX_FRAMES = 32


class QueryError(ValueError):
    pass


def validate_query(payload, schema=SCHEMA):
    if not isinstance(payload, dict):
        raise QueryError("Request must be a JSON object.")
    if payload.get("variant") != schema["variantId"]:
        raise QueryError("This dataset variant is not available for local queries.")
    variable = payload.get("variable")
    if not isinstance(variable, str) or variable not in schema["fields"]:
        raise QueryError("Unknown variable. Select one of the verified fields.")
    operation = payload.get("operation")
    if operation not in ("point", "slice", "volume", "time-series"):
        raise QueryError("Unsupported query operation.")
    ranges = payload.get("ranges")
    if not isinstance(ranges, dict) or set(ranges) != set(AXES):
        raise QueryError("Provide time, x, y, and z index ranges.")
    shape = schema["fields"][variable]["shape"]
    normalized = {}
    for axis, size in zip(AXES, shape):
        pair = ranges[axis]
        if not isinstance(pair, list) or len(pair) != 2 or any(type(v) is not int for v in pair):
            raise QueryError(f"{axis} range must be two integer indices [start, stop).")
        start, stop = pair
        if start < 0 or stop <= start or stop > size:
            raise QueryError(f"{axis} range must be within [0, {size}] with stop greater than start.")
        normalized[axis] = (start, stop)
    widths = {axis: stop - start for axis, (start, stop) in normalized.items()}
    spatial_widths = [widths[axis] for axis in AXES[1:]]
    if operation == "point" and any(width != 1 for width in widths.values()):
        raise QueryError("A point query must select one frame and one index per spatial axis.")
    if operation == "slice" and (widths["time"] != 1 or spatial_widths.count(1) != 1):
        raise QueryError("A 2D slice must select one frame and exactly one fixed spatial axis.")
    if operation == "volume" and widths["time"] != 1:
        raise QueryError("A volume query must select one frame; use time series for multiple frames.")
    if operation == "time-series" and (widths["time"] < 2 or any(width != 1 for width in spatial_widths)):
        raise QueryError("A time series needs at least two frames and one index per spatial axis.")
    count = math.prod(widths.values())
    if widths["time"] > MAX_FRAMES:
        raise QueryError(f"A request may span at most {MAX_FRAMES} frames. Reduce the time range.")
    if count > MAX_VALUES:
        raise QueryError(f"Request contains {count:,} values; the limit is {MAX_VALUES:,}. Reduce the index ranges.")
    return variable, operation, normalized, count


def _json_values(values):
    if isinstance(values, list):
        return [_json_values(value) for value in values]
    if isinstance(values, float) and not math.isfinite(values):
        return None
    return values


def query_data(payload, file_path, schema=SCHEMA):
    variable, operation, ranges, count = validate_query(payload, schema)
    if not file_path or not Path(file_path).is_file():
        raise FileNotFoundError("Local HDF5 file is not configured or cannot be found.")
    field = schema["fields"][variable]
    slices = tuple(slice(*ranges[axis]) for axis in AXES)
    with h5py.File(file_path, "r") as file:
        # Metadata is checked before reading so a different file cannot silently satisfy this mapping.
        for path, expected_shape in (
            (field["path"], field["shape"]),
            (schema["time"]["path"], schema["time"]["shape"]),
            (schema["step"]["path"], schema["step"]["shape"]),
        ):
            if path not in file or not isinstance(file[path], h5py.Dataset) or list(file[path].shape) != expected_shape:
                raise QueryError("Configured file does not match the verified HDF5 schema.")
        if str(file[field["path"]].dtype) != field["dtype"]:
            raise QueryError("Configured field dtype does not match the verified HDF5 schema.")
        data = file[field["path"]][slices]
        time_slice = slices[0]
        times = file[schema["time"]["path"]][time_slice].tolist()
        steps = file[schema["step"]["path"]][time_slice].tolist()
    return {
        "dataset": "Isotropic Turbulence",
        "variant": schema["variantId"],
        "configuration": schema["configuration"],
        "parameter": schema["parameter"],
        "variable": variable,
        "datasetPath": field["path"],
        "operation": operation,
        "ranges": {axis: list(ranges[axis]) for axis in AXES},
        "shape": list(data.shape),
        "dtype": str(data.dtype),
        "gridLocation": field["gridLocation"],
        "valueCount": count,
        "time": times,
        "step": steps,
        "data": _json_values(data.tolist()),
    }
