"""Loopback-only JSON API for small verified HDF5 slices."""

import json
import os
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer

from .query import QueryError, query_data


class Handler(BaseHTTPRequestHandler):
    def respond(self, status, payload):
        body = json.dumps(payload, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path != "/api/health":
            self.respond(404, {"error": "Not found."})
            return
        path = os.environ.get("FLOWDB_HDF5_PATH")
        self.respond(200, {"status": "ready" if path and Path(path).is_file() else "unconfigured"})

    def do_POST(self):
        if self.path != "/api/query":
            self.respond(404, {"error": "Not found."})
            return
        if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "application/json":
            self.respond(415, {"error": "Content-Type must be application/json."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 16384:
                raise QueryError("Request body must be between 1 and 16,384 bytes.")
            payload = json.loads(self.rfile.read(length))
            result = query_data(payload, os.environ.get("FLOWDB_HDF5_PATH"))
        except (QueryError, json.JSONDecodeError) as error:
            self.respond(400, {"error": str(error)})
        except FileNotFoundError as error:
            self.respond(503, {"error": str(error)})
        except OSError:
            self.respond(503, {"error": "Unable to read the configured HDF5 file."})
        else:
            self.respond(200, result)


def main():
    port = int(os.environ.get("FLOWDB_API_PORT", "8765"))
    server = HTTPServer(("127.0.0.1", port), Handler)
    print(f"FlowDB HDF5 query service listening on http://127.0.0.1:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
