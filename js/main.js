/* =====================================================================
   BSİ AMORTİSÖR — main.js
   • Hero "puzzle" girişi: 4 dikey blok tek tek aşağı iner ve kilitlenir
   • Kaydırma animasyonları, sayaçlar, menü, SSS, form
   Harici kütüphane kullanılmaz (Web Animations API + rAF).
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.documentElement.classList.remove('no-js');

  /* ===================================================================
     1. ÖN YÜKLEYİCİ
     =================================================================== */
  var booted = false;
  function preload(done) {
    var bar = doc.querySelector('.preloader__bar i');
    var el = doc.querySelector('.preloader');
    var t0 = performance.now();
    var finished = false;

    requestAnimationFrame(function tick(now) {
      var p = Math.min(100, ((now - t0) / 550) * 100);
      if (bar) bar.style.width = p + '%';
      if (p < 100) requestAnimationFrame(tick);
      else finish();
    });

    function finish() {
      if (finished) return;          // yalnızca BİR kez çalışır
      finished = true;
      if (el) el.classList.add('is-done');
      setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 700);
      done();
    }
    // Güvenlik ağı: bir şey ters giderse 3 sn sonra devam et
    setTimeout(finish, 2500);
  }

  /* ===================================================================
     2. HERO PUZZLE
     =================================================================== */
  var Puzzle = (function () {
    var root = doc.querySelector('.puzzle');
    if (!root) return { init: function () {} };

    var pieces = Array.prototype.slice.call(root.querySelectorAll('.piece'));
    var N = pieces.length;

    /* Tırnak bantları: her sınır için dikey aralık (yüksekliğin oranı) */
    var BOUNDS = [
      { b0: 0.24, b1: 0.47 },
      { b0: 0.50, b1: 0.73 },
      { b0: 0.22, b1: 0.45 }
    ];
    var RESIDUAL = 0.26;      // birleşme sonrası kalan tırnak oranı
    var state = { t: 0, tabMax: 0, slot: 0, w: 0, h: 0 };

    function measure() {
      var vw = Math.max(320, root.clientWidth);
      var h = root.clientHeight;
      var ratio = vw <= 720 ? 0.085 : 0.07;
      state.tabMax = Math.round(vw * ratio);
      state.w = vw;
      state.h = h;
      state.slot = Math.round(vw * 0.25);   // her bloğun görünür genişliği
    }

    /* Bloğun ölçülere göre kırpma poligonu (puzzle tırnakları) */
    function clipPath(i, t) {
      var x0 = 0;
      var xR = (i < N - 1) ? state.slot : state.w;   // düz sağ kenar
      var H = state.h;
      var p = [];
      p.push([x0, 0]);

      // --- sağ kenar: bu blok sağdaki komşusuna tırnak uzatır
      if (i < N - 1) {
        var r = BOUNDS[i];
        if (t > 0.5) {
          p.push([xR, Math.round(r.b0 * H)]);
          p.push([xR + t, Math.round(r.b0 * H)]);
          p.push([xR + t, Math.round(r.b1 * H)]);
          p.push([xR, Math.round(r.b1 * H)]);
        }
        p.push([xR, H]);
      } else {
        p.push([xR, H]);
      }

      p.push([x0, H]);

      // --- sol kenar: soldaki komşunun tırnağı için girinti
      if (i > 0 && t > 0.5) {
        var l = BOUNDS[i - 1];
        p.push([x0, Math.round(l.b1 * H)]);
        p.push([t, Math.round(l.b1 * H)]);
        p.push([t, Math.round(l.b0 * H)]);
        p.push([x0, Math.round(l.b0 * H)]);
      }
      return 'polygon(' + p.map(function (pt) { return pt[0] + 'px ' + pt[1] + 'px'; }).join(', ') + ')';
    }

    function apply() {
      for (var i = 0; i < N; i++) {
        pieces[i].style.clipPath = clipPath(i, state.t);
        pieces[i].style.webkitClipPath = pieces[i].style.clipPath;
      }
    }

    /* Kırpma değerini yumuşak şekilde değiştir (rAF tween) */
    function tween(from, to, dur, ease, onUpdate, onDone) {
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = ease ? ease(p) : p;
        onUpdate(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(step);
        else if (onDone) onDone();
      })(t0);
    }
    var easeOutExpo = function (p) { return p === 1 ? 1 : 1 - Math.pow(2, -10 * p); };
    var easeInOutCubic = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };

    function run(onFinished) {
      measure();
      state.t = state.tabMax;
      apply();

      if (reduceMotion) {
        state.t = state.tabMax * RESIDUAL;
        apply();
        root.classList.add('is-assembled');
        onFinished();
        return;
      }

      var completed = 0;
      pieces.forEach(function (piece, i) {
        var img = piece.querySelector('img');
        var d = i * 140;            // kademeli iniş
        var dur = 900;
        piece.style.transform = 'translateY(-108%)';
        piece.getAnimations && piece.getAnimations().forEach(function (a) { a.cancel(); });

        var anim = piece.animate(
          [
            { transform: 'translateY(-108%)' },
            { transform: 'translateY(0)' }
          ],
          { duration: dur, delay: d, easing: 'cubic-bezier(.16,.9,.24,1)', fill: 'both' }
        );
        anim.onfinish = function () {
          piece.style.transform = 'translateY(0)';
          completed++;
          if (completed === N) resolve();
        };
        // Görselin hafif yakınlaşması (derinlik hissi)
        if (img && !reduceMotion) {
          img.animate(
            [{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
            { duration: 1900, delay: d, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
          );
        }
      });

      // Tüm bloklar indikten sonra tırnaklar birleşir
      function resolve() {
        var start = performance.now();
        tween(state.tabMax, state.tabMax * RESIDUAL, 720, easeInOutCubic, function (v) {
          state.t = v;
          apply();
          // blokları yatayda hafifçe yerine oturt
          var k = (v - state.tabMax * RESIDUAL) / Math.max(1, state.tabMax * (1 - RESIDUAL));
          for (var i = 0; i < N; i++) {
            var dir = (i % 2 === 0) ? 1 : -1;
            pieces[i].style.transform = 'translateY(0) translateX(' + (dir * k * state.tabMax * 0.22).toFixed(2) + 'px)';
          }
        }, function () {
          state.t = state.tabMax * RESIDUAL;
          apply();
          for (var i = 0; i < N; i++) pieces[i].style.transform = 'translateY(0)';
          root.classList.add('is-assembled');
          void start;
          onFinished();
        });
      }
    }

    window.addEventListener('resize', function () {
      var prevSlot = state.slot;
      var prevT = state.t;
      measure();
      if (!prevSlot || prevSlot === state.slot) { apply(); return; }
      // Yeni ölçülere göre tırnağı oranla güncelle
      state.t = state.tabMax * (prevT / (prevSlot * 0.28) || 0);
      state.t = Math.min(state.tabMax, Math.max(state.tabMax * RESIDUAL, state.tabMax * (prevT > state.tabMax * RESIDUAL ? RESIDUAL : 0)));
      apply();
    });

    return { init: function (cb) { run(cb); } };
  })();

  /* ===================================================================
     3. KAYDIRMA İLE GÖRÜNÜR OLMA
     =================================================================== */
  function initReveal() {
    var items = doc.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* Kademeli gecikme yardımcı: [data-delay-group] içindeki çocuklara --rd ekler */
  function staggerGroups() {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-stagger]'), function (group) {
      var step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (child.hasAttribute('data-reveal')) child.style.setProperty('--rd', (i * step) + 'ms');
      });
    });
  }

  /* ===================================================================
     4. SAYAÇLAR
     =================================================================== */
  function initCounters() {
    var els = doc.querySelectorAll('[data-count]');
    if (!els.length) return;
    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dec = (el.getAttribute('data-dec') | 0);
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1500, t0 = performance.now();
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        var val = target * e;
        el.textContent = (dec ? val.toFixed(dec) : Math.round(val).toLocaleString('tr-TR')) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(els, function (el) {
        el.textContent = (el.getAttribute('data-dec') ? parseFloat(el.getAttribute('data-count')).toFixed(1) : Math.round(parseFloat(el.getAttribute('data-count'))).toLocaleString('tr-TR')) + (el.getAttribute('data-suffix') || '');
      });
      return;
    }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ===================================================================
     5. HEADER / MENÜ / YUKARI ÇIK
     =================================================================== */
  function initChrome() {
    var header = doc.querySelector('.header');
    var totop = doc.querySelector('.totop');
    var burger = doc.querySelector('.burger');

    function onScroll() {
      var y = window.pageYOffset || doc.documentElement.scrollTop;
      if (header) header.classList.toggle('is-stuck', y > 60);
      if (totop) totop.classList.toggle('is-on', y > 700);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (totop) totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    if (burger) burger.addEventListener('click', function () {
      var open = doc.body.classList.toggle('menu-open');
      doc.body.classList.toggle('is-locked', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Mobil menüden link seçildiğinde kapat
    Array.prototype.forEach.call(doc.querySelectorAll('.mobile-menu a'), function (a) {
      a.addEventListener('click', function () {
        doc.body.classList.remove('menu-open', 'is-locked');
      });
    });

    // Yıl
    Array.prototype.forEach.call(doc.querySelectorAll('[data-year]'), function (el) {
      el.textContent = new Date().getFullYear();
    });

    // Aktif menü bağlantısı
    var here = location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(doc.querySelectorAll('.nav a'), function (a) {
      var href = a.getAttribute('href');
      if (href === here) a.classList.add('is-active');
    });
  }

  /* ===================================================================
     6. SSS AKORDEON
     =================================================================== */
  function initFaq() {
    Array.prototype.forEach.call(doc.querySelectorAll('.faq__item'), function (item) {
      var q = item.querySelector('.faq__q');
      var a = item.querySelector('.faq__a');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        // grubu kapat
        var parent = item.parentNode;
        if (parent) Array.prototype.forEach.call(parent.querySelectorAll('.faq__item'), function (o) {
          o.classList.remove('is-open');
          var oa = o.querySelector('.faq__a'); if (oa) oa.style.maxHeight = '0px';
        });
        if (!open) {
          item.classList.add('is-open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
  }

  /* ===================================================================
     7. FORM DOĞRULAMA (statik site — sunucu yok)
     =================================================================== */
  function initForms() {
    Array.prototype.forEach.call(doc.querySelectorAll('form[data-form]'), function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (f) {
          var field = f.closest('.field') || f.parentNode;
          var empty = !f.value || (f.type === 'checkbox' && !f.checked);
          if (f.type === 'email' && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) empty = true;
          field.classList.toggle('has-err', empty);
          if (empty) ok = false;
        });
        if (!ok) {
          var first = form.querySelector('.has-err input, .has-err textarea, .has-err select');
          if (first) first.focus();
          return;
        }
        Array.prototype.forEach.call(form.querySelectorAll('.has-err'), function (f) { f.classList.remove('has-err'); });
        var msg = form.querySelector('.form__ok');
        if (msg) msg.classList.add('is-on');
        form.reset();
        if (msg) msg.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        // Gerçek gönderim için: form.action tanımlayıp e.preventDefault() satırını kaldırın
        // veya buraya fetch() ile kendi servis entegrasyonunuzu ekleyin.
      });
      Array.prototype.forEach.call(form.querySelectorAll('input, textarea, select'), function (f) {
        f.addEventListener('input', function () {
          var field = f.closest('.field');
          if (field) field.classList.remove('has-err');
        });
      });
    });
  }

  /* ===================================================================
     8. HAFİF PARALAKS (hero görselleri)
     =================================================================== */
  function initParallax() {
    var imgs = doc.querySelectorAll('.piece img');
    if (!imgs.length || reduceMotion || window.innerWidth < 720) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.pageYOffset;
        if (y < window.innerHeight) {
          Array.prototype.forEach.call(imgs, function (img, i) {
            var depth = 0.05 + (i % 2) * 0.03;
            img.style.transform = 'translateY(' + (y * depth).toFixed(1) + 'px) scale(1.06)';
          });
          var veil = doc.querySelector('.puzzle__veil');
          if (veil) veil.style.opacity = String(Math.min(1, 0.35 + y / (window.innerHeight * 1.1)));
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ===================================================================
     BAŞLAT
     =================================================================== */
  function boot() {
    if (booted) return;
    booted = true;
    staggerGroups();
    initReveal();
    initCounters();
    initChrome();
    initFaq();
    initForms();
    initParallax();

    var hero = doc.querySelector('.hero__inner');
    var scrollHint = doc.querySelector('.hero__scroll');
    var header = doc.querySelector('.header');

    function heroIn() {
      if (hero) hero.classList.add('is-in');
      if (scrollHint) scrollHint.classList.add('is-in');
      if (header) header.classList.add('is-ready');
      doc.body.classList.remove('is-locked');
    }

    if (!reduceMotion) doc.body.classList.add('is-locked');

    if (doc.querySelector('.puzzle')) {
      Puzzle.init(function () {
        setTimeout(heroIn, 100);
      });
    } else {
      setTimeout(heroIn, 150);
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () {
    preload(boot);
  });
  else preload(boot);
})();
