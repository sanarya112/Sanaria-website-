import {
  auth, db, provider,
  signInWithPopup, signOut, onAuthStateChanged,
  doc, setDoc, onSnapshot
} from "./firebase.js";

// ── STATE ──
let accounts    = [];
let activeTab   = 'all';
let currentUser = null;
let unsubListener = null;
let pendingAction = null; // action to run after login

const CURRENCIES = [
  { val: 'IQD', label: 'دینار عێراقی' },
  { val: 'USD', label: 'دۆلاری ئەمریکی' },
  { val: 'SAR', label: 'ریال سعودی' },
  { val: 'BHD', label: 'دینار بەحرەینی' },
  { val: 'YER', label: 'ریال یەمەنی' },
  { val: 'EUR', label: 'یۆرۆ' },
];
const CUR_OPTS = CURRENCIES.map(c => `<option value="${c.val}">${c.label}</option>`).join('');
function curLabel(v) { return (CURRENCIES.find(c => c.val === v) || { label: v }).label; }
function uid()   { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function today() { return new Date().toISOString().split('T')[0]; }

// ── AUTH GUARD ──
// requireAuth(fn) — if logged in runs fn(), else shows login modal and queues fn
window.requireAuth = (fn) => {
  if (currentUser) { fn(); }
  else { pendingAction = fn; showLoginModal(); }
};

// ── CLOUD ──
async function saveToCloud() {
  if (!currentUser) return;
  await setDoc(doc(db, 'users', currentUser.uid), { accounts });
}

function startListening(uid) {
  if (unsubListener) unsubListener();
  unsubListener = onSnapshot(doc(db, 'users', uid), (snap) => {
    accounts = snap.exists() ? (snap.data().accounts || []) : [];
    if (!snap.exists()) seedDemo();
    renderList();
  });
}

function stopListening() {
  if (unsubListener) { unsubListener(); unsubListener = null; }
  accounts = [];
}

function seedDemo() {
  accounts = [{
    id: 'demo1', name: 'ئەڤریم', phone: '0770000000', email: '', type: 'customer',
    transactions: [
      { id: 't1', type: 'debit',  amount: 50,  currency: 'BHD', date: '2026-03-06', desc: '' },
      { id: 't2', type: 'debit',  amount: 100, currency: 'USD', date: '2026-03-06', desc: '' },
      { id: 't3', type: 'credit', amount: 50,  currency: 'USD', date: '2026-03-06', desc: '' },
    ]
  }];
  saveToCloud();
}

// ── AUTH STATE LISTENER ──
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateTopbarUI(user);
  if (user) {
    closeModal('modal-login');
    startListening(user.uid);
    // run pending action if any
    if (pendingAction) { const fn = pendingAction; pendingAction = null; fn(); }
  } else {
    stopListening();
    renderList();
  }
});

// ── AUTH FUNCTIONS ──
window.handleSignIn = async () => {
  const btn = document.getElementById('google-sign-in-btn');
  btn.disabled = true;
  btn.textContent = 'چاوەڕوانبە...';
  try {
    await signInWithPopup(auth, provider);
    toast('✅ بەخێربێیت!');
  } catch (e) {
    toast('❌ داخیلبوون سەرنەکەوت');
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.2C9.5 35.8 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2C41.1 35.5 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg> داخیلبوون بە Google`;
  }
};

window.handleSignOut = async () => {
  closeUserMenu();
  stopListening();
  await signOut(auth);
  renderList();
  toast('👋 لۆگ ئاوت کرایەوە');
};

// ── TOPBAR UI ──
function updateTopbarUI(user) {
  const loginBtn  = document.getElementById('topbar-login-btn');
  const userBtn   = document.getElementById('topbar-user-btn');
  const avatar    = document.getElementById('topbar-avatar');
  const menuAvt   = document.getElementById('menu-avatar');
  const menuName  = document.getElementById('menu-name');
  const menuEmail = document.getElementById('menu-email');

  if (user) {
    loginBtn.style.display  = 'none';
    userBtn.style.display   = 'flex';
    avatar.src              = user.photoURL || '';
    if (menuAvt)   { menuAvt.src           = user.photoURL || ''; }
    if (menuName)  { menuName.textContent  = user.displayName || ''; }
    if (menuEmail) { menuEmail.textContent = user.email || ''; }
  } else {
    loginBtn.style.display  = 'flex';
    userBtn.style.display   = 'none';
  }
}

// ── USER MENU ──
window.toggleUserMenu = () => {
  const m = document.getElementById('user-menu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
};
function closeUserMenu() {
  const m = document.getElementById('user-menu');
  if (m) m.style.display = 'none';
}
document.addEventListener('click', (e) => {
  const menu    = document.getElementById('user-menu');
  const userBtn = document.getElementById('topbar-user-btn');
  if (menu && userBtn && !menu.contains(e.target) && !userBtn.contains(e.target)) {
    menu.style.display = 'none';
  }
});

// ── LOGIN MODAL ──
window.showLoginModal = () => {
  const btn = document.getElementById('google-sign-in-btn');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.8 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.2C9.5 35.8 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2C41.1 35.5 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg> داخیلبوون بە Google`;
  }
  document.getElementById('modal-login').classList.add('show');
};

