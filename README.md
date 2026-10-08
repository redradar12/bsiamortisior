# BSİ AMORTİSÖR — Kurumsal Web Sitesi

Statik (HTML + CSS + JavaScript) kurumsal web sitesi. Sunucu tarafı gerektirmez; herhangi bir
hosting'e (cPanel, FTP, Netlify, Vercel, GitHub Pages) doğrudan yüklenebilir.

Hazırlanma tarihi: 16 Eylül 2026

---

## 1. Dosya Yapısı

```
bsi-amortisor/
├── index.html          → Anasayfa (puzzle animasyonlu hero + tüm bölümler)
├── urunler.html        → Ürünler (6 ürün grubu + teknik tablolar)
├── hakkimizda.html     → Kurumsal tanıtım, değerler, kalite politikası
├── iletisim.html       → İletişim bilgileri, form, yol tarifi
├── 404.html            → Bulunamadı sayfası
├── tesekkurler.html    → Form gönderimi sonrası teşekkür sayfası
├── bsi-amortisor-demo.html  → TEK DOSYA demo (tüm site gömülü, sunucusuz açılır)
├── tek-dosya-olustur.py     → Yukarıdaki tek dosyayı üreten script
├── robots.txt          → Arama motoru ayarları
├── sitemap.xml         → Site haritası (SEO)
├── manifest.webmanifest→ Mobil uygulama/sekme ayarları
├── eklentiler/
│   └── form-gonder.php → Formu e-postaya bağlayan hazır PHP dosyası
├── css/
│   ├── fonts.css       → Gömülü (base64) Barlow + Barlow Condensed fontları
│   └── style.css       → Tüm görsel tasarım ve animasyonlar
├── js/
│   └── main.js         → Puzzle animasyonu, kaydırma efektleri, form, menü
└── assets/
    ├── img/            → Sitedeki tüm görseller (JPG)
    │   ├── logo.png            (koyu zemin için, kırmızı + beyaz)
    │   ├── logo-dark-text.png  (açık zemin üzerine koyu metinli sürüm)
    │   ├── favicon.png         (sekme simgesi)
    │   ├── hero-1…4.jpg        (hero puzzle görselleri)
    │   └── s1…s10.jpg          (bölüm ve ürün görselleri)
    ├── logo-orjinal.png        (size ait orijinal logo dosyası)
    ├── logo-trim.png           (kenarları kırpılmış logo)
    ├── onizleme-ust.jpg        (ekran görüntüsü — üst bölüm)
    └── onizleme-tam-sayfa.jpg  (ekran görüntüsü — sayfanın tamamı)
└── kaynak-gorseller/   → Görsellerin küçültülmemiş orijinal (yüksek çözünürlüklü) halleri
                          (baskı, katalog veya farklı kırpma işleri için)
```

---

## 2. Açılış Animasyonu (isteğiniz olan "puzzle" efekti)

Anasayfa açıldığında:

1. Siyah zemin üzerinde logo ve ince yükleme çizgisi görünür (~0,7 sn).
2. Ekran dikey olarak **4 bloğa** bölünmüş şekilde, bloklar **tek tek yukarıdan aşağı iner**
   (soldan sağa 0,16 sn arayla kademeli).
3. Her bloğun kenarında **puzzle (yapboz) tırnağı** vardır; bloklar inerken tırnaklar komşu
   bloğun girintisine oturur ve **puzzle gibi birleşir**.
4. Bloklar yerine oturunca görsel hafifçe uzaklaşır (zoom-out), üzerine koyu katman biner ve
   başlık – alt metin – butonlar sırayla alttan yukarı doğru açılır.
5. Bu arada üst menü yukarıdan iner.

Teknik notlar:
* Animasyon **Web Animations API** + `clip-path: polygon()` ile yapılır; harici kütüphane yok.
* Puzzle tırnakları ekran genişliğine göre ölçeklenir (masaüstü %7, mobil %8,5).
* Birleşme sonrası kenarlarda **hafif tırnak izi** kalır — "birleşmiş puzzle" hissi korunur.
  Tamamen düz kenar isterseniz: `js/main.js` içinde `var RESIDUAL = 0.34;` değerini `0` yapın.
