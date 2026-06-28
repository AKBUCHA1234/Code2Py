"""Shared rate limiter.

Lives in its own module so both main.py (which registers it on the app)
and individual routers (which decorate endpoints with it) can import it
without creating a circular import.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def get_client_ip(request: Request) -> str:
    """Return the real visitor IP.

    On Render the app runs behind a proxy, so request.client.host is the
    proxy — not the user. The proxy puts the original IP first in the
    X-Forwarded-For header (comma-separated if it passed through several).
    Fall back to the direct client address for local development.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


# key_func decides "who" a request is counted against. We bucket by IP.
limiter = Limiter(key_func=get_client_ip)
