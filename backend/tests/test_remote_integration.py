"""Opt-in checks against the public file; never run on ordinary CI/test runs."""

import os
import unittest

from backend.query import SCHEMA, query_data
from backend.source import HuggingFaceHDF5Source, LocalHDF5Source, MAX_TRANSFER_BYTES


def request(variable="p", operation="point", ranges=None):
    return {
        "variant": SCHEMA["variantId"],
        "variable": variable,
        "operation": operation,
        "ranges": ranges or {"time": [0, 1], "x": [0, 1], "y": [0, 1], "z": [0, 1]},
    }


@unittest.skipUnless(os.environ.get("FLOWDB_REMOTE_INTEGRATION") == "1", "Set FLOWDB_REMOTE_INTEGRATION=1 for public-file reads")
class RemoteIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.remote = HuggingFaceHDF5Source(SCHEMA["localFileSizeBytes"])
        path = os.environ.get("FLOWDB_HDF5_PATH")
        cls.local = LocalHDF5Source(path) if path else None

    def compare(self, payload):
        result = query_data(payload, self.remote)
        if self.local and self.local.ready:
            self.assertEqual(result, query_data(payload, self.local))
        self.assertLess(self.remote.last_transfer["bytes"], MAX_TRANSFER_BYTES)
        return result

    def test_all_fields_and_staggered_boundaries(self):
        for field, axis in (("p", None), ("phi_1", None), ("u_face", "x"), ("v_face", "y"), ("w_face", "z")):
            with self.subTest(field=field):
                ranges = {name: [0, 1] for name in ("time", "x", "y", "z")}
                if axis:
                    ranges[axis] = [128, 129]
                result = self.compare(request(field, ranges=ranges))
                self.assertEqual(result["shape"], [1, 1, 1, 1])
                self.assertEqual(result["step"], [16000])
                self.assertEqual(result["time"], [0.0])
                if field == "p":
                    self.assertEqual(result["data"][0][0][0][0], 1.009291172027588)

    def test_multiple_frames_and_small_spatial_range(self):
        series = self.compare(request(operation="time-series", ranges={"time": [0, 2], "x": [0, 1], "y": [0, 1], "z": [0, 1]}))
        self.assertEqual(series["step"], [16000, 16250])
        self.assertAlmostEqual(series["time"][1], 0.385)
        self.assertEqual(series["shape"], [2, 1, 1, 1])
        volume = self.compare(request(operation="volume", ranges={"time": [0, 1], "x": [0, 2], "y": [0, 2], "z": [0, 2]}))
        self.assertEqual(volume["shape"], [1, 2, 2, 2])
        self.assertEqual(volume["valueCount"], 8)

    def test_pinned_source_preserves_verified_pressure_value(self):
        result = self.compare(request(ranges={"time": [0, 1], "x": [1, 2], "y": [2, 3], "z": [3, 4]}))
        self.assertEqual(result["data"][0][0][0][0], 0.9102370738983154)


if __name__ == "__main__":
    unittest.main()
