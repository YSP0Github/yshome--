from YSXS.app import app, db
from YSXS.app import User
from werkzeug.security import generate_password_hash

DEFAULT = {
    'username': 'super_admin',
    'email': 'super_admin@example.com',
    'password': '123456',
    'role': 'super admin',
    'custom_id': 'SUPER-ADMIN',
}

with app.app_context():
    existing = User.query.filter_by(role=DEFAULT['role']).first()
    if existing:
        print('super_admin already exists:', existing.username, existing.email)
    else:
        u = User(
            custom_id=DEFAULT['custom_id'],
            role=DEFAULT['role'],
            username=DEFAULT['username'],
            email=DEFAULT['email'],
            password_hash=generate_password_hash(DEFAULT['password'])
        )
        db.session.add(u)
        db.session.commit()
        print('created super_admin:', DEFAULT['username'])
