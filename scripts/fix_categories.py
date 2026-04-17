import sys
from pathlib import Path

# Ensure project root and YSXS package dir are on sys.path so imports inside app work
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / 'YSXS'))

from YSXS.app import app, db, User, Category, ensure_user_categories

with app.app_context():
    default_owner = User.query.filter_by(role='super admin').first() or User.query.order_by(User.id.asc()).first()
    if not default_owner:
        print('未找到任何用户，无法为现有分类设置 owner_id')
    else:
        print(f'将所有无 owner 的分类指派给用户 id={default_owner.id} ({default_owner.username})')
        cats = Category.query.filter(Category.owner_id.is_(None)).all()
        for c in cats:
            c.owner_id = default_owner.id
        db.session.commit()
        print('已为现有分类设置 owner_id，数量:', len(cats))

    # 为每个用户确保默认分类存在
    users = User.query.all()
    for u in users:
        created = ensure_user_categories(u.id, commit=False)
        print(f'用户 {u.id} ({u.username}) 新建分类数: {created}')
    db.session.commit()
    print('为所有用户确保默认分类已完成')
