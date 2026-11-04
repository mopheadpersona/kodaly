"""Local dev server: like `python3 -m http.server`, but tells the browser not to cache,
so every edit shows on a plain reload. Usage: python3 scripts/serve.py [port]  (default 8000)"""
import functools
import http.server
import os
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webmanifest': 'application/manifest+json'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
print(f'Serving {root} at http://localhost:{port}/')
http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(NoCache, directory=root)).serve_forever()
