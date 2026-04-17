import sqlite3
from datetime import datetime

db_path = r"G:\GitHub\个人主页\yshome\YSXS\ysxs.db"
new_email = "ysp@cug.edu.cn"

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("""
    UPDATE user
       SET email = ?,
           email_confirmed_at = ?
     WHERE role = 'super admin'
""", (new_email, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")))
conn.commit()
conn.close()
print("超级管理员邮箱及验证状态已更新。")
