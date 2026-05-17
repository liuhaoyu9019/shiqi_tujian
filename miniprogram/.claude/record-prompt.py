import json
import sys
import os
import re

TARGET = 'd:/project/shiqi_tujian/miniprogram/用户指令记录.md'

try:
    # On Windows, stdin pipe may produce surrogate escapes; use buffer and decode
    raw = sys.stdin.buffer.read()
    data = json.loads(raw.decode('utf-8'))
    msg = data.get('prompt', '').strip()
    if not msg:
        sys.exit(0)

    num = 0
    if os.path.exists(TARGET):
        with open(TARGET, 'r', encoding='utf-8-sig') as f:
            for line in f:
                m = re.match(r'^(\d+)\.', line)
                if m:
                    num = max(num, int(m.group(1)))

    num += 1
    with open(TARGET, 'a', encoding='utf-8-sig') as f:
        f.write(f'{num}. {msg}\n')

except Exception:
    pass
