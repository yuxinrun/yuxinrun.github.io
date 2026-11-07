/* ==========================================================================
   鱼心快跑 · yuxin.run — interactions
   Vanilla JS. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Language (zh / en) ---------- */
  var LANG_KEY = 'yr-lang';

  var META_I18N = {
    zh: {
      title: '鱼心快跑 · 鱼心 | AI Agent 工程师',
      siteName: '鱼心快跑',
      desc: '鱼心，AI Agent 工程师，「鱼心快跑，Bug 追不到」。这里有他写下的 25 个站点：Agent 工程手册、工程模式手册，以及睡眠、养育、减脂与算法的生活指南。',
      ogDesc: '鱼心快跑，Bug 追不到。25 个站点：Agent 工程手册、工程模式手册，以及睡眠、养育、减脂与算法的生活指南。',
      twDesc: '鱼心快跑，Bug 追不到。一个专注 AI Agent 与工程效率的程序员。',
      imageAlt: '鱼心快跑，Bug 追不到。',
      locale: 'zh_CN'
    },
    en: {
      title: 'Yuxin Run · Yuxin | AI Agent Engineer',
      siteName: 'Yuxin Run',
      desc: 'Yuxin is an AI agent engineer whose motto is “Yuxin runs, bugs can’t catch up”. 25 hand-written sites: agent engineering manuals, engineering pattern guides, and life guides on sleep, parenting, fat loss and algorithms.',
      ogDesc: 'Yuxin runs, bugs can’t catch up. 25 sites: agent engineering manuals, pattern guides, and life guides.',
      twDesc: 'Yuxin runs, bugs can’t catch up. A programmer focused on AI agents and engineering efficiency.',
      imageAlt: 'Yuxin runs, bugs can’t catch up.',
      locale: 'en_US'
    }
  };

  var UI_TEXT = {
    zh: {
      langAria: 'Switch to English',
      themeToDark: '切换到深色主题',
      themeToLight: '切换到浅色主题',
      menuOpen: '打开菜单',
      menuClose: '关闭菜单',
      copied: '邮箱已复制：',
      copyFail: '请手动复制：'
    },
    en: {
      langAria: '切换到中文',
      themeToDark: 'Switch to dark theme',
      themeToLight: 'Switch to light theme',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      copied: 'Email copied: ',
      copyFail: 'Copy manually: '
    }
  };

  function currentLang() { return root.dataset.lang === 'en' ? 'en' : 'zh'; }
  function t() { return UI_TEXT[currentLang()]; }

  function setMetaContent(selector, value) {
    var el = $(selector);
    if (el) el.setAttribute('content', value);
  }

  /* Every translatable node keeps its Chinese copy in data-zh(-html / -label),
     captured once on first switch so round-tripping never loses markup. */
  function applyLang(lang, persist) {
    var isEn = lang === 'en';
    root.dataset.lang = isEn ? 'en' : 'zh';
    root.lang = isEn ? 'en' : 'zh-CN';

    $$('[data-en]').forEach(function (el) {
      if (el.getAttribute('data-zh') === null) el.setAttribute('data-zh', el.textContent);
      el.textContent = isEn ? el.getAttribute('data-en') : el.getAttribute('data-zh');
    });

    $$('[data-en-html]').forEach(function (el) {
      if (el.getAttribute('data-zh-html') === null) el.setAttribute('data-zh-html', el.innerHTML);
      el.innerHTML = isEn ? el.getAttribute('data-en-html') : el.getAttribute('data-zh-html');
    });

    $$('[data-en-label]').forEach(function (el) {
      if (el.getAttribute('data-zh-label') === null) el.setAttribute('data-zh-label', el.getAttribute('aria-label') || '');
      el.setAttribute('aria-label', isEn ? el.getAttribute('data-en-label') : el.getAttribute('data-zh-label'));
    });

    $$('[data-en-alt]').forEach(function (el) {
      if (el.getAttribute('data-zh-alt') === null) el.setAttribute('data-zh-alt', el.getAttribute('alt') || '');
      el.setAttribute('alt', isEn ? el.getAttribute('data-en-alt') : el.getAttribute('data-zh-alt'));
    });

    var meta = META_I18N[isEn ? 'en' : 'zh'];
    document.title = meta.title;
    setMetaContent('meta[name="description"]', meta.desc);
    setMetaContent('meta[property="og:site_name"]', meta.siteName);
    setMetaContent('meta[property="og:title"]', meta.title);
    setMetaContent('meta[property="og:description"]', meta.ogDesc);
    setMetaContent('meta[property="og:locale"]', meta.locale);
    setMetaContent('meta[property="og:image:alt"]', meta.imageAlt);
    setMetaContent('meta[name="twitter:title"]', meta.title);
    setMetaContent('meta[name="twitter:description"]', meta.twDesc);

    if (langBtn) {
      langBtn.setAttribute('aria-pressed', isEn ? 'true' : 'false');
      langBtn.setAttribute('aria-label', t().langAria);
      var label = $('.lang-label', langBtn);
      if (label) label.textContent = isEn ? '中' : 'EN';
    }

    if (themeBtn) {
      themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? t().themeToLight : t().themeToDark);
    }

    if (menuBtn && menu) {
      menuBtn.setAttribute('aria-label', menu.classList.contains('is-open') ? t().menuClose : t().menuOpen);
    }

    if (persist) {
      try { localStorage.setItem(LANG_KEY, isEn ? 'en' : 'zh'); } catch (e) { /* private mode */ }
    }
  }

  /* ---------- Theme ---------- */
  var THEME_KEY = 'yr-theme';
  var themeBtn = $('#themeToggle');
  var themeMeta = $('meta[name="theme-color"]');
  var menu = $('#mobileMenu');
  var menuBtn = $('#menuToggle');
  var langBtn = $('#langToggle');

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0F1413' : '#F6F3EC');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', theme === 'dark' ? t().themeToLight : t().themeToDark);
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    }
  }

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';

      if (!document.startViewTransition || reduceMotion.matches) {
        applyTheme(nextTheme, true);
        return;
      }

      var rect = themeBtn.getBoundingClientRect();
      root.style.setProperty('--tx', (rect.left + rect.width / 2).toFixed(0) + 'px');
      root.style.setProperty('--ty', (rect.top + rect.height / 2).toFixed(0) + 'px');

      document.startViewTransition(function () { applyTheme(nextTheme, true); });
    });
  }

  /* ---------- Header, progress, back-to-top ---------- */
  var header = $('#siteHeader');
  var progress = $('#progressBar');
  var toTop = $('#toTop');
  var ringFill = $('.ring-fill');
  var heroVisual = $('.hero-visual');
  var RING_LEN = 128.8;
  var ticking = false;

  function onScrollFrame() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 10);

    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(y / max, 1) : 0;

    if (progress) progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';

    if (ringFill) ringFill.style.strokeDashoffset = (RING_LEN * (1 - ratio)).toFixed(2);

    if (heroVisual && !reduceMotion.matches) {
      heroVisual.style.setProperty('--py', (Math.min(y, 720) * 0.06).toFixed(1) + 'px');
    }

    if (toTop) toTop.classList.toggle('is-visible', y > 640);
    ticking = false;
  }

  function requestScrollFrame() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame);
  onScrollFrame();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */

  function setMenu(open, returnFocus) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? t().menuClose : t().menuOpen);
    document.body.classList.toggle('is-locked', open);

    if (open) {
      var first = $('a', menu);
      if (first) first.focus({ preventScroll: true });
    } else if (returnFocus) {
      menuBtn.focus({ preventScroll: true });
    }
  }

  if (menu && menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'), true);
    });

    $$('a', menu).forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false, true);
      }
    });

    var desktopQuery = window.matchMedia('(min-width: 901px)');
    var onBreakpoint = function (event) { if (event.matches) setMenu(false); };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onBreakpoint);
    else desktopQuery.addListener(onBreakpoint);
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  var terminal = $('.terminal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    if (terminal) {
      var terminalObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            terminal.classList.add('is-inview');
            terminalObserver.disconnect();
          }
        });
      }, { threshold: 0.25 });
      terminalObserver.observe(terminal);
    }
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-inview'); });
    if (terminal) terminal.classList.add('is-inview');
  }

  /* ---------- Active nav link ---------- */
  var navLinks = $$('#primaryNav a');
  var sections = $$('main section[id]');

  function markActive(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) markActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = $('#copyEmail');
  var toast = $('#toast');
  var toastTimer = null;
  var EMAIL = 'yuxink@126.com';

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-200px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      copyText(EMAIL).then(function (ok) {
        showToast(ok ? t().copied + EMAIL : t().copyFail + EMAIL);
      });
    });
  }

  /* ---------- Hero card tilt (fine pointers only) ---------- */
  var tiltCard = $('[data-tilt]');

  if (tiltCard && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion.matches) {
    var frameRequested = false;
    var targetX = 0;
    var targetY = 0;

    var renderTilt = function () {
      tiltCard.style.setProperty('--tx', targetX.toFixed(2) + 'px');
      tiltCard.style.setProperty('--ty', targetY.toFixed(2) + 'px');
      frameRequested = false;
    };

    tiltCard.addEventListener('pointermove', function (event) {
      var rect = tiltCard.getBoundingClientRect();
      var relX = (event.clientX - rect.left) / rect.width - 0.5;
      var relY = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * 10;
      targetY = relY * 8;
      if (!frameRequested) {
        frameRequested = true;
        window.requestAnimationFrame(renderTilt);
      }
    });

    tiltCard.addEventListener('pointerleave', function () {
      targetX = 0;
      targetY = 0;
      window.requestAnimationFrame(renderTilt);
    });
  }

  /* ---------- Works filter ---------- */
  var filterBtns = $$('.filter-btn');
  var workCards = $$('.work-card');

  function applyFilter(cat) {
    workCards.forEach(function (card) {
      var match = cat === 'all' || card.dataset.cat === cat;
      card.classList.remove('is-filtering');
      card.classList.toggle('is-hidden', !match);

      if (!match) {
        card.classList.remove('is-inview');
        return;
      }

      card.classList.add('is-inview');
      void card.offsetWidth;
      card.classList.add('is-filtering');
    });
  }

  if (filterBtns.length && workCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.filter || 'all';
        filterBtns.forEach(function (other) {
          var isActive = other === btn;
          other.classList.toggle('is-active', isActive);
          other.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        applyFilter(cat);
      });
    });
  }

  /* ---------- Card spotlight ---------- */
  var workGrid = $('#workGrid');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (workGrid && finePointer && !reduceMotion.matches) {
    var spotCard = null;
    var spotX = 50;
    var spotY = 0;
    var spotQueued = false;

    var paintSpot = function () {
      if (spotCard) {
        spotCard.style.setProperty('--mx', spotX.toFixed(1) + '%');
        spotCard.style.setProperty('--my', spotY.toFixed(1) + '%');
      }
      spotQueued = false;
    };

    workGrid.addEventListener('pointermove', function (event) {
      var card = event.target.closest ? event.target.closest('.work-card') : null;
      if (!card) return;
      var rect = card.getBoundingClientRect();
      spotCard = card;
      spotX = ((event.clientX - rect.left) / rect.width) * 100;
      spotY = ((event.clientY - rect.top) / rect.height) * 100;
      if (!spotQueued) {
        spotQueued = true;
        window.requestAnimationFrame(paintSpot);
      }
    }, { passive: true });
  }

  /* ---------- Hero glow follows the pointer ---------- */
  var heroSection = $('.hero');
  var heroGlow = $('#heroGlow');

  if (heroSection && heroGlow && finePointer && !reduceMotion.matches) {
    var glowQueued = false;
    var glowX = 0;
    var glowY = 0;

    var paintGlow = function () {
      heroGlow.style.transform = 'translate3d(' + glowX.toFixed(1) + 'px,' + glowY.toFixed(1) + 'px,0)';
      glowQueued = false;
    };

    heroSection.addEventListener('pointermove', function (event) {
      var rect = heroSection.getBoundingClientRect();
      glowX = event.clientX - rect.left;
      glowY = event.clientY - rect.top;
      heroGlow.classList.add('is-on');
      if (!glowQueued) {
        glowQueued = true;
        window.requestAnimationFrame(paintGlow);
      }
    }, { passive: true });

    heroSection.addEventListener('pointerleave', function () {
      heroGlow.classList.remove('is-on');
    });
  }

  /* ---------- Magnetic primary button ---------- */
  var magnet = $('.hero-actions .btn-primary');

  if (magnet && finePointer && !reduceMotion.matches) {
    magnet.addEventListener('pointermove', function (event) {
      var rect = magnet.getBoundingClientRect();
      var relX = (event.clientX - rect.left - rect.width / 2) / rect.width;
      var relY = (event.clientY - rect.top - rect.height / 2) / rect.height;
      magnet.style.setProperty('--mag-x', (relX * 7).toFixed(2) + 'px');
      magnet.style.setProperty('--mag-y', (relY * 5).toFixed(2) + 'px');
    });

    magnet.addEventListener('pointerleave', function () {
      magnet.style.setProperty('--mag-x', '0px');
      magnet.style.setProperty('--mag-y', '0px');
    });
  }

  /* ---------- Count-up stats ---------- */
  var counters = $$('[data-count]');

  function runCount(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion.matches) {
      el.textContent = String(target);
      return;
    }
    var start = 0;
    var duration = 1100;

    var step = function (now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counted = false;
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || counted) return;
          counted = true;
          counters.forEach(runCount);
          countObserver.disconnect();
        });
      }, { threshold: 0.5 });
      countObserver.observe(counters[0]);
    } else {
      counters.forEach(function (el) { el.textContent = el.dataset.count; });
    }
  }

  /* ---------- Little easter egg: the fish wiggles ---------- */
  $$('.brand-mark, .logo-frame').forEach(function (mark) {
    mark.addEventListener('click', function () {
      mark.classList.remove('is-wiggle');
      void mark.offsetWidth;
      mark.classList.add('is-wiggle');
    });
  });

  /* ---------- Footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Language boot ---------- */
  applyLang(currentLang(), false);
  root.classList.remove('is-i18n-loading');

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      applyLang(currentLang() === 'en' ? 'zh' : 'en', true);
    });
  }
})();