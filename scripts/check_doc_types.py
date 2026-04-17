from YSXS.app import app, db, DocType, init_category_data

with app.app_context():
    rows = DocType.query.order_by(DocType.id).all()
    if not rows:
        print('No DocType rows found — running init_category_data() to repopulate.')
        try:
            init_category_data()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print('Failed to run init_category_data():', e)
    rows = DocType.query.order_by(DocType.id).all()
    print('DocType rows:')
    for r in rows:
        print(r.id, r.value, r.label)
