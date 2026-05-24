// WeCare 2.0 — App Logic

// ── Navigation parent map ──────────────────────────────────────────────────
const NAV_PARENT = {"page-al": "page-main", "page-al-1": "page-al", "page-al-2": "page-al", "page-al-3": "page-al", "page-pp": "page-main", "page-pp-collaborate": "page-pp", "page-pp-c-1": "page-pp-collaborate", "page-pp-c-2": "page-pp-collaborate", "page-pp-act": "page-pp", "page-pp-a-1": "page-pp-act", "page-pp-a-2": "page-pp-act", "page-pp-respect": "page-pp", "page-pp-r-1": "page-pp-respect", "page-pp-r-2": "page-pp-respect", "page-pp-empower": "page-pp", "page-pp-e-1": "page-pp-empower", "page-pp-e-2": "page-pp-empower", "page-we": "page-main", "page-we-1": "page-we", "page-we-1-1": "page-we-1", "page-we-2": "page-we", "page-we-3": "page-we", "page-we-4": "page-we", "page-we-5": "page-we", "page-we-6": "page-we", "page-c1": "page-we-6", "page-c2": "page-we-6", "page-c3": "page-we-6", "page-c4": "page-we-6", "page-c5": "page-we-6", "page-c6": "page-we-6", "page-c7": "page-we-6", "page-c8": "page-we-6", "page-c9": "page-we-6", "page-c10": "page-we-6"};

// ── History stack ──────────────────────────────────────────────────────────
const history = [];

// ── Cookie helpers ─────────────────────────────────────────────────────────
function setCookie(name, val, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = name + '=' + val + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
}
function getCookie(name) {
  const v = document.cookie.split(';').find(c => c.trim().startsWith(name + '='));
  return v ? v.trim().split('=')[1] : null;
}

// ── Core navigation ────────────────────────────────────────────────────────
function navigate(pageId, isBack = false) {
  const current = document.querySelector('.page.active');
  if (current && current.id === pageId) return;

  // Push current to history unless going back
  if (!isBack && current) history.push(current.id);

  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'back-anim');
  });
  const target = document.getElementById(pageId);
  if (!target) return;
  if (isBack) target.classList.add('back-anim');
  target.classList.add('active');

  // Scroll the page content to top
  requestAnimationFrame(() => {
    target.querySelectorAll(
      '.al-wrap, .pp-cards-wrap, .pp-detail-wrap, .we-body, ' +
      '.we-content-body, .si-overview-body, .si-detail-body, ' +
      '.osc-body, .osc-detail-body, .al-svg-container, .pp-overview-wrap'
    ).forEach(el => { el.scrollTop = 0; });
    window.scrollTo(0, 0);
  });
}

// ── Go back (uses history stack, falls back to NAV_PARENT) ─────────────────
function goBack() {
  if (history.length > 0) {
    const prev = history.pop();
    navigate(prev, true);
  } else {
    const current = document.querySelector('.page.active');
    if (!current) return;
    const parent = NAV_PARENT[current.id];
    if (parent) navigate(parent, true);
  }
}

// ── Password check ─────────────────────────────────────────────────────────
function checkPassword() {
  const input = document.getElementById('pwd-input');
  const error = document.getElementById('pwd-error');
  if (input.value === 'WeCare') {
    setCookie('wc_auth', '1', 365);
    navigate('page-main');
  } else {
    error.textContent = 'Incorrect password. Please try again.';
    input.classList.add('error');
    input.value = '';
    setTimeout(() => { input.classList.remove('error'); error.textContent = ''; }, 2000);
  }
}

// ── Tab switch ─────────────────────────────────────────────────────────────
function switchTab(btn, panelId) {
  const tabWrap = btn.closest('.tab-wrap');
  const page = btn.closest('.page');
  tabWrap.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  page.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

// ── Swipe-to-go-back ───────────────────────────────────────────────────────
(function initSwipe() {
  let startX = 0, startY = 0, startTime = 0;
  const SWIPE_THRESHOLD = 60;   // px horizontal travel
  const EDGE_ZONE      = 60;    // px from left edge to start swipe
  const MAX_ANGLE      = 40;    // degrees — ignore mostly-vertical swipes
  const MAX_DURATION   = 400;   // ms

  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX    = t.clientX;
    startY    = t.clientY;
    startTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx   = t.clientX - startX;
    const dy   = t.clientY - startY;
    const dt   = Date.now() - startTime;
    const angle = Math.abs(Math.atan2(Math.abs(dy), dx) * 180 / Math.PI);

    // Must be: right-swipe, from left edge, fast, shallow angle
    if (dx > SWIPE_THRESHOLD &&
        startX < EDGE_ZONE   &&
        dt < MAX_DURATION    &&
        angle < MAX_ANGLE) {
      goBack();
    }
  }, { passive: true });
})();

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (getCookie('wc_auth') === '1') {
    navigate('page-main');
  }
});
