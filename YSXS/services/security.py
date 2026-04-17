from functools import wraps
from flask import abort, redirect, request, url_for
from flask_login import current_user


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or 'admin' not in current_user.role:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function


def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'super admin':
            abort(403)
        return f(*args, **kwargs)
    return decorated_function
