// ── ADSTERRA & MYBID INTEGRATION ──

(function loadAds() {
    // 1. Adsterra Placeholder (بۆ نموونە ڕیکلامی Banner)
    const adsterraContainer = document.getElementById('adsterra-zone');
    if (adsterraContainer) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        // لێرەدا ئەو URL یان ID یەی ئەدستێرا پێت دەدات دایبنێ
        script.src = '//www.topcreativeformat.com/YOUR_ADSTERRA_ID/invoke.js'; 
        adsterraContainer.appendChild(script);
    }

    // 2. MyBid Integration
    const mybidContainer = document.getElementById('mybid-zone');
    if (mybidContainer) {
        const mbScript = document.createElement('script');
        mbScript.src = 'https://mybid_script_url_here.js'; // لێرەدا لینکی MyBid دابنێ
        mybidContainer.appendChild(mbScript);
    }
})();


function showVideoAd() {
    const modal = document.getElementById('video-ad-modal');
    modal.style.display = 'flex';

    // لێرەدا کۆدی VAST Tag یان Iframe کە کۆمپانیاکە پێت دەدات دایبنێ
    const container = document.getElementById('vast-player-container');
    
    // نموونەی دانانی ڕیکلام بە Iframe (ئەگەر کۆمپانیاکە پێت بدات)
    container.innerHTML = `<iframe src="https://vast.vstserv.com/vast?spot_id=2018957" width="100%" height="360" frameborder="0" scrolling="no"></iframe>`;
}

function closeVideoAd() {
    const modal = document.getElementById('video-ad-modal');
    modal.style.display = 'none';
    document.getElementById('vast-player-container').innerHTML = ''; // بۆ ئەوەی دەنگەکە بوەستێت
}
