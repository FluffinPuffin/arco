(function () {
  // ── Path resolution ──────────────────────────────────────────────────────
  var orientEl = document.querySelector('script[src*="orientation.js"]');
  var frameDir = orientEl ? orientEl.src.substring(0, orientEl.src.lastIndexOf('/js/')) : '';

  // ── Styles ──────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent =
    '#arco-orientation-overlay {' +
    '  display: none;' +
    '  position: fixed;' +
    '  inset: 0;' +
    '  z-index: 99999;' +
    '  background-color: #201d63;' +
    '  flex-direction: column;' +
    '  align-items: center;' +
    '  justify-content: center;' +
    '  text-align: center;' +
    '  padding: 2rem;' +
    '  pointer-events: all;' +
    '}' +
    '#arco-orientation-overlay.visible {' +
    '  display: flex;' +
    '}' +
    '#arco-orientation-overlay .orient-graphic {' +
    '  max-width: 280px;' +
    '}' +
    '#arco-orientation-overlay .orient-text {' +
    '  color: #ffffff;' +
    '  font-size: 1.25rem;' +
    '  margin-top: 1.5rem;' +
    '  font-family: sans-serif;' +
    '}';
  document.head.appendChild(style);

  // ── Overlay DOM ──────────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'arco-orientation-overlay';
  overlay.setAttribute('role', 'alert');
  overlay.innerHTML =
    '<img class="orient-graphic" src="' + frameDir + '/images/rotate.svg" alt="">' +
    '<p class="orient-text">Please go to a tablet or computer</p>';

  // ── Logic ────────────────────────────────────────────────────────────────
  function checkOrientation() {
    var shouldShow = window.innerWidth < 768 || window.innerHeight < 600;
    overlay.classList.toggle('visible', shouldShow);
  }

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', function () {
    setTimeout(checkOrientation, 100);
  });

  // ── Mount ────────────────────────────────────────────────────────────────
  function mount() {
    document.body.appendChild(overlay);
    checkOrientation();
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener('DOMContentLoaded', mount);
  }
})();
