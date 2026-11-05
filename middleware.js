// =====================================================================
// Vercel Edge Middleware — hotlink + bot + IP/ülke koruması
// Statik dosyaların başka siteler tarafından gömülmesini (hotlink),
// agresif bot/scraper trafiğini ve istenmeyen IP/ülkeleri engeller.
// Bu, CDN (bant genişliği) tüketimini azaltmak için en etkili katmandır.
// =====================================================================

export const config = { matcher: ['/:path*'] };

// Engellenecek botlar (arama motoru değil; AI kazıyıcılar + SEO/spam araçları)
var BOTS = [
  'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai', 'perplexitybot',
  'cohere-ai', 'ccbot', 'bytespider', 'amazonbot', 'google-extended',
  'googleother', 'meta-externalagent', 'imagesiftbot', 'applebot-extended',
  'diffbot', 'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'petalbot',
  'rogerbot', 'exabot', 'turnitinbot', 'scrapy', 'curl', 'python-requests',
  'axios', 'okhttp', 'go-http-client', 'headlesschrome', 'phantomjs'
];

// Kalıcı olarak engellenecek IP'ler (Vercel Analytics'te en çok bant yiyen
// adresleri buraya ekleyin). Örnek: '103.21.244.10'
var DENY_IPS = [
  // '1.2.3.4'
];

// Engellenecek ülkeler (ISO kod). Boş bırakılırsa devre dışı.
// Müşterileriniz ağırlıklı Türkiye ise örnek: ['RU','CN','HK','SG']
var DENY_COUNTRIES = [
  // 'RU', 'CN'
];

// Hotlink korumasının geçerli sayacağı alan adları
var ALLOWED_HOSTS = ['bsiamortisor.com', 'vercel.app'];

export default function middleware(request) {
  try {
    var url = new URL(request.url);
    var host = url.hostname;

    // ---- 1) Hotlink koruması (yalnızca /assets/ altındaki dosyalar) ----
    if (url.pathname.indexOf('/assets/') === 0) {
      var ref = request.headers.get('referer') || '';
      if (ref) {
        try {
          var refHost = new URL(ref).hostname;
          var allow = refHost === host || refHost === 'www.' + host;
          if (!allow) {
            for (var i = 0; i < ALLOWED_HOSTS.length; i++) {
              var h = ALLOWED_HOSTS[i];
              if (refHost === h || refHost.slice(-(h.length + 1)) === '.' + h) { allow = true; break; }
            }
          }
          if (!allow) return new Response('Hotlink forbidden', { status: 403 });
        } catch (e) { /* bozuk referer — geç */ }
      }
    }

    // ---- 2) Bot / scraper engelleme ----
    var ua = (request.headers.get('user-agent') || '').toLowerCase();
    for (var j = 0; j < BOTS.length; j++) {
      if (ua.indexOf(BOTS[j]) !== -1) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    // ---- 3) IP engelleme ----
    var ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim();
    if (ip && DENY_IPS.indexOf(ip) !== -1) {
      return new Response('Forbidden', { status: 403 });
    }

    // ---- 4) Ülke engelleme ----
    var country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
    if (country && DENY_COUNTRIES.indexOf(country) !== -1) {
      return new Response('Forbidden', { status: 403 });
    }
  } catch (e) {
    // Güvenlik katmanı hata verirse siteyi kilitleme
  }

  // İstek normal şekilde devam etsin
  return undefined;
}
