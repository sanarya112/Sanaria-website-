// ── SANARIA — ads.js ──
// ریکلامەکانی Adsterra و MyBidAds لە فایلی جیاوازدا
// تەنها ئەم فایلە بگۆڕە بۆ کنترۆلی ریکلامەکان

var ADS_CONFIG = {
enabled: true,           // false بکە بۆ لابردنی هەموو ریکلامەکان
adsterra: true,          // Adsterra چالاک / ناچالاک
mybitads: true,          // MyBidAds چالاک / ناچالاک
popunder: true,          // Popunder چالاک / ناچالاک
socialbar: true,         // Social Bar چالاک / ناچالاک
delayMs: 1500,           // چاوەڕوانی پێش بارکردنی ریکلام (ms)
};

// ──────────────────────────────────────────
//  MyBidAds — Banner بانەری سەرەوە
// ──────────────────────────────────────────
function loadMyBidAdsBanner() {
if (!ADS_CONFIG.enabled || !ADS_CONFIG.mybitads) return;

var slot = document.getElementById(‘ad-slot-top’);
if (!slot) return;

// دووگمەی بستنەوە
var closeBtn = document.createElement(‘button’);
closeBtn.innerHTML = ‘×’;
closeBtn.style.cssText = ‘position:absolute;top:4px;left:4px;background:rgba(0,0,0,.3);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;z-index:2;line-height:1;’;
closeBtn.onclick = function(){ slot.style.display=‘none’; };

// ── MyBidAds Script ──
// کۆدی خۆت لێرە بدەرەوە
var s = document.createElement(‘script’);
s.async = true;
s.src   = ‘//mybidads.com/ad/YOUR_MYBIDADS_BANNER_ID’; // ← URL ی خۆت بدەرەوە
// نموونە: s.src = ‘//mybidads.com/ad/12345?size=banner’;

slot.appendChild(closeBtn);
slot.appendChild(s);
slot.style.display = ‘flex’;
}

// ──────────────────────────────────────────
//  MyBidAds — Rectangle ناوەوە
// ──────────────────────────────────────────
function loadMyBidAdsRect() {
if (!ADS_CONFIG.enabled || !ADS_CONFIG.mybitads) return;

var slot = document.getElementById(‘ad-slot-mid’);
if (!slot) return;

var s = document.createElement(‘script’);
s.async = true;
s.src   = ‘//mybidads.com/ad/YOUR_MYBIDADS_RECT_ID’; // ← URL ی خۆت بدەرەوە
slot.appendChild(s);
slot.style.display = ‘block’;
}

// ──────────────────────────────────────────
//  Adsterra — Popunder (جارێک بۆ هەر سێشن)
// ──────────────────────────────────────────
function loadAdsterraPopunder() {
if (!ADS_CONFIG.enabled || !ADS_CONFIG.adsterra || !ADS_CONFIG.popunder) return;

var KEY = ‘adsterra_pop_v1’;
if (sessionStorage.getItem(KEY) === ‘1’) return;

var fired = false;
function fire(e) {
if (fired) return;
fired = true;
sessionStorage.setItem(KEY, ‘1’);

``` 
// ── Adsterra Popunder Script ──
var s = document.createElement('script');
s.type  = 'text/javascript';
s.async = true;
s.src   = '//oblivionplaysaltered.com/4f/2b/cb/4f2bcb783237938b5716a72958d1b5c7.js';
// نموونە Adsterra: s.src = '//YOUR_ADSTERRA_POPUNDER_URL.js';
document.body.appendChild(s);

cleanup();
```

}

function cleanup() {
window.removeEventListener(‘click’,      fire, { passive: true });
window.removeEventListener(‘touchstart’, fire, { passive: true });
window.removeEventListener(‘scroll’,     fire, { passive: true });
}

window.addEventListener(‘click’,      fire, { passive: true });
window.addEventListener(‘touchstart’, fire, { passive: true });
window.addEventListener(‘scroll’,     fire, { passive: true });
}

// ──────────────────────────────────────────
//  Adsterra — Social Bar
// ──────────────────────────────────────────
function loadAdsterraSocialBar() {
if (!ADS_CONFIG.enabled || !ADS_CONFIG.adsterra || !ADS_CONFIG.socialbar) return;

var loaded = false;

function inject() {
if (loaded) return;
loaded = true;

```
var slot = document.getElementById('ad-slot-socialbar');

// ── Adsterra Social Bar Script ──
var s = document.createElement('script');
s.type  = 'text/javascript';
s.async = true;
s.src   = '//oblivionplaysaltered.com/fd/18/35/fd1835ea44bb46de288443ce33b32b74.js';
// نموونە: s.src = '//YOUR_ADSTERRA_SOCIALBAR_URL.js';

if (slot) slot.appendChild(s);
else document.body.appendChild(s);

window.removeEventListener('scroll', onScroll, { passive: true });
```

}

function onScroll() {
if (window.scrollY > 100) inject();
}

window.addEventListener(‘scroll’, onScroll, { passive: true });
}

// ──────────────────────────────────────────
//  INIT — هەموو ریکلامەکان بار بکە
// ──────────────────────────────────────────
function initAds() {
if (!ADS_CONFIG.enabled) return;

setTimeout(function () {
loadMyBidAdsBanner();
loadMyBidAdsRect();
loadAdsterraPopunder();
loadAdsterraSocialBar();
}, ADS_CONFIG.delayMs);
}

// کاتێ پەڕەکە بارکرا دەستپێبکە
if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, initAds);
} else {
initAds();
}
