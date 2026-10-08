#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BSİ Amortisör — Tek Dosya (Single-File) Demo Oluşturucu
======================================================
Bu script, sitenin anasayfasını CSS, JavaScript ve görseller tek bir HTML dosyasının
içine gömülü olacak şekilde paketler:  bsi-amortisor-demo.html

Ne işe yarar?
  • E-postayla tek dosya olarak göndermek, sunucusuz açmak, hızlı önizleme yapmak için.
  • Harici dosya isteği olmadığı için çevrimdışı da eksiksiz çalışır.

Kullanım:
    python3 tek-dosya-olustur.py

Not: Asıl site her zaman çok dosyalı sürümdür (index.html + css/ + js/ + assets/).
     İçerik değişikliği yaptıktan sonra bu script'i tekrar çalıştırın.
"""

import base64
import io
import os
import re
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, "bsi-amortisor") if os.path.isdir(os.path.join(ROOT, "bsi-amortisor")) else ROOT
CIKTI = os.path.join(SITE, "bsi-amortisor-demo.html")

# Demo dosyasında görselleri küçült (dosya boyutu için)
DEMO_GENISLIK = 760
DEMO_KALITE = 72


def veri_uri(dosya_yolu: str) -> str:
    """Bir görseli base64 data-URI'ye çevirir (gerekirse küçültür)."""
    if dosya_yolu.lower().endswith((".png", ".jpg", ".jpeg")):
        im = Image.open(dosya_yolu).convert("RGBA" if dosya_yolu.lower().endswith(".png") else "RGB")
        if im.width > DEMO_GENISLIK:
            oran = DEMO_GENISLIK / im.width
            im = im.resize((DEMO_GENISLIK, max(1, int(im.height * oran))), Image.LANCZOS)
        tampon = io.BytesIO()
        if dosya_yolu.lower().endswith(".png"):
            im.save(tampon, "PNG", optimize=True)
            mime = "image/png"
        else:
            im.save(tampon, "JPEG", quality=DEMO_KALITE, optimize=True, progressive=True)
            mime = "image/jpeg"
        b64 = base64.b64encode(tampon.getvalue()).decode()
    else:
        with open(dosya_yolu, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        mime = "application/octet-stream"
    return f"data:{mime};base64,{b64}"


def main() -> None:
    html_yolu = os.path.join(SITE, "index.html")
    with open(html_yolu, encoding="utf-8") as f:
        html = f.read()

    # 1) CSS dosyalarını göm
    def css_ile_esles(m):
        yol = os.path.join(SITE, m.group(1))
        with open(yol, encoding="utf-8") as f:
            return "<style>\n" + f.read() + "\n</style>"
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_ile_esles, html)

    # 2) JS dosyalarını göm
    def js_ile_esles(m):
        yol = os.path.join(SITE, m.group(1))
        with open(yol, encoding="utf-8") as f:
            return "<script>\n" + f.read() + "\n</script>"
    html = re.sub(r'<script src="([^"]+)"></script>', js_ile_esles, html)

    # 3) Görselleri data-URI yap (tekrarlananlar bir kez dönüştürülür)
    onbellek: dict = {}

    def varlik_uri(yol: str) -> str:
        if yol not in onbellek:
            tam = os.path.join(SITE, yol)
            onbellek[yol] = veri_uri(tam) if os.path.exists(tam) else yol
        return onbellek[yol]

    html = re.sub(r'src="(assets/[^"]+)"',
                  lambda m: 'src="%s"' % varlik_uri(m.group(1)), html)

    # favicon ve apple-touch-icon bağlantılarını da göm
    html = re.sub(r'(rel="(?:icon|apple-touch-icon)"[^>]*?)href="(assets/[^"]+)"',
                  lambda m: '%shref="%s"' % (m.group(1), varlik_uri(m.group(2))), html)

    # 4) Sayfa içi bağlantıları demo dosyasına uyarla
    html = html.replace('href="index.html"', 'href="#"')
    html = re.sub(r'href="(hakkimizda|urunler|iletisim)\.html([^"]*)"', r'href="#\2"', html)

    # 5) Demo olduğunu belirten küçük not + ön yükleyiciyi hızlı başlat
    html = html.replace(
        "</body>",
        '<!-- Bu dosya tek dosya (offline) demodur. Asıl site: index.html + css/ + js/ + assets/ -->\n</body>')

    with open(CIKTI, "w", encoding="utf-8") as f:
        f.write(html)

    boyut = os.path.getsize(CIKTI) / 1024 / 1024
    print(f"✓ Oluşturuldu: {CIKTI}")
    print(f"  Boyut: {boyut:.2f} MB | Gömülen görsel: {len(onbellek)}")


if __name__ == "__main__":
    main()
