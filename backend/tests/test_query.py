import os
import unittest

from backend.inspect import discover_metadata
from backend.query import MAX_FRAMES, MAX_VALUES, QueryError, SCHEMA, query_data, validate_query
from backend.source import LocalHDF5Source


def request(variable="p", operation="point", ranges=None, variant=None):
    return {
        "variant": variant or SCHEMA["variantId"], "variable": variable, "operation": operation,
        "ranges": ranges or {"time": [0, 1], "x": [0, 1], "y": [0, 1], "z": [0, 1]},
    }


class QueryTests(unittest.TestCase):
    def test_schema_contains_only_discovered_fields(self):
        self.assertEqual(set(SCHEMA["fields"]), {"p", "phi_1", "u_face", "v_face", "w_face"})
        self.assertEqual(SCHEMA["fields"]["p"]["shape"], [1054, 128, 128, 128])
        self.assertEqual(SCHEMA["fields"]["u_face"]["shape"], [1054, 129, 128, 128])
        self.assertEqual(SCHEMA["fields"]["v_face"]["shape"], [1054, 128, 129, 128])
        self.assertEqual(SCHEMA["fields"]["w_face"]["shape"], [1054, 128, 128, 129])
        self.assertEqual(SCHEMA["dimensionOrder"], ["time", "x", "y", "z"])

    def test_variant_mapping_and_valid_point(self):
        self.assertEqual(validate_query(request())[0], "p")
        with self.assertRaisesRegex(QueryError, "variant"):
            validate_query(request(variant="isotropic/emulsions/1"))

    def test_unknown_variable(self):
        with self.assertRaisesRegex(QueryError, "Unknown variable"):
            validate_query(request(variable="../../private"))

    def test_arbitrary_remote_url_or_hdf5_path_is_rejected(self):
        for extra in ({"url": "https://example.com/other.hdf5"}, {"datasetPath": "/private"}, {"repo": "other/repo"}):
            with self.subTest(extra=extra), self.assertRaisesRegex(QueryError, "only variant"):
                validate_query({**request(), **extra})

    def test_bounds_and_integer_validation(self):
        for ranges in (
            {"time": [1054, 1055], "x": [0, 1], "y": [0, 1], "z": [0, 1]},
            {"time": [0, 1], "x": [-1, 1], "y": [0, 1], "z": [0, 1]},
            {"time": [0, 1], "x": [0.5, 1], "y": [0, 1], "z": [0, 1]},
            {"time": [0, 1], "x": [0, 0], "y": [0, 1], "z": [0, 1]},
        ):
            with self.subTest(ranges=ranges), self.assertRaises(QueryError):
                validate_query(request(ranges=ranges))

    def test_size_limit_and_unsupported_operation(self):
        ranges = {"time": [0, 1], "x": [0, 17], "y": [0, 17], "z": [0, 17]}
        self.assertGreater(17 ** 3, MAX_VALUES)
        with self.assertRaisesRegex(QueryError, "limit"):
            validate_query(request(operation="volume", ranges=ranges))
        with self.assertRaisesRegex(QueryError, "Unsupported"):
            validate_query(request(operation="line"))
        ranges = {"time": [0, MAX_FRAMES + 1], "x": [0, 1], "y": [0, 1], "z": [0, 1]}
        with self.assertRaisesRegex(QueryError, "frames"):
            validate_query(request(operation="time-series", ranges=ranges))

    def test_operation_shapes(self):
        with self.assertRaisesRegex(QueryError, "time series"):
            validate_query(request(operation="time-series"))
        with self.assertRaisesRegex(QueryError, "2D slice"):
            validate_query(request(operation="slice"))

    @unittest.skipUnless(os.environ.get("FLOWDB_HDF5_PATH"), "Set FLOWDB_HDF5_PATH for real-file integration tests")
    def test_real_file_discovery(self):
        metadata = discover_metadata(os.environ["FLOWDB_HDF5_PATH"])
        self.assertEqual(metadata["fileSizeBytes"], SCHEMA["localFileSizeBytes"])
        self.assertEqual(metadata["groups"], {})
        self.assertEqual(set(metadata["datasets"]), {"/p", "/phi_1", "/u_face", "/v_face", "/w_face", "/step", "/time"})
        for field in SCHEMA["fields"].values():
            actual = metadata["datasets"][field["path"]]
            self.assertEqual(actual["shape"], field["shape"])
            self.assertEqual(actual["dtype"], field["dtype"])
            self.assertEqual(actual["attributes"]["grid_location"], field["gridLocation"])

    @unittest.skipUnless(os.environ.get("FLOWDB_HDF5_PATH"), "Set FLOWDB_HDF5_PATH for real-file integration tests")
    def test_real_small_slice(self):
        ranges = {"time": [0, 1], "x": [0, 2], "y": [0, 2], "z": [0, 2]}
        result = query_data(request(operation="volume", ranges=ranges), LocalHDF5Source(os.environ["FLOWDB_HDF5_PATH"]))
        self.assertEqual(result["shape"], [1, 2, 2, 2])
        self.assertEqual(result["dataset"], "Isotropic Turbulence")
        self.assertEqual(result["dtype"], "float32")
        self.assertEqual(result["time"], [0.0])
        self.assertEqual(result["step"], [16000])
        self.assertAlmostEqual(result["data"][0][0][0][0], 1.009291172027588)

    @unittest.skipUnless(os.environ.get("FLOWDB_HDF5_PATH"), "Set FLOWDB_HDF5_PATH for real-file integration tests")
    def test_real_face_field_and_time_series(self):
        source = LocalHDF5Source(os.environ["FLOWDB_HDF5_PATH"])
        point = query_data(request(variable="u_face", ranges={"time": [0, 1], "x": [128, 129], "y": [0, 1], "z": [0, 1]}), source)
        self.assertEqual(point["gridLocation"], "x-face")
        self.assertEqual(point["shape"], [1, 1, 1, 1])
        series = query_data(request(operation="time-series", ranges={"time": [0, 2], "x": [0, 1], "y": [0, 1], "z": [0, 1]}), source)
        self.assertEqual(series["shape"], [2, 1, 1, 1])
        self.assertEqual(series["step"], [16000, 16250])
        self.assertAlmostEqual(series["time"][1], 0.385)


if __name__ == "__main__":
    unittest.main()
