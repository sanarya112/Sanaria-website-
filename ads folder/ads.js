// ── SANARIA — ads.js ──
// کنترۆلی هەموو ریکلامەکان لە ئێرەوە

var ADS_CONFIG = {
  enabled:   true,   // false بکە بۆ لابردنی هەموو ریکلامەکان
  adsterra:  true,   // Adsterra چالاک / ناچالاک
  mybitads:  true,   // MyBidAds چالاک / ناچالاک
  popunder:  true,   // Popunder چالاک / ناچالاک
  socialbar: true,   // Social Bar چالاک / ناچالاک
  delayMs:   800,    // چاوەڕوانی پێش بارکردنی ریکلام (ms)
};

// ════════════════════════════════════════
//  MyBidAds — Banner سەرەوە
// ════════════════════════════════════════
function loadMyBidAdsBanner() {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.mybitads) return;

  var slot = document.getElementById('ad-slot-top');
  if (!slot) return;

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = 'position:absolute;top:4px;left:4px;background:rgba(0,0,0,.35);color:#fff;border:none;border-radius:50%;width:22px;height:22px;font-size:13px;cursor:pointer;z-index:9;line-height:1;display:flex;align-items:center;justify-content:center;';
  closeBtn.onclick = function () { slot.style.display = 'none'; };

  var s = document.createElement('script');
  s.async = true;
  s.src   = 'https://js.mbidadm.com/static/scripts.js';
  s.setAttribute('data-admpid', '434882');

  slot.style.display   = 'flex';
  slot.style.minHeight = '60px';
  slot.appendChild(closeBtn);
  slot.appendChild(s);
}

// ════════════════════════════════════════
//  MyBidAds — Rectangle ناوەوە
// ════════════════════════════════════════
function loadMyBidAdsRect() {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.mybitads) return;

  var slot = document.getElementById('ad-slot-mid');
  if (!slot) return;

  var s = document.createElement('script');
  s.async = true;
  s.src   = 'https://js.mbidadm.com/static/scripts.js';
  s.setAttribute('data-admpid', '434882');

  slot.style.display   = 'block';
  slot.style.minHeight = '120px';
  slot.appendChild(s);
}

// ════════════════════════════════════════
//  Adsterra — Popunder
//  (جارێک بۆ هەر سێشن)
// ════════════════════════════════════════
function loadAdsterraPopunder() {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.adsterra || !ADS_CONFIG.popunder) return;

  var KEY = 'ads_pop_fired_v2';
  if (sessionStorage.getItem(KEY) === '1') return;

  var fired = false;

  function fire() {
    if (fired) return;
    fired = true;
    sessionStorage.setItem(KEY, '1');
    cleanup();

    var s = document.createElement('script');
    s.type  = 'text/javascript';
    s.async = true;
    s.src   = 'https://pl29054663.profitablecpmratenetwork.com/8b/bb/0d/8bbb0d8ea76d7c85fa0fd141704f8818.js';
    document.body.appendChild(s);
  }

  function cleanup() {
    ['click', 'touchstart', 'scroll'].forEach(function (ev) {
      window.removeEventListener(ev, fire, { passive: true });
    });
  }

  ['click', 'touchstart', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, fire, { passive: true });
  });
}

// ════════════════════════════════════════
//  Adsterra — Social Bar
// ════════════════════════════════════════
function loadAdsterraSocialBar() {
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.adsterra || !ADS_CONFIG.socialbar) return;

  var loaded = false;

  function inject() {
    if (loaded) return;
    loaded = true;
    window.removeEventListener('scroll', onScroll, { passive: true });

    var s = document.createElement('script');
    s.type  = 'text/javascript';
    s.async = true;
    s.src   = 'https://pl29054665.profitablecpmratenetwork.com/f1/13/a3/f113a3af57cbce1d601f8168dba08c40.js';

    var slot = document.getElementById('ad-slot-socialbar');
    if (slot) slot.appendChild(s);
    else document.body.appendChild(s);
  }

  function onScroll() {
    if (window.scrollY > 100) inject();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  if (window.scrollY > 100) inject();
}

// ════════════════════════════════════════
//  INIT
// ════════════════════════════════════════
function initAds() {
  if (!ADS_CONFIG.enabled) return;
  setTimeout(function () {
    loadMyBidAdsBanner();
    loadMyBidAdsRect();
    loadAdsterraPopunder();
    loadAdsterraSocialBar();
  }, ADS_CONFIG.delayMs);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAds);
} else {
  initAds();
}
