import json
import threading
import unittest
from http.server import HTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from backend.query import SCHEMA
from backend.server import Handler
from backend.source import SourceError


class FailingSource:
    name = "remote"
    ready = True

    def __init__(self):
        self.opens = 0

    def open(self):
        self.opens += 1
        raise SourceError("Unable to read a byte range from Hugging Face.")


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.source = FailingSource()
        self.server = HTTPServer(("127.0.0.1", 0), Handler)
        self.server.dataset_source = self.source
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.server.server_port}"

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def post(self, payload):
        request = Request(self.url + "/api/query", data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        with self.assertRaises(HTTPError) as caught:
            urlopen(request, timeout=2)
        return caught.exception.code, json.loads(caught.exception.read())

    def test_health_identifies_remote_source(self):
        with urlopen(self.url + "/api/health", timeout=2) as response:
            self.assertEqual(json.load(response), {"status": "ready", "source": "remote"})

    def test_network_failure_is_a_controlled_api_error(self):
        code, body = self.post({
            "variant": SCHEMA["variantId"], "variable": "p", "operation": "point",
            "ranges": {"time": [0, 1], "x": [0, 1], "y": [0, 1], "z": [0, 1]},
        })
        self.assertEqual(code, 503)
        self.assertEqual(body["error"], "Unable to read a byte range from Hugging Face.")
        self.assertEqual(self.source.opens, 1)

    def test_arbitrary_source_parameters_are_rejected_before_storage_access(self):
        code, body = self.post({
            "variant": SCHEMA["variantId"], "variable": "p", "operation": "point",
            "ranges": {"time": [0, 1], "x": [0, 1], "y": [0, 1], "z": [0, 1]},
            "url": "https://example.com/private.hdf5",
        })
        self.assertEqual(code, 400)
        self.assertIn("only variant", body["error"])
        self.assertEqual(self.source.opens, 0)


if __name__ == "__main__":
    unittest.main()
