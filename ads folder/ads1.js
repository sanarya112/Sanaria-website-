// ══════════════════════════════════════════
//  SANARIA — ads.js
//  MyBidAds ID: 434882
//  Adsterra: Popunder + Social Bar
// ══════════════════════════════════════════

var ADS = {
  enabled:   false,
  popunder:  false,
  socialbar: false,
};

// ══════════════════════════════════════════
//  MYBIDADS — Top Banner (بانەری سەرەوە)
//  دووگمەی داگریساندن و کوژانەوە هەیە
// ══════════════════════════════════════════
function initMyBidAdsBar() {
  var slot = document.getElementById('ad-slot-top');
  if (!slot) return;

  // wrapper
  slot.style.cssText = [
    'position:relative',
    'width:100%',
    'min-height:60px',
    'background:#f0f0f0',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'overflow:visible',
    'transition:all .3s ease',
  ].join(';');

  // دووگمەکان
  var controls = document.createElement('div');
  controls.style.cssText = [
    'position:absolute',
    'top:4px',
    'left:6px',
    'display:flex',
    'gap:5px',
    'z-index:99',
  ].join(';');

  // دووگمەی کوژانەوە ×
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML   = '×';
  closeBtn.title       = 'داخستن';
  closeBtn.style.cssText = [
    'width:22px','height:22px',
    'border-radius:50%',
    'background:rgba(0,0,0,.45)',
    'color:#fff',
    'border:none',
    'font-size:14px',
    'cursor:pointer',
    'display:flex','align-items:center','justify-content:center',
    'line-height:1',
    'transition:background .2s',
  ].join(';');
  closeBtn.onmouseover = function(){ this.style.background='rgba(220,50,50,.8)'; };
  closeBtn.onmouseout  = function(){ this.style.background='rgba(0,0,0,.45)'; };
  closeBtn.onclick = function(e){
    e.stopPropagation();
    slot.style.maxHeight = '0';
    slot.style.minHeight = '0';
    slot.style.overflow  = 'hidden';
    slot.style.padding   = '0';
    slot.style.border    = 'none';
    // کاتێ داخستن، scroll-area بلەندیەکەی دەستکاری بکە
    var sa = document.querySelector('.scroll-area');
    if (sa) sa.style.height = 'calc(100vh - 106px)';
    localStorage.setItem('ad_top_closed', '1');
  };

  // دووگمەی داگریساندن —
  var minBtn = document.createElement('button');
  minBtn.innerHTML   = '—';
  minBtn.title       = 'بچووک بکەرەوە';
  minBtn.style.cssText = closeBtn.style.cssText;
  var _minimized = false;
  minBtn.onmouseover = function(){ this.style.background='rgba(0,120,180,.8)'; };
  minBtn.onmouseout  = function(){ this.style.background='rgba(0,0,0,.45)'; };
  minBtn.onclick = function(e){
    e.stopPropagation();
    _minimized = !_minimized;
    if (_minimized){
      slot.style.maxHeight = '28px';
      slot.style.minHeight = '28px';
      slot.style.overflow  = 'hidden';
      minBtn.innerHTML     = '+';
      minBtn.title         = 'گەورە بکەرەوە';
    } else {
      slot.style.maxHeight = '80px';
      slot.style.minHeight = '60px';
      slot.style.overflow  = 'visible';
      minBtn.innerHTML     = '—';
      minBtn.title         = 'بچووک بکەرەوە';
    }
  };

  controls.appendChild(closeBtn);
  controls.appendChild(minBtn);
  slot.appendChild(controls);

  // بانەری ریکلام — MyBidAds
  var adWrap = document.createElement('div');
  adWrap.style.cssText = 'width:100%;text-align:center;padding-top:4px;';
  slot.appendChild(adWrap);
}

// ══════════════════════════════════════════
//  MYBIDADS — Mid Rectangle (ناوەوە)
//  دووگمەی کوژانەوە هەیە
// ══════════════════════════════════════════
function initMyBidAdsMid() {
  var slot = document.getElementById('ad-slot-mid');
  if (!slot) return;

  slot.style.cssText = [
    'position:relative',
    'margin:10px 12px',
    'min-height:120px',
    'background:#f0f0f0',
    'border-radius:12px',
    'border:1px solid #e0e7ef',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'overflow:visible',
    'transition:all .3s ease',
  ].join(';');

  // دووگمەکان
  var controls = document.createElement('div');
  controls.style.cssText = [
    'position:absolute',
    'top:6px',
    'left:8px',
    'display:flex',
    'gap:5px',
    'z-index:99',
  ].join(';');

  var btnStyle = [
    'width:22px','height:22px',
    'border-radius:50%',
    'background:rgba(0,0,0,.4)',
    'color:#fff','border:none',
    'font-size:13px','cursor:pointer',
    'display:flex','align-items:center','justify-content:center',
    'line-height:1','transition:background .2s',
  ].join(';');

  // کوژانەوە
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML        = '×';
  closeBtn.title            = 'داخستن';
  closeBtn.style.cssText    = btnStyle;
  closeBtn.onmouseover = function(){ this.style.background='rgba(220,50,50,.8)'; };
  closeBtn.onmouseout  = function(){ this.style.background='rgba(0,0,0,.4)'; };
  closeBtn.onclick = function(e){
    e.stopPropagation();
    slot.style.maxHeight = '0';
    slot.style.minHeight = '0';
    slot.style.margin    = '0 12px';
    slot.style.border    = 'none';
    slot.style.overflow  = 'hidden';
    localStorage.setItem('ad_mid_closed','1');
  };

  // داگریساندن
  var minBtn = document.createElement('button');
  minBtn.innerHTML       = '—';
  minBtn.title           = 'بچووک بکەرەوە';
  minBtn.style.cssText   = btnStyle;
  var _min = false;
  minBtn.onmouseover = function(){ this.style.background='rgba(0,120,180,.8)'; };
  minBtn.onmouseout  = function(){ this.style.background='rgba(0,0,0,.4)'; };
  minBtn.onclick = function(e){
    e.stopPropagation();
    _min = !_min;
    var adInner = slot.querySelector('.ad-inner-mid');
    if (_min){
      if (adInner) adInner.style.display = 'none';
      slot.style.minHeight = '32px';
      minBtn.innerHTML     = '+';
      minBtn.title         = 'گەورە بکەرەوە';
    } else {
      if (adInner) adInner.style.display = 'block';
      slot.style.minHeight = '120px';
      minBtn.innerHTML     = '—';
      minBtn.title         = 'بچووک بکەرەوە';
    }
  };

  controls.appendChild(closeBtn);
  controls.appendChild(minBtn);
  slot.appendChild(controls);

  var adInner = document.createElement('div');
  adInner.className       = 'ad-inner-mid';
  adInner.style.cssText   = 'width:100%;text-align:center;';
  slot.appendChild(adInner);
}

