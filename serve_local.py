"""Development helper to mimic the production nginx routing locally.

Run `python serve_local.py` and visit http://127.0.0.1:5050/ for the
portfolio site or http://127.0.0.1:5050/YSXS for the Flask backend.
"""
import os
import sys
from pathlib import Path

# Ensure the Flask app is aware of the /YSXS URL prefix before importing it.
os.environ.setdefault('YSXS_URL_PREFIX', '/YSXS')
os.environ.setdefault('YSXS_ENV', 'development')

from flask import Flask, abort, send_from_directory
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.serving import run_simple

PROJECT_ROOT = Path(__file__).resolve().parent
YSXS_PATH = PROJECT_ROOT / 'YSXS'
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(YSXS_PATH) not in sys.path:
    sys.path.insert(0, str(YSXS_PATH))

from YSXS.app import app as ysxs_app


def create_site_shell() -> Flask:
    app = Flask(__name__, static_folder='static', static_url_path='/static')

    @app.route('/')
    def index():
        return send_from_directory(PROJECT_ROOT, 'index.html')

    @app.route('/<path:requested>')
    def serve_file(requested: str):
        target = (PROJECT_ROOT / requested).resolve()
        if not str(target).startswith(str(PROJECT_ROOT)):
            abort(404)
        if target.is_file():
            return send_from_directory(target.parent, target.name)
        abort(404)

    @app.errorhandler(404)
    def not_found(_):
        return send_from_directory(PROJECT_ROOT, '404.html'), 404
    
    return app


def create_combined_wsgi_app():
    """Return a WSGI app that mounts YSXS under /YSXS."""
    site_shell = create_site_shell()
    return DispatcherMiddleware(site_shell, {
        '/YSXS': ysxs_app,
    })


if __name__ == '__main__':
    combined_app = create_combined_wsgi_app()
    host = os.environ.get('SITE_HOST', '0.0.0.0')
    port = int(os.environ.get('SITE_PORT', 5050))
    run_simple(hostname=host, port=port, application=combined_app,
               use_debugger=True, use_reloader=True, threaded=True)