* "Hareketi azalt" (prefers-reduced-motion) ayarı açık olan kullanıcılarda animasyon otomatik
  olarak devre dışı kalır, sayfa doğrudan birleşmiş hâlde açılır.

**Hero görsellerini değiştirmek için:** `assets/img/hero-1.jpg … hero-4.jpg` dosyalarını
kendi 3:4 (dikey) fotoğraflarınızla değiştirin. İdeal ölçü: **760 × 1135 px**. Dosya adlarını
aynı bırakmanız yeterlidir.

---

## 3. İçerik Güncelleme

### 3.1 İletişim bilgileri (tek seferde güncellenecek yerler)

| Bilgi | Nerelerde geçiyor |
|---|---|
| Telefon `+90 544 150 08 04` | 4 sayfada header, mobil menü, iletişim bölümü, footer, WhatsApp butonu |
| E-posta `info@bsiamortisor.com` | 4 sayfada iletişim bölümü ve footer |
| Adres | 4 sayfada iletişim bölümü ve footer |
| Çalışma saatleri | index.html ve iletisim.html "Çalışma Saatleri" kartı |

> İpucu: Bir metin düzenleyicide (VS Code, Notepad++) klasörde **"Tümünü değiştir"**
> yaparak telefon ve e-postayı tek seferde güncelleyebilirsiniz.

### 3.2 Menüye sayfa eklemek
`<nav class="nav">` bloğuna yeni `<a href="yeni-sayfa.html">Başlık</a>` satırı ekleyin.
Aynı satırı her sayfadaki `nav` ve `.mobile-menu` bloklarına da eklemeyi unutmayın.

### 3.3 Renk değiştirmek
`css/style.css` dosyasının en başındaki `:root` bloğu tüm renkleri yönetir:

```css
--red:  #E3000E;   /* kurumsal kırmızı (logodan alındı) */
--ink:  #0A0C0F;   /* ana siyah */
--steel:#455361;   /* logodaki gri */
```

---

## 4. ⚠️ YAYINA ALMADAN ÖNCE DOĞRULANMASI GEREKEN BİLGİLER

Aşağıdaki içerikler **taslak/örnek** olarak yazılmıştır. Firmanıza ait gerçek bilgilerle
güncellemeniz gerekir:

1. **Rakamlar** — "1.500+ ton yıllık üretim", "45+ uzman teknisyen", "30+ ülkeye ihracat",
   "15+ yıllık tecrübe", "%98 zamanında teslim". (`data-count` değerleri HTML içindedir.)
2. **Belgeler** — ISO 9001 / 14001 / 45001 ve CE ifadeleri `hakkimizda.html` içinde
   "Kalite Politikamız" bölümündedir. Elinizde olmayan belgeyi **kaldırın**.
3. **Teknik tablolar** — `urunler.html` içindeki kuvvet (N), çap, strok ve sıcaklık
   aralıkları örnektir; gerçek üretim değerlerinizle değiştirin.
4. **Ürün fotoğrafları** — Sitedeki görseller, isteğiniz üzerine **yapay zekâ ile üretilmiş**
   temsili endüstriyel fotoğraflardır. Kendi ürün ve tesis fotoğraflarınızla değiştirmeniz
   marka güvenilirliği açısından önerilir:
   * Ürün fotoğrafları → `assets/img/s1.jpg … s10.jpg` (ideal: 900 × 1341 px, dikey)
   * Hero görselleri → `assets/img/hero-1…4.jpg` (760 × 1135 px, dikey)
5. **Sosyal medya bağlantıları** — footer'daki Instagram / LinkedIn adresleri şu an genel
   adreslere gider; kendi hesap linklerinizi yazın.
6. **Harita** — "Haritada aç" butonu, adresi Google Haritalar aramasında açar. Kesin konum
   için koordinat eklemek isterseniz linkteki adres metnini değiştirin.