// ── PAGES ──
window.gotoPage = (id) => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'page-main') renderList();
};

// ── TABS ──
window.filterTab = (type, el) => {
  activeTab = type;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderList();
};

// ── RENDER ──
function typeLabel(t) { return t === 'customer' ? 'کڕیار' : t === 'supplier' ? 'دابینکەر' : 'گشتی'; }

function getBals(a) {
  let bals = {};
  (a.transactions || []).forEach(t => {
    if (!bals[t.currency]) bals[t.currency] = { debit: 0, credit: 0 };
    if (t.type === 'debit') bals[t.currency].debit += Number(t.amount);
    else bals[t.currency].credit += Number(t.amount);
  });
  return bals;
}

function renderList() {
  const el = document.getElementById('user-list');
  if (!el) return;

  if (!currentUser) {
    el.innerHTML = `
      <div class="login-prompt" onclick="showLoginModal()">
        <div class="lp-icon">🔐</div>
        <div class="lp-title">داخیلبوون پێویستە</div>
        <div class="lp-sub">بۆ بینین و بەڕێوەبردنی ئەکاونتەکانت</div>
        <button class="lp-btn">داخیلبوون بە Google</button>
      </div>`;
    return;
  }

  let list = activeTab === 'all' ? accounts : accounts.filter(a => a.type === activeTab);
  if (!list.length) {
    el.innerHTML = '<div class="empty-msg" style="padding:28px 0">هیچ ئەکاونتێک نییە.<br>دووگمەی + بکەرەوە بۆ زیادکردن.</div>';
    return;
  }
  el.innerHTML = list.map(buildCard).join('');
}

