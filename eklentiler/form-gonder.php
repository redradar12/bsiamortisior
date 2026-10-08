<?php
/* =====================================================================
   BSİ AMORTİSÖR — İletişim / Teklif Formu İşleyicisi
   ---------------------------------------------------------------------
   KURULUM
   1) Bu dosyayı sitenin kök dizinine yükleyin (index.html ile aynı yere).
   2) Aşağıdaki $alici adresini kendi e-posta adresinizle değiştirin.
   3) HTML formlarını şu şekilde güncelleyin:
        <form class="form" action="form-gonder.php" method="post" data-form novalidate>
      ve js/main.js içindeki  e.preventDefault();  satırını kaldırın.
   ===================================================================== */

$alici      = "info@bsiamortisor.com";        // ← Formların düşeceği e-posta adresi
$site_adi   = "BSİ Amortisör";
$gonderildi = "tesekkurler.html";             // Başarılı gönderimden sonra açılacak sayfa (yoksa boş bırakın)

/* ---------- Gelen veriler ---------- */
$ad      = isset($_POST['ad'])      ? strip_tags(trim($_POST['ad']))      : '';
$firma   = isset($_POST['firma'])   ? strip_tags(trim($_POST['firma']))   : '';
$telefon = isset($_POST['telefon']) ? strip_tags(trim($_POST['telefon'])) : '';
$eposta  = isset($_POST['eposta'])  ? strip_tags(trim($_POST['eposta']))  : '';
$konu    = isset($_POST['konu'])    ? strip_tags(trim($_POST['konu']))    : '';
$mesaj   = isset($_POST['mesaj'])   ? strip_tags(trim($_POST['mesaj']))   : '';

/* ---------- Basit doğrulama ---------- */
if ($ad === '' || $telefon === '' || $mesaj === '' || !filter_var($eposta, FILTER_VALIDATE_EMAIL)) {
    header("Location: " . ($_SERVER['HTTP_REFERER'] ?? "iletisim.html") . "?hata=1");
    exit;
}

/* ---------- Spam kontrolü (basit) ---------- */
if (preg_match('/(https?:\/\/|<a\s|\[url)/i', $mesaj)) {
    header("Location: " . ($_SERVER['HTTP_REFERER'] ?? "iletisim.html") . "?hata=2");
    exit;
}

/* ---------- E-posta içeriği ---------- */
$baslik  = "=?UTF-8?B?" . base64_encode("$site_adi — Yeni Form Mesajı: $konu") . "?=";
$govde   = "Yeni bir form mesajı alındı.\n\n"
         . "Ad Soyad   : $ad\n"
         . "Firma      : " . ($firma !== '' ? $firma : '-') . "\n"
         . "Telefon    : $telefon\n"
         . "E-posta    : $eposta\n"
         . "Konu       : $konu\n"
         . "----------------------------------------\n"
         . "Mesaj:\n$mesaj\n\n"
         . "----------------------------------------\n"
         . "IP         : " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n"
         . "Tarih      : " . date('d.m.Y H:i') . "\n";

$headers = "MIME-Version: 1.0\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "From: $site_adi <no-reply@" . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'bsiamortisor.com') . ">\r\n"
         . "Reply-To: $ad <$eposta>\r\n"
         . "X-Mailer: PHP/" . phpversion();

/* ---------- Gönder ---------- */
$sonuc = @mail($alici, $baslik, $govde, $headers);

if ($gonderildi !== '') {
    header("Location: $gonderildi");
} else {
    header("Content-Type: text/html; charset=UTF-8");
    echo $sonuc
        ? "<meta charset='utf-8'><h2 style='font-family:sans-serif'>Teşekkürler, mesajınız alındı.</h2><p style='font-family:sans-serif'><a href='index.html'>&larr; Anasayfaya dön</a></p>"
        : "<meta charset='utf-8'><h2 style='font-family:sans-serif'>Mesaj gönderilemedi.</h2><p style='font-family:sans-serif'>Lütfen doğrudan arayın: +90 544 150 08 04</p>";
}
exit;
?>
