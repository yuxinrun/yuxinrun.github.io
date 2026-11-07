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

  /* ---------- Theme ---------- */
  var THEME_KEY = 'yr-theme';
  var themeBtn = $('#themeToggle');
  var themeMeta = $('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0F1413' : '#F6F3EC');
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色主题' : '切换到深色主题');
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    }
  }

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
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
  var menu = $('#mobileMenu');
  var menuBtn = $('#menuToggle');

  function setMenu(open, returnFocus) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
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
        showToast(ok ? '邮箱已复制：' + EMAIL : '请手动复制：' + EMAIL);
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
})();