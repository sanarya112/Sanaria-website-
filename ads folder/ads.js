// ── SANARIA — ads.js ──

var ADS_CONFIG = {
  enabled:   false,
  adsterra:  false,
  popunder:  false,
  socialbar: false,
  delayMs:   1000,
};

// ════════════════════════════════════
//  Adsterra — Popunder
//  (جارێک بۆ هەر سێشن، بە یەکەم کلیک)
// ════════════════════════════════════
function loadAdsterraPopunder() {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.adsterra || !ADS_CONFIG.popunder) return;

  var KEY = 'ads_pop_v3';
  if (sessionStorage.getItem(KEY) === '1') return;

  var fired = false;

  function fire() {
    if (fired) return;
    fired = true;
    sessionStorage.setItem(KEY, '1');
    cleanup();

    var s   = document.createElement('script');
    s.type  = 'text/javascript';
    s.async = true;
    s.src   = 'https://pl29054663.profitablecpmratenetwork.com/8b/bb/0d/8bbb0d8ea76d7c85fa0fd141704f8818.js';
    document.body.appendChild(s);
  }

  function cleanup() {
    ['click','touchstart','scroll'].forEach(function(ev){
      window.removeEventListener(ev, fire, { passive: true });
    });
  }

  ['click','touchstart','scroll'].forEach(function(ev){
    window.addEventListener(ev, fire, { passive: true });
  });
}

// ════════════════════════════════════
//  Adsterra — Social Bar
// ════════════════════════════════════
function loadAdsterraSocialBar() {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.adsterra || !ADS_CONFIG.socialbar) return;

  var loaded = false;

  function inject() {
    if (loaded) return;
    loaded = true;
    window.removeEventListener('scroll', onScroll, { passive: true });

    var s   = document.createElement('script');
    s.type  = 'text/javascript';
    s.async = true;
    s.src   = 'https://pl29054665.profitablecpmratenetwork.com/f1/13/a3/f113a3af57cbce1d601f8168dba08c40.js';

    var slot = document.getElementById('ad-slot-socialbar');
    if (slot) slot.appendChild(s);
    else document.body.appendChild(s);
  }

  function onScroll() {
    if (window.scrollY > 80) inject();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  if (window.scrollY > 80) inject();
}

// ════════════════════════════════════
//  INIT
// ════════════════════════════════════
function initAds() {
  if (!ADS_CONFIG.enabled) return;
  setTimeout(function () {
    loadAdsterraPopunder();
    loadAdsterraSocialBar();
  }, ADS_CONFIG.delayMs);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAds);
} else {
  initAds();
}
