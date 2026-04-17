import sys
import traceback
print('START')
print('sys.path:')
for p in sys.path[:10]:
    print(p)
sys.stdout.flush()
try:
    import YSXS.utils 
    print('OK YSXS.utils', getattr(YSXS.utils, '__file__', None))

except Exception as e:
    traceback.print_exc()
    print('ERR', type(e).__name__, e)
    sys.stdout.flush()