function buildCard(a) {
  const bals = getBals(a);
  const hasT = (a.transactions || []).length > 0;

  const balChips = Object.entries(bals).map(([cur, b]) => {
    const rem = b.debit - b.credit;
    return `<span class="bal-chip bc-d">▲ ${b.debit} <small>${curLabel(cur)}</small></span>
            <span class="bal-chip bc-c">▼ ${b.credit} <small>${curLabel(cur)}</small></span>
            <span class="bal-chip bc-r ${rem >= 0 ? 'neg' : 'pos'}">⚖ ${Math.abs(rem)} <small>${curLabel(cur)}</small></span>`;
  }).join('');

  const tRows = (a.transactions || []).map((t, i) => `
    <tr>
      <td style="font-size:.72rem;color:var(--text-light)">${t.date}</td>
      <td style="max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.desc || '—'}</td>
      <td>${t.type === 'debit'  ? `<span class="amt-o">${t.amount}</span>` : '—'}</td>
      <td>${t.type === 'credit' ? `<span class="amt-g">${t.amount}</span>` : '—'}</td>
      <td><span class="cur-tag ct-${t.currency}">${curLabel(t.currency)}</span></td>
      <td><button class="btn-del-row" onclick="delTrans('${a.id}',${i})">🗑</button></td>
    </tr>`).join('');

  const sumChips = Object.entries(bals).map(([cur, b]) => {
    const rem = b.debit - b.credit;
    return `<div class="sum-chip">
      <div class="sl">${curLabel(cur)}</div>
      <div class="sv" style="color:${rem > 0 ? 'var(--orange)' : rem < 0 ? 'var(--green)' : 'var(--text-light)'}">
        ${Math.abs(rem)} ${rem > 0 ? 'مەدین' : rem < 0 ? 'دائن' : 'سفر'}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="user-card" id="card-${a.id}">
    <div class="user-card-header" onclick="togglePanel('${a.id}')">
      <div class="user-hdr-left">
        <span class="link-detail" onclick="event.stopPropagation();showDetail('${a.id}')">وردەکاری</span>
        <button class="btn-del-user" onclick="event.stopPropagation();askDeleteUser('${a.id}','${a.name}')">🗑</button>
        <button class="btn-add-trans" onclick="event.stopPropagation();openForm('${a.id}')">+</button>
      </div>
      <div class="user-info">
        <div>
          <div class="user-name">${a.name}</div>
          <span class="user-type-tag">${typeLabel(a.type)}</span>
        </div>
        <div class="user-avatar">👤</div>
      </div>
    </div>
    ${Object.keys(bals).length ? `<div class="user-balance-row">${balChips}</div>` : ''}
    <div class="trans-panel" id="panel-${a.id}">
      <div class="add-form">
        <div class="frow">
          <div class="field"><label>بڕی پارە</label><input type="number" id="amt-${a.id}" placeholder="٠" min="0" step="any"></div>
          <div class="field"><label>دراو</label><select id="cur-${a.id}">${CUR_OPTS}</select></div>
        </div>
        <div class="frow">
          <div class="field"><label>بەروار</label><input type="date" id="date-${a.id}" value="${today()}"></div>
          <div class="field span2" style="grid-column:2/3"><label>بیان</label><input type="text" id="desc-${a.id}" placeholder="بیان..."></div>
        </div>
        <div class="form-btns">
          <button class="btn-down" onclick="addTrans('${a.id}','debit')">▼ مەدین</button>
          <button class="btn-up"   onclick="addTrans('${a.id}','credit')">▲ دائن</button>
        </div>
      </div>
      ${hasT ? `
        <table class="trans-table">
          <thead><tr><th>بەروار</th><th>بیان</th><th>مەدین▼</th><th>دائن▲</th><th>دراو</th><th></th></tr></thead>
          <tbody>${tRows}</tbody>
        </table>
        ${Object.keys(bals).length ? `<div class="sum-row">${sumChips}</div>` : ''}
      ` : '<div class="empty-msg">هیچ مامەڵەیەک نییە</div>'}
    </div>
  </div>`;
}

// ── PANEL ──
window.togglePanel = (id) => document.getElementById('panel-' + id).classList.toggle('open');
window.openForm    = (id) => {
  document.getElementById('panel-' + id).classList.add('open');
  setTimeout(() => document.getElementById('amt-' + id)?.focus(), 80);
};

// ── ADD TRANS ──
window.addTrans = async (id, type) => {
  if (!currentUser) { pendingAction = () => window.addTrans(id, type); showLoginModal(); return; }
  const a = accounts.find(a => a.id === id); if (!a) return;
  const amt = parseFloat(document.getElementById('amt-' + id).value);
  if (!amt || amt <= 0) { toast('تکایە بڕی پارەکە بنووسە'); return; }
  const cur  = document.getElementById('cur-'  + id).value;
  const date = document.getElementById('date-' + id).value || today();
  const desc = document.getElementById('desc-' + id).value.trim();
  if (!a.transactions) a.transactions = [];
  a.transactions.push({ id: uid(), type, amount: amt, currency: cur, date, desc });
  await saveToCloud();
  toast(type === 'credit' ? '✅ دائن زیاد کرا' : '✅ مەدین زیاد کرا');
};

// ── DEL TRANS ──
window.delTrans = async (aid, idx) => {
  const a = accounts.find(a => a.id === aid); if (!a) return;
  a.transactions.splice(idx, 1);
  await saveToCloud();
  toast('🗑 مامەڵەکە سڕایەوە');
};

// ── DEL USER ──
window.askDeleteUser = (id, name) => {
  document.getElementById('confirm-msg').textContent = `دەتەوێت ئەکاونتی "${name}" بسڕیتەوە؟`;
  document.getElementById('cf-yes').onclick = async () => {
    accounts = accounts.filter(a => a.id !== id);
    await saveToCloud();
    closeModal('modal-confirm');
    toast('🗑 ئەکاونت سڕایەوە');
  };
  document.getElementById('modal-confirm').classList.add('show');
};

// ── SAVE ACCOUNT ──
window.saveAccount = async () => {
  if (!currentUser) { showLoginModal(); return; }
  const name = document.getElementById('nf-name').value.trim();
  if (!name) { toast('تکایە ناوەکەت بنووسە'); return; }
  accounts.push({
    id: uid(), name,
    phone: document.getElementById('nf-phone').value.trim(),
    email: document.getElementById('nf-email').value.trim(),
    type:  document.getElementById('nf-type').value,
    transactions: []
  });
  await saveToCloud();
  ['nf-name','nf-phone','nf-email'].forEach(i => document.getElementById(i).value = '');
  toast('✅ ئەکاونت پاشەکەوت کرا');
  window.gotoPage('page-main');
};

// ── SUMMARY ──
window.showSummaryModal = () => {
  let totals = {};
  accounts.forEach(a => {
    (a.transactions || []).forEach(t => {
      if (!totals[t.currency]) totals[t.currency] = { debit: 0, credit: 0 };
      if (t.type === 'debit') totals[t.currency].debit += Number(t.amount);
      else totals[t.currency].credit += Number(t.amount);
    });
  });
  const rows = Object.entries(totals).map(([cur, b]) => {
    const rem = b.debit - b.credit;
    return `<tr><td>${curLabel(cur)}</td><td class="cr">${b.credit}</td><td class="dr">${b.debit}</td><td class="bl ${rem >= 0 ? 'neg' : 'pos'}">${Math.abs(rem)}</td></tr>`;
  }).join('');
  document.getElementById('summary-title').textContent = '📊 کۆی بڕەکان بە دراو';
  document.getElementById('summary-tbody').innerHTML   = rows || '<tr><td colspan="4" style="text-align:center;color:#999;padding:14px">هیچ داتایەک نییە</td></tr>';
  document.getElementById('modal-summary').classList.add('show');
};

window.showDetail = (aid) => {
  const a = accounts.find(a => a.id === aid); if (!a) return;
  const bals = getBals(a);
  const rows = Object.entries(bals).map(([cur, b]) => {
    const rem = b.debit - b.credit;
    return `<tr><td>${curLabel(cur)}</td><td class="cr">${b.credit}</td><td class="dr">${b.debit}</td><td class="bl ${rem >= 0 ? 'neg' : 'pos'}">${Math.abs(rem)}</td></tr>`;
  }).join('');
  document.getElementById('summary-title').textContent = '📋 ' + a.name;
  document.getElementById('summary-tbody').innerHTML   = rows || '<tr><td colspan="4" style="text-align:center;color:#999;padding:14px">هیچ مامەڵەیەک نییە</td></tr>';
  document.getElementById('modal-summary').classList.add('show');
};

// ── MODAL ──
window.closeModal = (id) => document.getElementById(id).classList.remove('show');
document.querySelectorAll('.modal-bg').forEach(el =>
  el.addEventListener('click', e => {
    if (e.target === el) el.classList.remove('show');
  })
);

// ── TOAST ──
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2300);
}