// ══════════════════════════════════════════
//  ADSTERRA — Social Bar
//  دووگمەی کوژانەوە لە سەرەوەی barەکەدا
// ══════════════════════════════════════════
function initSocialBar() {
  if (!ADS.enabled || !ADS.socialbar) return;

  var done = false;

  function load() {
    if (done) return; done = true;
    window.removeEventListener('scroll', check, { passive: true });

    // wrapper بۆ Social Bar + دووگمەی کوژانەوە
    var wrap = document.getElementById('ad-slot-socialbar');
    if (!wrap) return;

    wrap.style.cssText = [
      'position:fixed',
      'bottom:0','left:0','right:0',
      'z-index:999',
      'transition:transform .3s ease',
    ].join(';');

    // دووگمەی کوژانەوە
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML   = '× داخستن';
    closeBtn.title       = 'داخستنی ریکلام';
    closeBtn.style.cssText = [
      'position:absolute',
      'top:-26px','left:50%',
      'transform:translateX(-50%)',
      'background:rgba(0,0,0,.6)',
      'color:#fff','border:none',
      'font-size:11px','font-family:inherit',
      'padding:3px 12px',
      'border-radius:20px 20px 0 0',
      'cursor:pointer',
      'white-space:nowrap',
      'backdrop-filter:blur(4px)',
      'transition:background .2s',
      'z-index:1000',
    ].join(';');
    closeBtn.onmouseover = function(){ this.style.background='rgba(180,30,30,.8)'; };
    closeBtn.onmouseout  = function(){ this.style.background='rgba(0,0,0,.6)'; };

    var _hidden = false;
    closeBtn.onclick = function(){
      _hidden = !_hidden;
      if (_hidden){
        wrap.style.transform = 'translateY(100%)';
        closeBtn.innerHTML   = '▲ ریکلام';
        closeBtn.style.top   = '-26px';
      } else {
        wrap.style.transform = 'translateY(0)';
        closeBtn.innerHTML   = '× داخستن';
      }
    };

    wrap.appendChild(closeBtn);

    // Social Bar script
    var s   = document.createElement('script');
    s.async = true;
    s.src   = 'https://pl29054665.profitablecpmratenetwork.com/f1/13/a3/f113a3af57cbce1d601f8168dba08c40.js';
    wrap.appendChild(s);
  }

  function check() { if (window.scrollY > 80) load(); }
  window.addEventListener('scroll', check, { passive: true });
  if (window.scrollY > 80) load();
}

// ══════════════════════════════════════════
//  ADSTERRA — Popunder
//  جارێک بۆ هەر سێشن
// ══════════════════════════════════════════
function initPopunder() {
  if (!ADS.enabled || !ADS.popunder) return;
  if (sessionStorage.getItem('_pop') === '1') return;

  var done = false;
  function fire() {
    if (done) return; done = true;
    sessionStorage.setItem('_pop', '1');
    ['click','touchstart','scroll'].forEach(function(e){
      window.removeEventListener(e, fire, { passive: true });
    });
    var s   = document.createElement('script');
    s.async = true;
    s.src   = 'https://pl29054663.profitablecpmratenetwork.com/8b/bb/0d/8bbb0d8ea76d7c85fa0fd141704f8818.js';
    document.body.appendChild(s);
  }

  ['click','touchstart','scroll'].forEach(function(e){
    window.addEventListener(e, fire, { passive: true });
  });
}

// ══════════════════════════════════════════
//  RESTORE STATE — ئەگەر داخستبوو بمێنێت
// ══════════════════════════════════════════
function restoreAdState() {
  if (localStorage.getItem('ad_top_closed') === '1') {
    var slot = document.getElementById('ad-slot-top');
    if (slot){
      slot.style.maxHeight = '0';
      slot.style.minHeight = '0';
      slot.style.overflow  = 'hidden';
      slot.style.border    = 'none';
    }
  }
  if (localStorage.getItem('ad_mid_closed') === '1') {
    var slotM = document.getElementById('ad-slot-mid');
    if (slotM){
      slotM.style.maxHeight = '0';
      slotM.style.minHeight = '0';
      slotM.style.margin    = '0 12px';
      slotM.style.border    = 'none';
      slotM.style.overflow  = 'hidden';
    }
  }
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
setTimeout(function () {
  restoreAdState();
  initMyBidAdsBar();
  initMyBidAdsMid();
  initPopunder();
  initSocialBar();
}, 900);