---

## 5. Formu Çalışır Hale Getirmek

`index.html` ve `iletisim.html` içindeki formlar şu an **yalnızca tarayıcıda doğrulama** yapar,
veriyi hiçbir yere göndermez (statik site). Sunucuya bağlamak için 3 seçenek:

### Seçenek A — PHP (cPanel / Plesk hosting varsa, en kolay)
1. `eklentiler/form-gonder.php` dosyasını sitenin kök dizinine yükleyin.
2. Dosyanın başındaki `$alici` değişkenine kendi e-posta adresinizi yazın.
3. Her iki HTML dosyasındaki `<form class="form" data-form novalidate>` etiketini şöyle
   değiştirin:
   ```html
   <form class="form" action="form-gonder.php" method="post" data-form novalidate>
   ```
4. `js/main.js` içinde form gönderiminde `e.preventDefault();` satırını silin
   (böylece form gerçekten sunucuya gider).

### Seçenek B — Form servisi (kod yazmadan)
Formspree, Web3Forms vb. servislerden birine kayıt olup aynı yöntemle
`action="https://formspree.io/f/KODUNUZ"` yazmanız yeterlidir.

### Seçenek C — WhatsApp'a yönlendirme
Formu tamamen kaldırıp "Teklif Al" butonunu
`https://wa.me/905441500804?text=...` adresine yönlendirebilirsiniz (sitede hazır WhatsApp
butonu mevcuttur).

---

## 6. Yayına Alma

1. Klasördeki **tüm dosyaları** hosting'inizin `public_html` (veya `www`) dizinine yükleyin.
2. Alan adınız `bsiamortisor.com` kök dizine bağlıysa `https://www.bsiamortisor.com/`
   açıldığında site görünür.
3. `sitemap.xml` ve `robots.txt` içindeki alan adının doğru olduğundan emin olun.
4. Google Search Console'a siteyi ekleyip sitemap'i bildirin.
5. **HTTPS** (SSL) sertifikasını aktif edin — hosting panellerinde genellikle ücretsizdir.

---

## 7. Performans ve Uyumluluk

* Harici bağlantı yok: fontlar dosya içine gömülü olduğu için sayfa internet olmadan da
  doğru görünür; CDN, jQuery veya Bootstrap kullanılmaz.
* Görseller web için optimize edilmiştir (toplam ~2,2 MB); hero görselleri öncelikli yüklenir.
* Mobil, tablet, masaüstü ve 4K ekranlarda test edilmiştir (390 px – 1920 px+).
* Chrome, Edge, Firefox, Safari ve mobil tarayıcılarda çalışır.
* JavaScript kapalıysa da site okunabilir kalır (animasyonlar devre dışı, içerik görünür).
* SEO: her sayfada özgün başlık/açıklama, Open Graph etiketleri, yapılandırılmış veri
  (LocalBusiness), semantik başlık hiyerarşisi.

---

## 8. Sık Sorulan Teknik Sorular

**Logo değişecek mi?** Hayır. Daha önce yaptığınız sitedeki (`bsiamortisor.com`) orijinal
logo dosyanız kullanıldı; `assets/logo-orjinal.png` olarak da yedeklendi.

**Açık zemin üzerinde logo gerekirse?** `assets/img/logo-dark-text.png` hazır duruyor
(beyaz yazılar koyu grafit renge çevrilmiştir).

**Animasyon hızını değiştirebilir miyim?** Evet:
* Blokların iniş süresi: `js/main.js` → `var dur = 1050;`
* Bloklar arası gecikme: `var d = i * 165;`
* Birleşme süresi: `tween(..., 820, ...)`

**Sayfaya yeni bir animasyon bloğu eklemek?** Eklediğiniz bölüme `data-reveal` özniteliği
vermeniz yeterlidir (`data-reveal="fade|left|right|zoom"`). Kademeli gecikme için kapsayıcıya
`data-stagger="90"` ekleyin.
