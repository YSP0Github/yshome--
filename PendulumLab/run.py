from __future__ import annotations

import http.server
import socketserver
import webbrowser
from functools import partial
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8787
ROOT = Path(__file__).resolve().parent / "static"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        print("INFO: " + (format % args))


def main() -> None:
    handler = partial(QuietHandler, directory=str(ROOT))
    with socketserver.TCPServer((HOST, PORT), handler) as server:
        url = f"http://{HOST}:{PORT}"
        print(f"SUCCESS: PendulumLab running at {url}")
        print("INFO: Press Ctrl+C to stop")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        server.serve_forever()


if __name__ == "__main__":
    main()
