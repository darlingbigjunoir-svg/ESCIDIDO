/**
 * Escondido Plumbing — Main JavaScript
 * Works across: index.html, about.html, services.html, blog.html, contact.html
 * No page overrides — each feature activates only when its elements exist.
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITY HELPERS
  ============================================================ */

  /** Run a callback only if the selector finds an element. */
  function onElement(selector, callback) {
    var el = document.querySelector(selector);
    if (el) callback(el);
  }

  /** Run a callback for every matching element. */
  function onElements(selector, callback) {
    var els = document.querySelectorAll(selector);
    if (els.length) els.forEach(callback);
  }

  /** Debounce a function (avoids excessive calls on scroll/resize). */
  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay || 150);
    };
  }


  /* ============================================================
     1. HAMBURGER MENU  (all pages)
  ============================================================ */

  (function initHamburger() {
    var hamburger = document.getElementById('hamburger');
    var nav       = document.getElementById('nav');
    var header    = document.querySelector('.header');

    if (!hamburger || !nav) return;

    /* Toggle open/close */
    hamburger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('nav--open');
      hamburger.classList.toggle('hamburger--active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });

    /* Close when a top-level link (non-dropdown parent) is clicked */
    onElements('#nav .nav-link', function (link) {
      /* Skip dropdown parent links so the dropdown can still open */
      var parentLi = link.closest('li');
      if (parentLi && parentLi.classList.contains('nav-dropdown')) return;

      link.addEventListener('click', closeMenu);
    });

    /* Close when clicking outside the nav */
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    /* Re-close if window resizes past the mobile breakpoint */
    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth > 768) closeMenu();
    }, 200));

    function closeMenu() {
      nav.classList.remove('nav--open');
      hamburger.classList.remove('hamburger--active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      /* Also close any open dropdowns */
      onElements('.nav-dropdown.dropdown--open', function (dd) {
        dd.classList.remove('dropdown--open');
      });
    }
  })();


  /* ============================================================
     2. MOBILE DROPDOWN SUBMENU  (all pages)
     On mobile the dropdown must be tap-toggled, not hover-based.
  ============================================================ */

  (function initDropdowns() {
    onElements('.nav-dropdown > .nav-link', function (link) {
      link.addEventListener('click', function (e) {
        /* Only intercept on narrow screens */
        if (window.innerWidth > 768) return;
        e.preventDefault();

        var parentLi = link.closest('.nav-dropdown');
        var isOpen   = parentLi.classList.toggle('dropdown--open');

        /* Close sibling dropdowns */
        onElements('.nav-dropdown', function (dd) {
          if (dd !== parentLi) dd.classList.remove('dropdown--open');
        });
      });
    });
  })();


  /* ============================================================
     3. STICKY / SCROLLED HEADER  (all pages)
  ============================================================ */

  (function initStickyHeader() {
    var header = document.querySelector('.header');
    if (!header) return;

    function handleScroll() {
      if (window.scrollY > 60) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); /* Run once on load */
  })();


  /* ============================================================
     4. SMOOTH SCROLL FOR ANCHOR LINKS  (all pages)
  ============================================================ */

  (function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var headerHeight = (document.querySelector('.header') || {}).offsetHeight || 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  })();


  /* ============================================================
     5. SCROLL-REVEAL ANIMATIONS  (all pages)
     Elements with class .reveal animate in when they enter
     the viewport. Add the class in HTML or let JS add it below.
  ============================================================ */

  (function initScrollReveal() {
    /* Auto-tag common content blocks if IntersectionObserver is available */
    if (!('IntersectionObserver' in window)) return;

    var selectors = [
      '.section-header',
      '.how-card',
      '.service-card',
      '.service-full-card',
      '.value-card',
      '.expert-card',
      '.testimonial-card',
      '.testi-card',
      '.stat-card',
      '.blog-card',
      '.blog-featured',
      '.story-inner',
      '.reliable-inner',
      '.appt-inner',
      '.trusted-inner',
      '.contact-card',
      '.faq-item',
      '.why-item',
    ];

    selectors.forEach(function (sel) {
      onElements(sel, function (el) {
        el.classList.add('reveal');
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target); /* Animate once */
          }
        });
      },
      { threshold: 0.12 }
    );

    onElements('.reveal', function (el) {
      observer.observe(el);
    });
  })();


  /* ============================================================
     6. APPOINTMENT FORM — index.html & services.html
  ============================================================ */

  (function initAppointmentForm() {
    onElements('.appt-form', function (form) {
      /* Set min date to today */
      onElements('input[type="date"]', function (input) {
        var today = new Date().toISOString().split('T')[0];
        input.setAttribute('min', today);
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(form)) return;
        showFormSuccess(form, 'Appointment booked! We\'ll confirm shortly.');
      });
    });
  })();


  /* ============================================================
     7. CONTACT FORM — contact.html
  ============================================================ */

  (function initContactForm() {
    onElement('.contact-form', function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(form)) return;
        showFormSuccess(form, 'Message sent! Our team will be in touch within 2 hours.');
      });
    });
  })();


  /* ============================================================
     8. NEWSLETTER FORM — blog.html
  ============================================================ */

  (function initNewsletterForm() {
    onElement('.newsletter-form', function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="email"]');
        if (!input || !input.value.trim()) {
          shakeElement(input);
          return;
        }
        if (!isValidEmail(input.value)) {
          shakeElement(input);
          showInlineMessage(input, 'Please enter a valid email address.', 'error');
          return;
        }
        showInlineMessage(input, 'You\'re subscribed! Thank you.', 'success');
        input.value = '';
      });
    });
  })();


  /* ============================================================
     9. HERO EMAIL CAPTURE — index.html
  ============================================================ */

  (function initHeroEmail() {
    onElement('.hero-email', function (wrap) {
      var input = wrap.querySelector('input[type="email"]');
      if (!input) return;

      /* Allow pressing Enter to submit */
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitHeroEmail(input);
        }
      });

      /* Also handle a submit button if one is added later */
      var btn = wrap.querySelector('button');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          submitHeroEmail(input);
        });
      }
    });

    function submitHeroEmail(input) {
      if (!input.value.trim() || !isValidEmail(input.value)) {
        shakeElement(input);
        return;
      }
      showInlineMessage(input, 'Thanks! We\'ll be in touch soon.', 'success');
      input.value = '';
    }
  })();


  /* ============================================================
     10. BLOG CATEGORY FILTER PILLS — blog.html
  ============================================================ */

  (function initBlogFilters() {
    var pills = document.querySelectorAll('.filter-pill');
    var cards = document.querySelectorAll('.blog-card');

    if (!pills.length || !cards.length) return;

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        /* Update active pill */
        pills.forEach(function (p) { p.classList.remove('filter-pill--active'); });
        pill.classList.add('filter-pill--active');

        var filter = pill.textContent.trim();

        cards.forEach(function (card) {
          if (filter === 'All Posts') {
            showCard(card);
            return;
          }
          var tag = card.querySelector('.blog-tag');
          var match = tag && tag.textContent.trim() === filter;
          if (match) {
            showCard(card);
          } else {
            hideCard(card);
          }
        });
      });
    });

    function showCard(card) {
      card.style.display = '';
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      requestAnimationFrame(function () {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      });
    }

    function hideCard(card) {
      card.style.transition = 'opacity 0.2s ease';
      card.style.opacity    = '0';
      setTimeout(function () { card.style.display = 'none'; }, 200);
    }
  })();


  /* ============================================================
     11. BLOG PAGINATION — blog.html
  ============================================================ */

  (function initBlogPagination() {
    onElements('.page-btn:not(.page-btn--next)', function (btn) {
      btn.addEventListener('click', function () {
        onElements('.page-btn:not(.page-btn--next)', function (b) {
          b.classList.remove('page-btn--active');
        });
        btn.classList.add('page-btn--active');

        /* Scroll back up to the blog main content */
        var blogMain = document.querySelector('.blog-main');
        if (blogMain) {
          var headerH = (document.querySelector('.header') || {}).offsetHeight || 0;
          var top = blogMain.getBoundingClientRect().top + window.scrollY - headerH - 16;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    onElement('.page-btn--next', function (btn) {
      btn.addEventListener('click', function () {
        /* Advance to next page number */
        var active = document.querySelector('.page-btn--active');
        if (active && active.nextElementSibling && !active.nextElementSibling.classList.contains('page-dots')) {
          active.classList.remove('page-btn--active');
          active.nextElementSibling.classList.add('page-btn--active');
        }
      });
    });
  })();


  /* ============================================================
     12. BLOG SIDEBAR SEARCH — blog.html
  ============================================================ */

  (function initSidebarSearch() {
    onElement('.sidebar-search', function (wrap) {
      var input = wrap.querySelector('input');
      var btn   = wrap.querySelector('button');

      if (!input || !btn) return;

      function doSearch() {
        var query = input.value.trim().toLowerCase();
        if (!query) return;

        var cards = document.querySelectorAll('.blog-card, .blog-featured');
        var found = 0;

        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          if (text.includes(query)) {
            card.style.outline = '2px solid var(--clr-primary, #0ea5e9)';
            found++;
          } else {
            card.style.outline = '';
          }
        });

        if (!found) {
          showInlineMessage(input, 'No articles matched "' + input.value.trim() + '"', 'error');
        }
      }

      btn.addEventListener('click', doSearch);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doSearch();
      });

      /* Clear highlights when input is cleared */
      input.addEventListener('input', function () {
        if (!input.value.trim()) {
          onElements('.blog-card, .blog-featured', function (c) {
            c.style.outline = '';
          });
        }
      });
    });
  })();


  /* ============================================================
     13. FAQ ACCORDION — contact.html
     Native <details> works out of the box but we enhance it
     with smooth animation and close-others behaviour.
  ============================================================ */

  (function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var summary = item.querySelector('summary');
      var icon    = item.querySelector('.faq-icon');

      item.addEventListener('toggle', function () {
        /* Rotate icon */
        if (icon) icon.style.transform = item.open ? 'rotate(180deg)' : 'rotate(0deg)';

        /* Close siblings */
        if (item.open) {
          items.forEach(function (other) {
            if (other !== item && other.open) other.open = false;
          });
        }
      });
    });
  })();


  /* ============================================================
     14. STATS COUNTER ANIMATION — about.html
     Counts up the numbers in .stat-num when they enter view.
  ============================================================ */

  (function initStatCounters() {
    if (!('IntersectionObserver' in window)) return;

    var stats = document.querySelectorAll('.stat-num');
    if (!stats.length) return;

    var countered = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !countered) {
          countered = true;
          stats.forEach(animateCounter);
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });

    var section = document.querySelector('.stats-section');
    if (section) observer.observe(section);

    function animateCounter(el) {
      var text   = el.textContent;
      var suffix = text.replace(/[\d,\.]/g, ''); /* e.g. '+', '/5' */
      var raw    = parseFloat(text.replace(/[^0-9.]/g, ''));

      if (isNaN(raw)) return;

      var start    = 0;
      var duration = 1600;
      var startTs  = null;
      var isDecimal = text.indexOf('.') !== -1;

      function step(ts) {
        if (!startTs) startTs = ts;
        var progress = Math.min((ts - startTs) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
        var current  = eased * raw;

        if (isDecimal) {
          el.textContent = current.toFixed(1) + suffix;
        } else {
          el.textContent = Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? raw.toFixed(1) + suffix : raw.toLocaleString() + suffix;
      }

      requestAnimationFrame(step);
    }
  })();


  /* ============================================================
     15. ACTIVE NAV LINK HIGHLIGHTING
     Marks the correct nav link as active based on current page.
  ============================================================ */

  (function initActiveNav() {
    var path    = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(function (link) {
      var href = (link.getAttribute('href') || '').split('/').pop();
      if (href === path) {
        link.classList.add('active');
      } else if (path === '' && href === 'index.html') {
        link.classList.add('active');
      } else if (link.classList.contains('active') && href !== path) {
        /* Remove stale active set in HTML for non-matching pages */
        link.classList.remove('active');
      }
    });
  })();


  /* ============================================================
     16. HEADER HIDE-ON-SCROLL-DOWN / SHOW-ON-SCROLL-UP
     Subtle UX improvement on all pages.
  ============================================================ */

  (function initHideHeader() {
    var header   = document.querySelector('.header');
    if (!header) return;

    var lastY    = 0;
    var ticking  = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var currentY = window.scrollY;

          /* Only hide after scrolling down past the header */
          if (currentY > header.offsetHeight + 50) {
            if (currentY > lastY) {
              header.classList.add('header--hidden');
            } else {
              header.classList.remove('header--hidden');
            }
          } else {
            header.classList.remove('header--hidden');
          }

          lastY   = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();


  /* ============================================================
     SHARED FORM UTILITIES
  ============================================================ */

  function validateForm(form) {
    var valid = true;

    /* Clear old errors */
    form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('.input-error').forEach(function (el) {
      el.classList.remove('input-error');
    });

    /* Required text / tel / select fields */
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (field) {
      if (!field.value.trim()) {
        markFieldError(field, 'This field is required.');
        valid = false;
      }
    });

    /* Email validation */
    form.querySelectorAll('input[type="email"]').forEach(function (field) {
      if (field.value.trim() && !isValidEmail(field.value)) {
        markFieldError(field, 'Please enter a valid email address.');
        valid = false;
      }
    });

    if (!valid) {
      /* Scroll to first error */
      var firstError = form.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
    }

    return valid;
  }

  function markFieldError(field, message) {
    field.classList.add('input-error');
    var err = document.createElement('span');
    err.className   = 'field-error';
    err.textContent = message;
    field.insertAdjacentElement('afterend', err);
    shakeElement(field);
  }

  function showFormSuccess(form, message) {
    var success = document.createElement('div');
    success.className   = 'form-success';
    success.innerHTML   =
      '<i class="fa-solid fa-circle-check"></i> ' + message;

    /* Replace form content with success message */
    form.style.transition = 'opacity 0.3s';
    form.style.opacity    = '0';

    setTimeout(function () {
      form.parentNode.insertBefore(success, form);
      form.style.display = 'none';

      /* Fade in success message */
      success.style.opacity = '0';
      requestAnimationFrame(function () {
        success.style.transition = 'opacity 0.4s';
        success.style.opacity    = '1';
      });
    }, 300);
  }

  function showInlineMessage(input, message, type) {
    /* Remove any existing inline message */
    var existing = input.parentNode.querySelector('.inline-msg');
    if (existing) existing.remove();

    var msg = document.createElement('p');
    msg.className   = 'inline-msg inline-msg--' + type;
    msg.textContent = message;
    input.insertAdjacentElement('afterend', msg);

    if (type === 'success') {
      setTimeout(function () {
        msg.style.transition = 'opacity 0.4s';
        msg.style.opacity    = '0';
        setTimeout(function () { msg.remove(); }, 400);
      }, 3000);
    }
  }

  function shakeElement(el) {
    if (!el) return;
    el.classList.remove('shake');
    /* Trigger reflow */
    void el.offsetWidth;
    el.classList.add('shake');
    el.addEventListener('animationend', function () {
      el.classList.remove('shake');
    }, { once: true });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }


  /* ============================================================
     INJECTED STYLES
     Minimal styles required by JS features (shake, reveal,
     form feedback, header states). Add these to your CSS files
     if you prefer — they are idempotent if duplicated.
  ============================================================ */

  (function injectStyles() {
    if (document.getElementById('esc-js-styles')) return;

    var style = document.createElement('style');
    style.id  = 'esc-js-styles';
    style.textContent = [

      /* --- Hamburger active state (3 bars → X) --- */
      '.hamburger--active span:nth-child(1){transform:translateY(8px) rotate(45deg);}',
      '.hamburger--active span:nth-child(2){opacity:0;transform:scaleX(0);}',
      '.hamburger--active span:nth-child(3){transform:translateY(-8px) rotate(-45deg);}',
      '.hamburger span{display:block;transition:transform .25s ease,opacity .2s ease;}',

      /* --- Mobile nav open --- */
      '@media(max-width:768px){',
      '  #nav{display:none;position:absolute;top:100%;left:0;right:0;',
      '    background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.12);',
      '    padding:1rem 0 1.5rem;z-index:999;}',
      '  #nav.nav--open{display:block;}',
      '  #nav .nav-list{flex-direction:column;gap:0;}',
      '  #nav .nav-link{display:block;padding:.75rem 1.5rem;font-size:1rem;}',
      '  #nav .dropdown-menu{position:static;box-shadow:none;background:#f8f9fa;',
      '    display:none;padding:.25rem 0;}',
      '  #nav .nav-dropdown.dropdown--open .dropdown-menu{display:block;}',
      '  body.menu-open{overflow:hidden;}',
      '}',

      /* --- Sticky header states --- */
      '.header{transition:transform .3s ease,box-shadow .3s ease;}',
      '.header--scrolled{box-shadow:0 2px 20px rgba(0,0,0,.10);}',
      '.header--hidden{transform:translateY(-110%);}',

      /* --- FAQ icon transition --- */
      '.faq-icon{transition:transform .3s ease;}',

      /* --- Scroll reveal --- */
      '.reveal{opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease;}',
      '.reveal--visible{opacity:1;transform:none;}',

      /* --- Shake animation --- */
      '@keyframes shake{0%,100%{transform:translateX(0);}',
      '20%{transform:translateX(-6px);}40%{transform:translateX(6px);}',
      '60%{transform:translateX(-4px);}80%{transform:translateX(4px);}}',
      '.shake{animation:shake .4s ease;}',

      /* --- Field error styles --- */
      '.input-error{border-color:#ef4444 !important;box-shadow:0 0 0 2px rgba(239,68,68,.15);}',
      '.field-error{display:block;font-size:.78rem;color:#ef4444;margin-top:.25rem;}',

      /* --- Form success message --- */
      '.form-success{display:flex;align-items:center;gap:.75rem;',
      '  padding:1.5rem;border-radius:12px;background:#f0fdf4;',
      '  color:#15803d;font-weight:600;font-size:1rem;',
      '  border:1px solid #bbf7d0;margin-top:1rem;}',
      '.form-success i{font-size:1.5rem;color:#22c55e;}',

      /* --- Inline message (newsletter / hero email) --- */
      '.inline-msg{font-size:.82rem;margin-top:.4rem;font-weight:500;}',
      '.inline-msg--success{color:#15803d;}',
      '.inline-msg--error{color:#ef4444;}',

    ].join('');

    document.head.appendChild(style);
  })();

})();