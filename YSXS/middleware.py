import time


def _normalize_url_prefix(prefix: str | None) -> str:
    if not prefix:
        return ''
    cleaned = str(prefix).strip().strip('/')
    return f"/{cleaned}" if cleaned else ''


class BandwidthLimiterMiddleware:
    """WSGI middleware that throttles outbound bandwidth."""

    def __init__(self, wsgi_app, bytes_per_second: int) -> None:
        self.wsgi_app = wsgi_app
        self.bytes_per_second = max(0, int(bytes_per_second or 0))

    def __call__(self, environ, start_response):
        if self.bytes_per_second <= 0:
            return self.wsgi_app(environ, start_response)
        iterable = self.wsgi_app(environ, start_response)
        return self._apply_limit(iterable)

    def _apply_limit(self, iterable):
        limit = self.bytes_per_second
        sent = 0
        start_time = time.monotonic()
        try:
            for chunk in iterable:
                if chunk:
                    sent += len(chunk)
                    yield chunk
                    elapsed = time.monotonic() - start_time
                    expected = sent / limit
                    delay = expected - elapsed
                    if delay > 0:
                        time.sleep(delay)
                else:
                    yield chunk
        finally:
            close = getattr(iterable, 'close', None)
            if close:
                close()


class ScriptRootMiddleware:
    """Adjust SCRIPT_NAME/PATH_INFO based on reverse-proxy prefixes."""

    def __init__(self, wsgi_app, default_prefix: str = '') -> None:
        self.wsgi_app = wsgi_app
        self.default_prefix = _normalize_url_prefix(default_prefix)

    def __call__(self, environ, start_response):
        header_prefix = _normalize_url_prefix(environ.get('HTTP_X_FORWARDED_PREFIX'))
        prefix = header_prefix or self.default_prefix

        path_info = environ.get('PATH_INFO', '')
        if prefix and prefix != '/':
            environ['SCRIPT_NAME'] = prefix
            if path_info.startswith(prefix):
                trimmed = path_info[len(prefix):]
                if not trimmed:
                    trimmed = '/'
                elif not trimmed.startswith('/'):
                    trimmed = '/' + trimmed
                environ['PATH_INFO'] = trimmed
        elif header_prefix:
            environ['SCRIPT_NAME'] = header_prefix
        if not environ.get('PATH_INFO'):
            environ['PATH_INFO'] = '/'

        return self.wsgi_app(environ, start_response)
