# -*- coding: utf-8 -*-
from pathlib import Path
text = Path('app.py').read_text(encoding='utf-8')
start = text.index('\ndef parse_pdf')
end = text.index("# 检索接口", start)
text = text[:start] + text[end:]
Path('app.py').write_text(text, encoding='utf-8')
