"""Static server for out/ that maps clean URLs (/editor) to editor.html,
like Cloudflare Pages does. Python http.server alone 404s on clean URLs."""
import http.server
import os

ROOT = os.path.join(os.path.dirname(__file__), "site", "out")

class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p):
            base = path.split("?")[0].rstrip("/")
            candidate = os.path.join(ROOT, base.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                return candidate
        return p

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 4174), PagesHandler).serve_forever()