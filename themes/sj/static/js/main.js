/* ── Theme toggle ───────────────────────────────────────────── */
const THEME_KEY = 'sj-theme';

function savedTheme() {
  return localStorage.getItem(THEME_KEY);
}
function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function currentTheme() {
  return savedTheme() || systemTheme();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.querySelector('.icon-sun').style.display  = theme === 'dark' ? 'block' : 'none';
  btn.querySelector('.icon-moon').style.display = theme === 'dark' ? 'none'  : 'block';
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

// Apply immediately to prevent flash
applyTheme(currentTheme());

document.addEventListener('DOMContentLoaded', () => {

  /* Theme toggle button */
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    applyTheme(currentTheme());
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      // Update Giscus if loaded
      const frame = document.querySelector('iframe.giscus-frame');
      if (frame) {
        frame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: next === 'dark' ? 'transparent_dark' : 'light' } } },
          'https://giscus.app'
        );
      }
    });
  }

  /* Reading progress bar */
  const bar = document.getElementById('reading-progress');
  if (bar) {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Homepage filter pills */
  const pills = document.querySelectorAll('.filter-pill');
  const grid  = document.getElementById('card-grid');
  if (pills.length && grid) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        grid.querySelectorAll('.card').forEach(card => {
          const show = filter === 'all' || card.dataset.tag === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* Mobile nav toggle */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  /* Smooth scroll for ToC links */
  document.querySelectorAll('.toc-nav a').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Active ToC link highlight on scroll */
  const headings = document.querySelectorAll('.post-body h2, .post-body h3');
  const tocLinks = document.querySelectorAll('.toc-nav a');
  if (headings.length && tocLinks.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove('active'));
          const active = document.querySelector(`.toc-nav a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0% -70% 0%' });
    headings.forEach(h => observer.observe(h));
  }
});
