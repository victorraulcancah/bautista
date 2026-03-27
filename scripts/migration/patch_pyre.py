import glob
import os

files = glob.glob('C:/Users/victorraul/Documents/Laravel/bautista/scripts/migration/**/*.py', recursive=True)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '# pyre-ignore[21]' not in content:
        content = content.replace('from config import', '# pyre-ignore[21]\nfrom config import')
        content = content.replace('import modules.core', '# pyre-ignore[21]\nimport modules.core')
        content = content.replace('import modules.academic', '# pyre-ignore[21]\nimport modules.academic')
        content = content.replace('import modules.users', '# pyre-ignore[21]\nimport modules.users')
        content = content.replace('import modules.institutional', '# pyre-ignore[21]\nimport modules.institutional')
        content = content.replace('import modules.messaging', '# pyre-ignore[21]\nimport modules.messaging')
        content = content.replace('import modules.payments', '# pyre-ignore[21]\nimport modules.payments')
    
    content = content.replace('inserted = skipped = errors = 0', 'inserted: int = 0\n    skipped: int = 0\n    errors: int = 0')
    content = content.replace('inserted = skipped = 0', 'inserted: int = 0\n    skipped: int = 0')
    
    content = content.replace('str(pag_fecha_raw)[:10]', 'str(pag_fecha_raw)[:10]  # pyre-ignore[6, 43]')
    
    old_fstr = "log.ok(f\"  mensaje_id={r['mensaje_id']} asunto='{str(r.get('asunto',''))[:40]}'\")"
    new_fstr = "asunto_str = str(r.get('asunto',''))\n            log.ok(f\"  mensaje_id={r['mensaje_id']} asunto='{asunto_str[:40]}'\")  # pyre-ignore[6, 43]"
    content = content.replace(old_fstr, new_fstr)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Patch applied successfully.')