////end line

  // ===== Auth Modal Logic: tabs, signup/login, OTP verification =====
  function showAuthPanel(name){
    var panels = document.querySelectorAll('#authModal .auth-panel');
    panels.forEach(function(p){ p.classList.remove('active'); p.setAttribute('aria-hidden','true'); });
    var panel = document.getElementById('panel-'+name);
    if (panel) { panel.classList.add('active'); panel.setAttribute('aria-hidden','false'); }
    var tabs = document.querySelectorAll('#authModal .auth-tabs .tab-btn');
    tabs.forEach(function(btn){ btn.setAttribute('aria-selected', String(btn.dataset.tab === name)); });
  }

  function getUsersDb(){
    try { return JSON.parse(localStorage.getItem('users_db')||'{}'); } catch { return {}; }
  }
  function setUsersDb(db){ localStorage.setItem('users_db', JSON.stringify(db)); }

  function makeOtp(){ return String(Math.floor(100000 + Math.random()*900000)); }

  function sendOtpEmailFallback(email, code){
    // Optional: call server to send email if configured; otherwise log to console
    try {
      fetch('submit.php', { method:'POST', body: new URLSearchParams({ type:'otp', email: email, q: code }) });
    } catch(e) {}
    console.log('OTP for', email, ':', code);
    alert('کۆدی پشتڕاستکردنەوە نێردرا؛ تکایە پۆستەکەت بپشکنە. \nکۆد: '+code);
  }

  function bindAuthModal(){
    var modal = document.getElementById('authModal');
    if (!modal) return;
    // Tabs
    modal.querySelectorAll('.auth-tabs .tab-btn').forEach(function(btn){
      btn.addEventListener('click', function(){ showAuthPanel(btn.dataset.tab); });
    });
    // Close
    var closeBtn = document.getElementById('authClose');
    closeBtn && closeBtn.addEventListener('click', function(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); try { document.body.style.overflow = 'auto'; } catch {} });
    var escBtn = document.getElementById('authEscBtn');
    escBtn && escBtn.addEventListener('click', function(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); try { document.body.style.overflow = 'auto'; } catch {} });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && modal.classList.contains('open')) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); try { document.body.style.overflow = 'auto'; } catch {} } });

    // Forms
    var signupForm = document.getElementById('signupForm');
    var loginForm = document.getElementById('loginForm');
    var verifyForm = document.getElementById('verifyForm');
    var verifyEmailInput = document.getElementById('verifyEmail');
    var resendBtn = document.getElementById('resendCodeBtn');

    // Forgot password link
    var forgotLink = document.getElementById('forgotLink');
    if (forgotLink) forgotLink.addEventListener('click', function(e){ e.preventDefault(); showAuthPanel('reset'); });
    var resetReqForm = document.getElementById('resetRequestForm');
    var resetVerifyForm = document.getElementById('resetVerifyForm');

    resetReqForm && resetReqForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (document.getElementById('resetEmail')?.value||'').trim().toLowerCase();
      if (!email) { alert('تکایە ئیمەیڵ بنووسە'); return; }
      var db = getUsersDb();
      if (!db[email]) { alert('ئیمەیڵ نەناسراوە. تکایە ساین‌ئەپ بکە یان ئیمەیڵی تر تاقی بکەرەوە.'); return; }
      var code = makeOtp();
      db[email].resetOtp = code; db[email].resetAt = Date.now(); setUsersDb(db);
      try { fetch('submit.php', { method:'POST', body: new URLSearchParams({ type:'reset', email: email, q: code }) }); } catch(e) {}
      alert('کۆدی گۆرینی وشەی نهێنی نێردرا. تکایە پۆستەکەت بپشکنە.');
    });

    resetVerifyForm && resetVerifyForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (document.getElementById('resetEmail')?.value||'').trim().toLowerCase();
      var code = (document.getElementById('resetCode')?.value||'').trim();
      var newPass = (document.getElementById('resetNewPass')?.value||'');
      if (!email || !code || !newPass) { alert('تکایە خانەکان پڕبکەرەوە'); return; }
      var db = getUsersDb(); var rec = db[email];
      if (!rec || !rec.resetOtp) { alert('هیچ داواکاری گۆرین نەدۆزرایەوە.'); return; }
      if (rec.resetOtp !== code) { alert('کۆد هەڵەیە.'); return; }
      rec.password = newPass; delete rec.resetOtp; delete rec.resetAt; setUsersDb(db);
      alert('وشەی نهێنی نوێ کرا. تکایە بچۆ ژوورەوە.');
      showAuthPanel('login');
    });

    // Signup/login/verify handlers (existing)
    signupForm && signupForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (document.getElementById('signupEmail')?.value||'').trim().toLowerCase();
      var pass1 = document.getElementById('signupPassword')?.value||'';
      var pass2 = document.getElementById('signupPassword2')?.value||'';
      if (!email || !pass1 || pass1 !== pass2) { alert('تکایە زانیاریەکان دروست بنووسە.'); return; }
      var db = getUsersDb();
      if (db[email]?.verified) { alert('ئەم ئیمەیڵە پێشتر تۆمار کراوە. تکایە بچۆ ژوورەوە.'); showAuthPanel('login'); return; }
      var code = makeOtp();
      db[email] = { password: pass1, verified: false, otp: code, createdAt: Date.now() };
      setUsersDb(db);
      localStorage.setItem('pending_verify_email', email);
      verifyEmailInput && (verifyEmailInput.value = email);
      sendOtpEmailFallback(email, code);
      showAuthPanel('verify');
    });

    loginForm && loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (document.getElementById('loginEmail')?.value||'').trim().toLowerCase();
      var pass = document.getElementById('loginPassword')?.value||'';
      var db = getUsersDb();
      var rec = db[email];
      if (!rec) { alert('هیچ حسابێك نەدۆزرایەوە. تکایە حساب دروست بکە.'); showAuthPanel('signup'); return; }
      if (!rec.verified) { localStorage.setItem('pending_verify_email', email); verifyEmailInput && (verifyEmailInput.value = email); showAuthPanel('verify'); return; }
      if (rec.password !== pass) { alert('وشەی نهێنی هەڵەیە.'); return; }
      localStorage.setItem('session_user', email);
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); try { document.body.style.overflow = 'auto'; } catch {}
      updateHeaderAuthUI();
    });

    verifyForm && verifyForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = (verifyEmailInput?.value||localStorage.getItem('pending_verify_email')||'').toLowerCase();
      var code = (document.getElementById('verifyCode')?.value||'').trim();
      var db = getUsersDb();
      var rec = db[email];
      if (!rec) { alert('ئیمەیڵ نەناسراوە.'); return; }
      if (rec.verified) { alert('پێشتر پشتڕاستکرایەوە، تکایە بچۆ ژوورەوە.'); showAuthPanel('login'); return; }
      if (rec.otp !== code) { alert('کۆدی پشتڕاستکردنەوە هەڵەیە.'); return; }
      rec.verified = true; delete rec.otp; setUsersDb(db);
      localStorage.removeItem('pending_verify_email');
      localStorage.setItem('session_user', email);
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); try { document.body.style.overflow = 'auto'; } catch {}
      updateHeaderAuthUI();
    });

    resendBtn && resendBtn.addEventListener('click', function(){
      var email = (verifyEmailInput?.value||localStorage.getItem('pending_verify_email')||'').toLowerCase();
      var db = getUsersDb();
      if (!email || !db[email]) { alert('ئیمەیڵ نەناسراوە.'); return; }
      var code = makeOtp(); db[email].otp = code; setUsersDb(db);
      sendOtpEmailFallback(email, code);
      alert('کۆد نێردراوە دووبارە.');
    });

    // Deep link
    try { var params = new URLSearchParams(window.location.search); if (params.get('login') === '1') { openAuthModalIfExists(); showAuthPanel('login'); } } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAuthModal);
  } else {
    bindAuthModal();
  }

  // Password visibility toggle
  function bindPasswordToggle(){
    var btn = document.getElementById('togglePassword');
    var input = document.getElementById('loginPassword');
    if (!btn || !input) return;
    btn.addEventListener('click', function(){
      var isPwd = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPwd ? 'text' : 'password');
      btn.setAttribute('aria-label', isPwd ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPasswordToggle);
  } else { bindPasswordToggle(); }
