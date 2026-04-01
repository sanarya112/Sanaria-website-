// ── script.js — Sanaria (Firebase Compat SDK) ──

// ── STATE ──
let accounts      = [];
let activeTab     = 'all';
let currentUser   = null;
let unsubListener = null;
let pendingAction = null;

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

// ── WAIT FOR FIREBASE ──
function getAuth() {
  if (!window.SANARIA_AUTH) {
    try { return firebase.auth(); } catch(e) {}
  }
  return window.SANARIA_AUTH;
}
function getDB() {
  if (!window.SANARIA_DB) {
    try { return firebase.firestore(); } catch(e) {}
  }
  return window.SANARIA_DB;
}
function getProvider() {
  if (!window.SANARIA_PROVIDER) {
    try { return new firebase.auth.GoogleAuthProvider(); } catch(e) {}
  }
  return window.SANARIA_PROVIDER;
}

// ── AUTH GUARD ──
window.requireAuth = (fn) => {
  if (currentUser) fn();
  else { pendingAction = fn; showLoginModal('login'); }
};

// ── CLOUD ──
async function saveToCloud() {
  if (!currentUser) return;
  await getDB().collection('users').doc(currentUser.uid).set({ accounts });
}

function startListening(uid) {
  if (unsubListener) unsubListener();
  unsubListener = getDB().collection('users').doc(uid).onSnapshot((snap) => {
    if (snap.exists) {
      accounts = snap.data().accounts || [];
    } else {
      accounts = [];
      seedDemo();
    }
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

// ── AUTH STATE ──
function initAuth() {
  getAuth().onAuthStateChanged((user) => {
    currentUser = user;
    updateTopbarUI(user);
    if (user) {
      closeModal('modal-login');
      startListening(user.uid);
      if (pendingAction) { const fn = pendingAction; pendingAction = null; fn(); }
    } else {
      stopListening();
      renderList();
    }
  });
}

// ── TOPBAR UI ──
function updateTopbarUI(user) {
  const loginBtn  = document.getElementById('topbar-login-btn');
  const userBtn   = document.getElementById('topbar-user-btn');
  const avatar    = document.getElementById('topbar-avatar');
  const menuAvt   = document.getElementById('menu-avatar');
  const menuName  = document.getElementById('menu-name');
  const menuEmail = document.getElementById('menu-email');
  if (!loginBtn) return;
  if (user) {
    loginBtn.style.display = 'none';
    userBtn.style.display  = 'flex';
    const photo = user.photoURL ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=00a8b5&color=fff&size=64`;
    avatar.src  = photo;
    if (menuAvt)   menuAvt.src           = photo;
    if (menuName)  menuName.textContent  = user.displayName || user.email.split('@')[0];
    if (menuEmail) menuEmail.textContent = user.email;
  } else {
    loginBtn.style.display = 'flex';
    userBtn.style.display  = 'none';
  }
}

// ── USER MENU ──
window.toggleUserMenu = () => {
  const m = document.getElementById('user-menu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
};
document.addEventListener('click', (e) => {
  const menu    = document.getElementById('user-menu');
  const userBtn = document.getElementById('topbar-user-btn');
  if (menu && userBtn && !menu.contains(e.target) && !userBtn.contains(e.target))
    menu.style.display = 'none';
});

// ── AUTH MODAL ──
window.showLoginModal = (tab = 'login') => {
  clearAuthError();
  document.getElementById('modal-login').classList.add('show');
  switchTab(tab);
};

window.switchTab = (tab) => {
  document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  clearAuthError();
};

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent   = msg;
  el.style.display = 'block';
}
function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

// ── EMAIL LOGIN ──
window.doEmailLogin = async () => {
  clearAuthError();
  const email = document.getElementById('li-email').value.trim();
  const pass  = document.getElementById('li-pass').value;
  if (!email || !pass) { showAuthError('تکایە هەموو خانەکان پڕ بکەرەوە'); return; }
  try {
    await getAuth().signInWithEmailAndPassword(email, pass);
    toast('✅ بەخێربێیت!');
  } catch (e) {
    const msgs = {
      'auth/user-not-found':     'ئەم ئیمەیڵە تۆمار نەکراوە',
      'auth/wrong-password':     'پاسووەردەکە هەڵەیە',
      'auth/invalid-email':      'ئیمەیڵەکە هەڵەیە',
      'auth/invalid-credential': 'ئیمەیڵ یان پاسووەرد هەڵەیە',
      'auth/too-many-requests':  'زۆر هەوڵت دا، کەمێ چاوەڕوانبە',
    };
    showAuthError(msgs[e.code] || 'هەڵەیەک ڕووی دا: ' + e.message);
  }
};

// ── REGISTER ──
window.doRegister = async () => {
  clearAuthError();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) { showAuthError('تکایە هەموو خانەکان پڕ بکەرەوە'); return; }
  if (pass.length < 6) { showAuthError('پاسووەرد دەبێت ٦ پیت زیاتر بێت'); return; }
  try {
    const cred = await getAuth().createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    toast('✅ تۆمارکردن سەرکەوت، بەخێربێیت!');
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'ئەم ئیمەیڵە پێشتر تۆمارکراوە',
      'auth/invalid-email':        'ئیمەیڵەکە هەڵەیە',
      'auth/weak-password':        'پاسووەرد زۆر سووک، قورستر بکەرەوە',
    };
    showAuthError(msgs[e.code] || 'هەڵەیەک ڕووی دا: ' + e.message);
  }
};

// ── GOOGLE LOGIN ──
window.handleSignIn = async () => {
  clearAuthError();
  try {
    await getAuth().signInWithPopup(getProvider());
    toast('✅ بەخێربێیت!');
  } catch (e) {
    showAuthError('داخیلبوون بە Google سەرنەکەوت: ' + e.message);
  }
};

// ── LOGOUT ──
window.handleSignOut = async () => {
  const m = document.getElementById('user-menu');
  if (m) m.style.display = 'none';
  stopListening();
  await getAuth().signOut();
  renderList();
  toast('👋 لۆگ ئاوت کرایەوە');
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
    if (t.type === 'debit') bals[t.currency].debit  += Number(t.amount);
    else                    bals[t.currency].credit += Number(t.amount);
  });
  return bals;
}

function renderList() {
  const el = document.getElementById('user-list');
  if (!el) return;
  if (!currentUser) {
    el.innerHTML = `
      <div class="login-prompt" onclick="showLoginModal('login')">
        <div class="lp-icon">🔐</div>
        <div class="lp-title">داخیلبوون پێویستە</div>
        <div class="lp-sub">بۆ بینین و بەڕێوەبردنی ئەکاونتەکانت</div>
        <div class="lp-btns">
          <button class="lp-btn-main" onclick="event.stopPropagation();showLoginModal('login')">چوونەژوورەوە</button>
          <button class="lp-btn-sec"  onclick="event.stopPropagation();showLoginModal('register')">تۆمارکردن</button>
        </div>
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
  if (!currentUser) { pendingAction = () => window.addTrans(id, type); showLoginModal('login'); return; }
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
  if (!currentUser) { showLoginModal('login'); return; }
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
      if (t.type === 'debit') totals[t.currency].debit  += Number(t.amount);
      else                    totals[t.currency].credit += Number(t.amount);
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
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); })
);

// ── TOAST ──
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2300);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});
