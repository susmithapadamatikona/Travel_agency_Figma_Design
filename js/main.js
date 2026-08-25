/* =========================================================
   Phines Travels — front-end interactivity
   No dependencies. No backend: the search bar validates and
   gives believable feedback, but does not call a real API.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Small helpers
     --------------------------------------------------------- */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts || false); }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  /* ===========================================================
     1. STICKY NAV + SCROLL-SPY
     =========================================================== */
  function initNav() {
    var nav = $('#siteNav');
    var hero = $('#home');
    if (!nav) return;

    var solidAt = hero ? Math.max(140, hero.offsetHeight - 110) : 140;
    var ticking = false;
    var staticSolid = nav.hasAttribute('data-static-solid');

    function updateSolid() {
      ticking = false;
      if (staticSolid) { nav.classList.add('nav--solid'); return; }
      if (window.scrollY > solidAt) nav.classList.add('nav--solid');
      else nav.classList.remove('nav--solid');
    }
    on(window, 'scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateSolid); ticking = true; }
    }, { passive: true });
    updateSolid();

    /* pages like flights.html use the nav as a plain multi-page indicator —
       "Flights" stays active because you're on that page, not because of
       scroll position, so skip the single-page scroll-spy behaviour */
    if (nav.hasAttribute('data-no-scrollspy')) return;

    /* scroll-spy: highlight the nav link for whichever section is centred */
    var links = $$('#navLinks a[data-target]');
    var targets = {};
    links.forEach(function (a) {
      var id = a.getAttribute('data-target');
      var sec = document.getElementById(id);
      if (sec) targets[id] = sec;
    });

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-target') === id);
      });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      Object.keys(targets).forEach(function (id) { io.observe(targets[id]); });
    }
  }

  /* ===========================================================
     2. MOBILE HAMBURGER MENU
     =========================================================== */
  function initMobileMenu() {
    var nav = $('#siteNav');
    var toggle = $('#navToggle');
    var menu = $('#navMenu');
    if (!nav || !toggle || !menu) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function toggleOpen() {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    on(toggle, 'click', toggleOpen);
    $$('#navMenu a').forEach(function (a) { on(a, 'click', close); });
    on(document, 'click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) close();
    });
    on(window, 'resize', function () { if (window.innerWidth > 900) close(); });
  }

  /* ---- account dropdown (flights.html) ---- */
  function initAccountDropdown() {
    var wrap = $('.nav-user');
    var toggle = $('#accountToggle');
    var panel = $('#accountPanel');
    if (!wrap || !toggle || !panel) return;

    function close() {
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    on(toggle, 'click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    on(document, 'click', function (e) {
      if (wrap.classList.contains('is-open') && !wrap.contains(e.target)) close();
    });
    on(document, 'keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ===========================================================
     3. SCROLL-REVEAL ANIMATIONS
     =========================================================== */
  function initReveal() {
    var els = $$('[data-reveal]');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('reveal', 'in-view'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    /* stagger siblings that reveal together (card grids/rows) */
    var counts = new Map();
    els.forEach(function (el) {
      el.classList.add('reveal');
      var parent = el.parentElement;
      var idx = counts.get(parent) || 0;
      counts.set(parent, idx + 1);
      el.style.transitionDelay = Math.min(idx, 3) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* ===========================================================
     4. TESTIMONIALS SLIDER
     =========================================================== */
  function initTestimonials() {
    var section = $('#testimonials');
    if (!section) return;

    var DATA = [
      { name: 'Marco Rossi',   quote: '&ldquo;Booking was effortless&rdquo; The team matched us with flights and a hotel in minutes. Every detail felt considered, right down to the airport transfer.' },
      { name: 'Aiko Tanaka',   quote: '&ldquo;They planned around our budget&rdquo; I told them what we could spend and they still found a trip that felt like a splurge. Would book again in a heartbeat.' },
      { name: 'Alice Smith',   quote: '&ldquo;A real sense of community, nurtured&rdquo; Really appreciate the help and support from the staff during my trips. Very helpful and always available when needed.' },
      { name: 'Daniel Kim',    quote: '&ldquo;Support that actually shows up&rdquo; Our flight was delayed and they rebooked our connecting hotel before we even landed. That kind of care is rare.' },
      { name: 'Sofia Martins', quote: '&ldquo;Made a solo trip feel safe&rdquo; This was my first trip travelling alone and their recommendations made every stop feel planned and secure.' }
    ];

    var quoteEl = $('#tmQuote');
    var nameEl = $('#tmName');
    var dots = $$('#tmDots span');
    var avatars = $$('#tmAvatars img');
    var prevBtn = $('#tmPrev');
    var nextBtn = $('#tmNext');

    var index = 2; /* matches the markup's initial "is-active" position */
    var timer = null;

    function render() {
      var d = DATA[index];
      if (quoteEl) quoteEl.innerHTML = d.quote;
      if (nameEl) nameEl.textContent = d.name;
      dots.forEach(function (dot) {
        dot.classList.toggle('is-active', Number(dot.getAttribute('data-i')) === index);
      });
      avatars.forEach(function (img) {
        img.classList.toggle('is-active', Number(img.getAttribute('data-i')) === index);
      });
    }

    function go(i) {
      index = (i + DATA.length) % DATA.length;
      render();
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 6000);
    }

    on(prevBtn, 'click', function () { go(index - 1); restart(); });
    on(nextBtn, 'click', function () { go(index + 1); restart(); });
    dots.forEach(function (dot) {
      on(dot, 'click', function () { go(Number(dot.getAttribute('data-i'))); restart(); });
    });
    avatars.forEach(function (img) {
      on(img, 'click', function () { go(Number(img.getAttribute('data-i'))); restart(); });
    });
    on(section, 'mouseenter', function () { if (timer) clearInterval(timer); });
    on(section, 'mouseleave', restart);

    restart();
  }

  /* ===========================================================
     5. HAPPY CUSTOMERS SLIDER (pages two cards at a time)
     =========================================================== */
  function initHappyCustomers() {
    var grid = $('#happyGrid');
    if (!grid) return;
    var cards = $$('.happy-card', grid);
    if (cards.length < 2) return;

    var DATA = [
      { name: 'Lyod Gomez',  avatar: 'assets/images/avatars/av-33.jpg' },
      { name: 'Lyod Gomez',  avatar: 'assets/images/avatars/av-52.jpg' },
      { name: 'Maria Chen',  avatar: 'assets/images/avatars/av-11.jpg' },
      { name: 'James Carter', avatar: 'assets/images/avatars/av-13.jpg' },
      { name: 'Priya Nair',  avatar: 'assets/images/avatars/av-23.jpg' },
      { name: 'Tom Becker',  avatar: 'assets/images/avatars/av-45.jpg' }
    ];
    var TEXT = 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure';

    var page = 0; /* 0, 2, 4 ... */
    var prevBtn = $('#happyPrev');
    var nextBtn = $('#happyNext');

    function fill(card, item) {
      var img = $('.happy-avatar', card);
      var name = $('.happy-name', card);
      var text = $('.happy-text', card);
      if (img) { img.src = item.avatar; img.alt = item.name; }
      if (name) name.textContent = item.name;
      if (text) text.textContent = TEXT;
    }

    function render() {
      cards.forEach(function (card, i) {
        card.classList.add('is-fading');
        setTimeout(function () {
          fill(card, DATA[(page + i) % DATA.length]);
          card.classList.remove('is-fading');
        }, 180);
      });
    }

    function go(dir) {
      page = (page + dir * 2 + DATA.length) % DATA.length;
      render();
    }

    on(prevBtn, 'click', function () { go(-1); });
    on(nextBtn, 'click', function () { go(1); });
  }

  /* ===========================================================
     6. DRAGGABLE / SWIPEABLE CARD ROWS (destinations, reviews)
     =========================================================== */
  function makeDraggable(el) {
    if (!el) return;
    var isDown = false, moved = false, startX = 0, startScroll = 0;
    var lastX = 0, lastT = 0, velocity = 0;
    var momentumFrame = null;

    function stopMomentum() {
      if (momentumFrame) { cancelAnimationFrame(momentumFrame); momentumFrame = null; }
    }

    function runMomentum() {
      var maxScroll = el.scrollWidth - el.clientWidth;
      velocity *= 0.94; /* friction */
      if (Math.abs(velocity) < 0.05 || maxScroll <= 0) { momentumFrame = null; return; }
      var next = el.scrollLeft - velocity;
      if (next < 0) { el.scrollLeft = 0; momentumFrame = null; return; }
      if (next > maxScroll) { el.scrollLeft = maxScroll; momentumFrame = null; return; }
      el.scrollLeft = next;
      momentumFrame = requestAnimationFrame(runMomentum);
    }

    on(el, 'pointerdown', function (e) {
      if (e.pointerType === 'touch') return; /* native touch scroll + momentum handles this */
      stopMomentum();
      isDown = true; moved = false;
      startX = lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      startScroll = el.scrollLeft;
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault(); /* belt-and-braces: stops native image/link drag starting the gesture */
    });
    on(el, 'pointermove', function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;

      var now = performance.now();
      var dt = now - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt * 16.7; /* px per ~frame */
      lastX = e.clientX;
      lastT = now;
    });
    function endDrag() {
      if (!isDown) return;
      isDown = false;
      el.classList.remove('is-dragging');
      if (Math.abs(velocity) > 0.5) {
        stopMomentum();
        momentumFrame = requestAnimationFrame(runMomentum);
      }
    }
    on(el, 'pointerup', endDrag);
    on(el, 'pointerleave', endDrag);
    on(el, 'pointercancel', endDrag);
    on(el, 'click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    on(el, 'dragstart', function (e) { e.preventDefault(); }); /* extra native-drag guard (older browsers) */

    el.setAttribute('tabindex', '0');
    on(el, 'keydown', function (e) {
      if (e.key === 'ArrowRight') { el.scrollBy({ left: 340, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { el.scrollBy({ left: -340, behavior: 'smooth' }); e.preventDefault(); }
    });
  }

  function initCarousels() {
    var destRow = $('#destRow');
    var revRow = $('#revRow');
    var blogRow = $('#blogRow');
    makeDraggable(destRow);
    makeDraggable(revRow);
    makeDraggable(blogRow);

    var destPrev = $('#destPrev');
    var destNext = $('#destNext');
    if (destRow) {
      var step = 522; /* card width 498 + 24 gap */
      on(destNext, 'click', function () {
        if (destRow.scrollLeft + destRow.clientWidth >= destRow.scrollWidth - 8) destRow.scrollTo({ left: 0, behavior: 'smooth' });
        else destRow.scrollBy({ left: step, behavior: 'smooth' });
      });
      on(destPrev, 'click', function () {
        if (destRow.scrollLeft <= 8) destRow.scrollTo({ left: destRow.scrollWidth, behavior: 'smooth' });
        else destRow.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }
  }

  /* ===========================================================
     7. SEARCH BAR — autocomplete, date range, traveler/class
     =========================================================== */
  function initSearch() {
    var form = $('#searchForm');
    if (!form) return;

    var CITIES = ['Phuket, Thailand', 'Santorini, Greece', 'Paris, France', 'Bali, Indonesia', 'Rome, Italy', 'Tokyo, Japan', 'Maldives', 'New York, USA', 'Dubai, UAE', 'London, UK', 'Bangkok, Thailand', 'Barcelona, Spain'];

    var openField = null;
    function closeAll() {
      if (openField) { openField.classList.remove('is-open'); openField = null; }
    }
    function openPanel(fieldEl) {
      if (openField && openField !== fieldEl) closeAll();
      fieldEl.classList.add('is-open');
      openField = fieldEl;
    }

    /* ---- From / To autocomplete ---- */
    function setupAutocomplete(fieldId, inputId) {
      var field = document.getElementById(fieldId);
      var input = document.getElementById(inputId);
      if (!field || !input) return;

      var panel = document.createElement('div');
      panel.className = 'ac-panel';
      field.appendChild(panel);

      function renderList(query) {
        var q = (query || '').trim().toLowerCase();
        var list = CITIES.filter(function (c) { return c.toLowerCase().indexOf(q) !== -1; });
        panel.innerHTML = '';
        if (!list.length) {
          var empty = document.createElement('div');
          empty.className = 'ac-empty';
          empty.textContent = 'No destinations found';
          panel.appendChild(empty);
          return;
        }
        list.slice(0, 8).forEach(function (city) {
          var item = document.createElement('div');
          item.className = 'ac-item';
          item.textContent = city;
          item.addEventListener('mousedown', function (e) {
            e.preventDefault();
            input.value = city;
            field.classList.remove('has-error');
            closeAll();
          });
          panel.appendChild(item);
        });
      }

      on(input, 'focus', function () { renderList(input.value); openPanel(field); });
      on(input, 'input', function () { renderList(input.value); openPanel(field); });
    }
    setupAutocomplete('fieldFrom', 'fromInput');
    setupAutocomplete('fieldTo', 'toInput');

    /* ---- Date range picker ---- */
    (function setupDatePicker() {
      var field = $('#fieldDate');
      var input = $('#dateInput');
      if (!field || !input) return;

      var panel = document.createElement('div');
      panel.className = 'date-panel';
      field.appendChild(panel);

      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var viewYear = today.getFullYear();
      var viewMonth = today.getMonth();
      var rangeStart = null, rangeEnd = null;

      function fmt(d) { return MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate(); }

      function renderCalendar() {
        var first = new Date(viewYear, viewMonth, 1);
        var startOffset = first.getDay();
        var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        var html = '<div class="dp-head">' +
          '<button type="button" data-nav="-1" aria-label="Previous month">&#8249;</button>' +
          '<span class="dp-month">' + MONTHS[viewMonth] + ' ' + viewYear + '</span>' +
          '<button type="button" data-nav="1" aria-label="Next month">&#8250;</button>' +
          '</div><div class="dp-grid">';

        DOW.forEach(function (d) { html += '<div class="dp-dow">' + d + '</div>'; });
        for (var i = 0; i < startOffset; i++) html += '<div></div>';

        for (var day = 1; day <= daysInMonth; day++) {
          var cellDate = new Date(viewYear, viewMonth, day);
          var classes = ['dp-day'];
          if (cellDate < today) classes.push('is-muted');
          if (rangeStart && cellDate.getTime() === rangeStart.getTime()) classes.push('is-start');
          if (rangeEnd && cellDate.getTime() === rangeEnd.getTime()) classes.push('is-end');
          if (rangeStart && rangeEnd && cellDate > rangeStart && cellDate < rangeEnd) classes.push('is-range');
          html += '<div class="' + classes.join(' ') + '" data-day="' + day + '">' + day + '</div>';
        }
        html += '</div><div class="dp-foot">Select a check-in and check-out date</div>';
        panel.innerHTML = html;

        $$('button[data-nav]', panel).forEach(function (btn) {
          on(btn, 'click', function () {
            viewMonth += Number(btn.getAttribute('data-nav'));
            if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            renderCalendar();
          });
        });
        $$('.dp-day:not(.is-muted)', panel).forEach(function (cell) {
          on(cell, 'mousedown', function (e) {
            e.preventDefault();
            var d = new Date(viewYear, viewMonth, Number(cell.getAttribute('data-day')));
            if (!rangeStart || (rangeStart && rangeEnd)) {
              rangeStart = d; rangeEnd = null;
            } else if (d < rangeStart) {
              rangeEnd = rangeStart; rangeStart = d;
            } else {
              rangeEnd = d;
            }
            renderCalendar();
            if (rangeStart && rangeEnd) {
              input.value = fmt(rangeStart) + ' – ' + fmt(rangeEnd);
              field.classList.remove('has-error');
              setTimeout(closeAll, 260);
            }
          });
        });
      }

      on(input, 'focus', function () { renderCalendar(); openPanel(field); });
      on(field, 'mousedown', function (e) {
        if (e.target === input) { renderCalendar(); openPanel(field); }
      });
    })();

    /* ---- Traveler + class panel ---- */
    (function setupTravelerPanel() {
      var field = $('#fieldTraveler');
      var input = $('#travelerInput');
      if (!field || !input) return;

      var panel = document.createElement('div');
      panel.className = 'traveler-panel';
      field.appendChild(panel);

      var state = { adults: 1, children: 0, cls: 'Economy' };
      var CLASSES = ['Economy', 'Business', 'First'];

      function updateInput() {
        var people = state.adults + ' Adult' + (state.adults > 1 ? 's' : '');
        if (state.children > 0) people += ', ' + state.children + ' Child' + (state.children > 1 ? 'ren' : '');
        input.value = people + ' · ' + state.cls;
      }
      updateInput();

      function renderPanel() {
        var html =
          '<div class="tp-row"><div><span class="tp-label">Adults</span><span class="tp-sub">12+ years</span></div>' +
          '<div class="tp-count"><button type="button" data-act="adults-" ' + (state.adults <= 1 ? 'disabled' : '') + '>&minus;</button>' +
          '<span>' + state.adults + '</span>' +
          '<button type="button" data-act="adults+" ' + (state.adults >= 9 ? 'disabled' : '') + '>+</button></div></div>' +

          '<div class="tp-row"><div><span class="tp-label">Children</span><span class="tp-sub">0&ndash;11 years</span></div>' +
          '<div class="tp-count"><button type="button" data-act="children-" ' + (state.children <= 0 ? 'disabled' : '') + '>&minus;</button>' +
          '<span>' + state.children + '</span>' +
          '<button type="button" data-act="children+" ' + (state.children >= 8 ? 'disabled' : '') + '>+</button></div></div>' +

          '<div class="tp-classes">' + CLASSES.map(function (c) {
            return '<div class="tp-class' + (state.cls === c ? ' is-active' : '') + '" data-cls="' + c + '">' + c + '</div>';
          }).join('') + '</div>' +
          '<button type="button" class="tp-apply">Apply</button>';
        panel.innerHTML = html;

        $$('button[data-act]', panel).forEach(function (btn) {
          on(btn, 'click', function () {
            var act = btn.getAttribute('data-act');
            if (act === 'adults-') state.adults--;
            if (act === 'adults+') state.adults++;
            if (act === 'children-') state.children--;
            if (act === 'children+') state.children++;
            updateInput();
            renderPanel();
          });
        });
        $$('.tp-class', panel).forEach(function (el) {
          on(el, 'click', function () { state.cls = el.getAttribute('data-cls'); updateInput(); renderPanel(); });
        });
        on($('.tp-apply', panel), 'click', function () { updateInput(); closeAll(); });
      }

      on(input, 'focus', function () { renderPanel(); openPanel(field); });
      on(field, 'mousedown', function (e) {
        if (e.target === input) { renderPanel(); openPanel(field); }
      });
    })();

    /* close any open panel on outside click / Escape */
    on(document, 'mousedown', function (e) {
      if (openField && !openField.contains(e.target)) closeAll();
    });
    on(document, 'keydown', function (e) { if (e.key === 'Escape') closeAll(); });

    /* ---- toast ---- */
    var toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
    var toastTimer = null;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('is-visible');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 3200);
    }

    /* ---- submit / validate ---- */
    var findBtn = $('#findTripBtn');
    on(findBtn, 'click', function () {
      var fromInput = $('#fromInput'), toInput = $('#toInput'), dateInput = $('#dateInput');
      var missing = [];
      [['fieldFrom', fromInput], ['fieldTo', toInput], ['fieldDate', dateInput]].forEach(function (pair) {
        var field = document.getElementById(pair[0]);
        var input = pair[1];
        var bad = !input || !input.value.trim();
        field.classList.toggle('has-error', bad);
        if (bad) missing.push(field);
      });

      if (missing.length) {
        missing[0].querySelector('input').focus();
        showToast('Please fill in your trip details to search');
        setTimeout(function () { missing.forEach(function (f) { f.classList.remove('has-error'); }); }, 500);
        return;
      }

      showToast('Searching trips from ' + fromInput.value.split(',')[0] + ' to ' + toInput.value.split(',')[0] + ' · ' + dateInput.value);
      var dest = $('#destinations');
      if (dest) setTimeout(function () { dest.scrollIntoView({ behavior: 'smooth' }); }, 500);
    });
  }

  /* ---- generic "click to make active" tab groups (hotels.html) ---- */
  function initTabGroups() {
    $$('.deals-tabs, .hlist-tabs').forEach(function (group) {
      var buttons = $$('.deals-tab, .hlist-tab', group);
      buttons.forEach(function (btn) {
        on(btn, 'click', function () {
          buttons.forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        });
      });
    });

    $$('.rating-btn').forEach(function (btn, i, all) {
      on(btn, 'click', function () {
        all.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
      });
    });
  }

  /* ---- hotel-card favourite toggle (hotels.html) ---- */
  function initFavouriteButtons() {
    $$('.hlist-fav').forEach(function (btn) {
      on(btn, 'click', function () { btn.classList.toggle('is-saved'); });
    });
  }

  /* ===========================================================
     init
     =========================================================== */
  function init() {
    initNav();
    initMobileMenu();
    initAccountDropdown();
    initReveal();
    initTestimonials();
    initHappyCustomers();
    initCarousels();
    initSearch();
    initTabGroups();
    initFavouriteButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
