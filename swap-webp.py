"""HTML icindeki <img src> referanslarini mevcut .webp dosyalarina cevirir."""
import re
from pathlib import Path

changed = 0
for h in Path(".").glob("*.html"):
    txt = h.read_text(encoding="utf-8")

    def repl(m):
        p = m.group(1)
        w = Path(p).with_suffix(".webp")
        return f'src="{w.as_posix()}"' if w.exists() else m.group(0)

    new = re.sub(r'src="(assets/[^"]+)"', repl, txt)
    if new != txt:
        h.write_text(new, encoding="utf-8", newline="")
        changed += 1
        print("guncellendi:", h.name)
print("dosya:", changed)
