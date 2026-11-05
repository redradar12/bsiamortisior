"""HTML'de kullanilan gorselleri WebP'ye cevirir (max 1600px, kalite 82)."""
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
html_files = list(ROOT.glob("*.html"))

refs = set()
for h in html_files:
    refs.update(re.findall(r'src="(assets/[^"]+)"', h.read_text(encoding="utf-8")))

total_before = total_after = 0
for ref in sorted(refs):
    src = ROOT / ref
    if not src.exists() or src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
        continue
    out = src.with_suffix(".webp")
    total_before += src.stat().st_size

    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        total_after += out.stat().st_size
        continue

    with Image.open(src) as im:
        im = im.convert("RGBA") if im.mode in ("P", "LA") or "transparency" in im.info else im.convert("RGB")
        if im.width > 1600:
            h = round(im.height * 1600 / im.width)
            im = im.resize((1600, h), Image.LANCZOS)
        im.save(out, "WEBP", quality=82, method=6)

    total_after += out.stat().st_size
    print(f"{src.stat().st_size/1024:8.0f} KB -> {out.stat().st_size/1024:8.0f} KB  {out.name}")

print(f"\nTOPLAM: {total_before/1024/1024:.2f} MB -> {total_after/1024/1024:.2f} MB")
