// ── SANARIA — script.js ──

var _accounts  = [];
var _activeTab = 'all';
var _user      = null;
var _unsub     = null;
var _pendingFn = null;

var CURRENCIES = [
  {val:'IQD',label:'دینار عێراقی'},
  {val:'USD',label:'دۆلاری ئەمریکی'},
  {val:'SAR',label:'ریال سعودی'},
  {val:'BHD',label:'دینار بەحرەینی'},
  {val:'YER',label:'ریال یەمەنی'},
  {val:'EUR',label:'یۆرۆ'},
];
var CUR_OPTS = CURRENCIES.map(function(c){
  return '<option value="'+c.val+'">'+c.label+'</option>';
}).join('');
function curLabel(v){
  return (CURRENCIES.find(function(c){return c.val===v;})||{label:v}).label;
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
function today(){return new Date().toISOString().split('T')[0];}

// ── LOADING SCREEN ──
(function runLoader(){
  var pct = 0;
  var pctEl = document.getElementById('loader-pct');
  var nums = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  function toArabic(n){
    return String(n).split('').map(function(d){ return nums[+d]||d; }).join('');
  }
  // Generate particles
  var pc = document.getElementById('loader-particles');
  if (pc) for(var i=0;i<20;i++){
    var p=document.createElement('div'); p.className='loader-particle';
    var s=3+Math.random()*10;
    p.style.cssText='width:'+s+'px;height:'+s+'px;left:'+Math.random()*100+'%;animation-duration:'+(6+Math.random()*10)+'s;animation-delay:'+(Math.random()*6)+'s;';
    pc.appendChild(p);
  }
  var iv = setInterval(function(){
    pct = Math.min(pct + Math.random()*18, 100);
    if (pctEl) pctEl.textContent = toArabic(Math.round(pct)) + '٪';
    if (pct >= 100){
      clearInterval(iv);
      setTimeout(hideLoader, 300);
    }
  }, 120);
})();

function hideLoader(){
  var loader = document.getElementById('loader');
  var app    = document.getElementById('app');
  if (!loader || !app) return;
  loader.classList.add('loader-hide');
  setTimeout(function(){
    loader.style.display = 'none';
    app.style.display    = 'block';
  }, 500);
}

// ── MAINTENANCE CHECK ──
window.addEventListener('load', function(){
  if (typeof SANARIA_CONFIG !== 'undefined' && SANARIA_CONFIG.maintenance){
    window.location.href = 'maintenance.html';
    return;
  }
  initAuth();
  setTimeout(checkUpdate, 2000);
});

// ── UPDATE DIALOG ──
function checkUpdate(){
  if (typeof SANARIA_CONFIG === 'undefined') return;
  var ver  = SANARIA_CONFIG.version;
  var seen = localStorage.getItem('seen_version');
  if (seen === ver) return;
  var el   = document.getElementById('modal-update');
  var verEl = document.getElementById('update-ver');
  var notesEl = document.getElementById('update-notes');
  if (!el) return;
  if (verEl) verEl.textContent = 'وەرژن ' + ver;
  if (notesEl && SANARIA_CONFIG.updateNotes){
    notesEl.innerHTML = SANARIA_CONFIG.updateNotes.map(function(n){
      return '<div class="update-note">✦ '+n+'</div>';
    }).join('');
  }
  el.style.display = 'flex';
}
window.closeUpdate = function(){
  if (typeof SANARIA_CONFIG !== 'undefined')
    localStorage.setItem('seen_version', SANARIA_CONFIG.version);
  var el = document.getElementById('modal-update');
  if (el) el.style.display = 'none';
};

// ── FIREBASE HELPERS ──
function initAuth(){
  window._auth.onAuthStateChanged(function(user){
    _user = user;
    updateTopbarUI(user);
    if (user){
      closeModal('modal-login');
      startListening(user.uid);
      if (_pendingFn){ var fn=_pendingFn; _pendingFn=null; fn(); }
    } else {
      stopListening();
      renderList();
    }
  });
}

// ── CLOUD SAVE ──
function saveToCloud(){
  if (!_user) return;
  window._db.collection('users').doc(_user.uid).set({accounts:_accounts})
    .catch(function(e){ console.error('Save error',e); });
}

// ── REALTIME LISTENER ──
function startListening(uid){
  if (_unsub) _unsub();
  _unsub = window._db.collection('users').doc(uid).onSnapshot(function(snap){
    _accounts = snap.exists ? (snap.data().accounts||[]) : [];
    if (!snap.exists) seedDemo();
    renderList();
  });
}
function stopListening(){
  if (_unsub){_unsub();_unsub=null;}
  _accounts=[];
}
function seedDemo(){
  _accounts=[{
    id:'demo1',name:'ئەڤریم',phone:'0770000000',email:'',type:'customer',
    transactions:[
      {id:'t1',type:'debit', amount:50, currency:'BHD',date:'2026-03-06',desc:''},
      {id:'t2',type:'debit', amount:100,currency:'USD',date:'2026-03-06',desc:''},
      {id:'t3',type:'credit',amount:50, currency:'USD',date:'2026-03-06',desc:''},
    ]
  }];
  saveToCloud();
}

// ── AUTH GUARD ──
window.requireAuth = function(fn){
  if (_user) fn();
  else {_pendingFn=fn; showLoginModal('login');}
};

// ── TOPBAR UI ──
function updateTopbarUI(user){
  var lb=document.getElementById('topbar-login-btn');
  var ub=document.getElementById('topbar-user-btn');
  var av=document.getElementById('topbar-avatar');
  var ma=document.getElementById('menu-avatar');
  var mn=document.getElementById('menu-name');
  var me=document.getElementById('menu-email');
  if (!lb) return;
  if (user){
    lb.style.display='none'; ub.style.display='flex';
    var photo=user.photoURL||'https://ui-avatars.com/api/?name='+encodeURIComponent(user.displayName||user.email)+'&background=00a8b5&color=fff&size=64';
    if(av) av.src=photo; if(ma) ma.src=photo;
    if(mn) mn.textContent=user.displayName||user.email.split('@')[0];
    if(me) me.textContent=user.email;
  } else {
    lb.style.display='flex'; ub.style.display='none';
  }
}

window.toggleUserMenu=function(){
  var m=document.getElementById('user-menu');
  if(m) m.style.display=m.style.display==='none'?'block':'none';
};
document.addEventListener('click',function(e){
  var m=document.getElementById('user-menu');
  var ub=document.getElementById('topbar-user-btn');
  if(m&&ub&&!m.contains(e.target)&&!ub.contains(e.target)) m.style.display='none';
});

// ── AUTH MODAL ──
window.showLoginModal=function(tab){
  clearAuthError();
  document.getElementById('modal-login').classList.add('show');
  switchTab(tab||'login');
};
window.switchTab=function(tab){
  document.getElementById('form-login').style.display   =tab==='login'   ?'block':'none';
  document.getElementById('form-register').style.display=tab==='register'?'block':'none';
  document.getElementById('tab-login').classList.toggle('active',   tab==='login');
  document.getElementById('tab-register').classList.toggle('active',tab==='register');
  clearAuthError();
};
function showAuthError(msg){var el=document.getElementById('auth-error');if(el){el.textContent=msg;el.style.display='block';}}
function clearAuthError(){var el=document.getElementById('auth-error');if(el){el.textContent='';el.style.display='none';}}

// ── EMAIL LOGIN ──
window.doEmailLogin=function(){
  clearAuthError();
  var email=(document.getElementById('li-email').value||'').trim();
  var pass=document.getElementById('li-pass').value||'';
  if(!email||!pass){showAuthError('تکایە هەموو خانەکان پڕ بکەرەوە');return;}
  window._auth.signInWithEmailAndPassword(email,pass)
    .then(function(){toast('✅ بەخێربێیت!');})
    .catch(function(e){
      var msgs={'auth/user-not-found':'ئەم ئیمەیڵە تۆمار نەکراوە','auth/wrong-password':'پاسووەردەکە هەڵەیە','auth/invalid-email':'ئیمەیڵەکە هەڵەیە','auth/invalid-credential':'ئیمەیڵ یان پاسووەرد هەڵەیە','auth/too-many-requests':'زۆر هەوڵت دا، کەمێ چاوەڕوانبە'};
      showAuthError(msgs[e.code]||'هەڵە: '+e.message);
    });
};

// ── REGISTER ──
window.doRegister=function(){
  clearAuthError();
  var name=(document.getElementById('reg-name').value||'').trim();
  var email=(document.getElementById('reg-email').value||'').trim();
  var pass=document.getElementById('reg-pass').value||'';
  if(!name||!email||!pass){showAuthError('تکایە هەموو خانەکان پڕ بکەرەوە');return;}
  if(pass.length<6){showAuthError('پاسووەرد دەبێت ٦ پیت زیاتر بێت');return;}
  window._auth.createUserWithEmailAndPassword(email,pass)
    .then(function(c){
      return c.user.updateProfile({displayName:name}).then(function(){
        sendRegToSheets(email,name);
        toast('✅ تۆمارکردن سەرکەوت!');
      });
    })
    .catch(function(e){
      var msgs={'auth/email-already-in-use':'ئەم ئیمەیڵە پێشتر تۆمارکراوە','auth/invalid-email':'ئیمەیڵەکە هەڵەیە','auth/weak-password':'پاسووەرد زۆر سووک'};
      showAuthError(msgs[e.code]||'هەڵە: '+e.message);
    });
};

// ── OTP → GOOGLE SHEETS ──
function sendRegToSheets(email, name){
  if (typeof SANARIA_CONFIG==='undefined'||!SANARIA_CONFIG.sheetsURL||SANARIA_CONFIG.sheetsURL.indexOf('YOUR_SCRIPT')>-1) return;
  var otp=Math.floor(100000+Math.random()*900000).toString();
  var data=new URLSearchParams({action:'register',email:email,name:name,otp:otp,time:new Date().toLocaleString()});
  fetch(SANARIA_CONFIG.sheetsURL,{method:'POST',body:data}).catch(function(){});
}

// ── GOOGLE LOGIN ──
window.handleSignIn=function(){
  clearAuthError();
  window._auth.signInWithPopup(window._provider)
    .then(function(){toast('✅ بەخێربێیت!');})
    .catch(function(e){showAuthError('Google: '+e.message);});
};

// ── LOGOUT ──
window.handleSignOut=function(){
  var m=document.getElementById('user-menu');
  if(m) m.style.display='none';
  stopListening();
  window._auth.signOut().then(function(){renderList();toast('👋 لۆگ ئاوت کرایەوە');});
};

// ── PAGES ──
window.gotoPage=function(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.getElementById(id).classList.add('active');
  if(id==='page-main') renderList();
};
window.filterTab=function(type,el){
  _activeTab=type;
  document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
  el.classList.add('active');
  renderList();
};

// ── RENDER ──
function typeLabel(t){return t==='customer'?'کڕیار':t==='supplier'?'دابینکەر':'گشتی';}
function getBals(a){
  var b={};
  (a.transactions||[]).forEach(function(t){
    if(!b[t.currency]) b[t.currency]={debit:0,credit:0};
    if(t.type==='debit') b[t.currency].debit+=Number(t.amount);
    else b[t.currency].credit+=Number(t.amount);
  });
  return b;
}

function renderList(){
  var el=document.getElementById('user-list');
  if(!el) return;
  if(!_user){
    el.innerHTML='<div class="login-prompt" onclick="showLoginModal(\'login\')">'
      +'<div class="lp-icon">🔐</div>'
      +'<div class="lp-title">داخیلبوون پێویستە</div>'
      +'<div class="lp-sub">بۆ بینین و بەڕێوەبردنی ئەکاونتەکانت</div>'
      +'<div class="lp-btns">'
      +'<button class="lp-btn-main" onclick="event.stopPropagation();showLoginModal(\'login\')">چوونەژوورەوە</button>'
      +'<button class="lp-btn-sec"  onclick="event.stopPropagation();showLoginModal(\'register\')">تۆمارکردن</button>'
      +'</div></div>';
    return;
  }
  var list=_activeTab==='all'?_accounts:_accounts.filter(function(a){return a.type===_activeTab;});
  if(!list.length){el.innerHTML='<div class="empty-msg" style="padding:28px 0">هیچ ئەکاونتێک نییە.<br>دووگمەی + بکەرەوە.</div>';return;}
  el.innerHTML=list.map(buildCard).join('');
}

function buildCard(a){
  var bals=getBals(a), hasT=(a.transactions||[]).length>0;
  var chips=Object.entries(bals).map(function(e){
    var cur=e[0],b=e[1],rem=b.debit-b.credit;
    return '<span class="bal-chip bc-d">▲ '+b.debit+' <small>'+curLabel(cur)+'</small></span>'
      +'<span class="bal-chip bc-c">▼ '+b.credit+' <small>'+curLabel(cur)+'</small></span>'
      +'<span class="bal-chip bc-r '+(rem>=0?'neg':'pos')+'">⚖ '+Math.abs(rem)+' <small>'+curLabel(cur)+'</small></span>';
  }).join('');
  var rows=(a.transactions||[]).map(function(t,i){
    return '<tr>'
      +'<td style="font-size:.72rem;color:var(--text-light)">'+t.date+'</td>'
      +'<td style="max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(t.desc||'—')+'</td>'
      +'<td>'+(t.type==='debit'?'<span class="amt-o">'+t.amount+'</span>':'—')+'</td>'
      +'<td>'+(t.type==='credit'?'<span class="amt-g">'+t.amount+'</span>':'—')+'</td>'
      +'<td><span class="cur-tag ct-'+t.currency+'">'+curLabel(t.currency)+'</span></td>'
      +'<td><button class="btn-del-row" onclick="delTrans(\''+a.id+'\','+i+')">🗑</button></td>'
      +'</tr>';
  }).join('');
  var sumC=Object.entries(bals).map(function(e){
    var cur=e[0],b=e[1],rem=b.debit-b.credit;
    return '<div class="sum-chip"><div class="sl">'+curLabel(cur)+'</div>'
      +'<div class="sv" style="color:'+(rem>0?'var(--orange)':rem<0?'var(--green)':'var(--text-light)')+'">'+Math.abs(rem)+' '+(rem>0?'مەدین':rem<0?'دائن':'سفر')+'</div></div>';
  }).join('');
  return '<div class="user-card" id="card-'+a.id+'">'
    +'<div class="user-card-header" onclick="togglePanel(\''+a.id+'\')">'
    +'<div class="user-hdr-left">'
    +'<span class="link-detail" onclick="event.stopPropagation();showDetail(\''+a.id+'\')">وردەکاری</span>'
    +'<button class="btn-del-user" onclick="event.stopPropagation();askDeleteUser(\''+a.id+'\',\''+a.name+'\')">🗑</button>'
    +'<button class="btn-add-trans" onclick="event.stopPropagation();openForm(\''+a.id+'\')">+</button>'
    +'</div>'
    +'<div class="user-info"><div><div class="user-name">'+a.name+'</div>'
    +'<span class="user-type-tag">'+typeLabel(a.type)+'</span></div>'
    +'<div class="user-avatar">👤</div></div></div>'
    +(Object.keys(bals).length?'<div class="user-balance-row">'+chips+'</div>':'')
    +'<div class="trans-panel" id="panel-'+a.id+'">'
    +'<div class="add-form">'
    +'<div class="frow"><div class="field"><label>بڕی پارە</label><input type="number" id="amt-'+a.id+'" placeholder="٠" min="0" step="any"></div>'
    +'<div class="field"><label>دراو</label><select id="cur-'+a.id+'">'+CUR_OPTS+'</select></div></div>'
    +'<div class="frow"><div class="field"><label>بەروار</label><input type="date" id="date-'+a.id+'" value="'+today()+'"></div>'
    +'<div class="field span2" style="grid-column:2/3"><label>بیان</label><input type="text" id="desc-'+a.id+'" placeholder="بیان..."></div></div>'
    +'<div class="form-btns">'
    +'<button class="btn-down" onclick="addTrans(\''+a.id+'\',\'debit\')">▼ مەدین</button>'
    +'<button class="btn-up"   onclick="addTrans(\''+a.id+'\',\'credit\')">▲ دائن</button>'
    +'</div></div>'
    +(hasT?'<table class="trans-table"><thead><tr><th>بەروار</th><th>بیان</th><th>مەدین▼</th><th>دائن▲</th><th>دراو</th><th></th></tr></thead><tbody>'+rows+'</tbody></table>'+(Object.keys(bals).length?'<div class="sum-row">'+sumC+'</div>':''):'<div class="empty-msg">هیچ مامەڵەیەک نییە</div>')
    +'</div></div>';
}

window.togglePanel=function(id){document.getElementById('panel-'+id).classList.toggle('open');};
window.openForm=function(id){document.getElementById('panel-'+id).classList.add('open');setTimeout(function(){var i=document.getElementById('amt-'+id);if(i)i.focus();},80);};

window.addTrans=function(id,type){
  if(!_user){_pendingFn=function(){window.addTrans(id,type);};showLoginModal('login');return;}
  var a=_accounts.find(function(a){return a.id===id;});if(!a)return;
  var amt=parseFloat(document.getElementById('amt-'+id).value);
  if(!amt||amt<=0){toast('تکایە بڕی پارەکە بنووسە');return;}
  var cur=document.getElementById('cur-'+id).value;
  var date=document.getElementById('date-'+id).value||today();
  var desc=(document.getElementById('desc-'+id).value||'').trim();
  if(!a.transactions) a.transactions=[];
  a.transactions.push({id:uid(),type:type,amount:amt,currency:cur,date:date,desc:desc});
  saveToCloud();
  toast(type==='credit'?'✅ دائن زیاد کرا':'✅ مەدین زیاد کرا');
};

window.delTrans=function(aid,idx){
  var a=_accounts.find(function(a){return a.id===aid;});if(!a)return;
  a.transactions.splice(idx,1);saveToCloud();toast('🗑 مامەڵەکە سڕایەوە');
};

window.askDeleteUser=function(id,name){
  document.getElementById('confirm-msg').textContent='دەتەوێت ئەکاونتی "'+name+'" بسڕیتەوە؟';
  document.getElementById('cf-yes').onclick=function(){_accounts=_accounts.filter(function(a){return a.id!==id;});saveToCloud();closeModal('modal-confirm');toast('🗑 ئەکاونت سڕایەوە');};
  document.getElementById('modal-confirm').classList.add('show');
};

window.saveAccount=function(){
  if(!_user){showLoginModal('login');return;}
  var name=(document.getElementById('nf-name').value||'').trim();
  if(!name){toast('تکایە ناوەکەت بنووسە');return;}
  _accounts.push({id:uid(),name:name,phone:(document.getElementById('nf-phone').value||'').trim(),email:(document.getElementById('nf-email').value||'').trim(),type:document.getElementById('nf-type').value,transactions:[]});
  saveToCloud();
  ['nf-name','nf-phone','nf-email'].forEach(function(i){document.getElementById(i).value='';});
  toast('✅ ئەکاونت پاشەکەوت کرا');
  window.gotoPage('page-main');
};

window.showSummaryModal=function(){
  var totals={};
  _accounts.forEach(function(a){(a.transactions||[]).forEach(function(t){if(!totals[t.currency])totals[t.currency]={debit:0,credit:0};if(t.type==='debit')totals[t.currency].debit+=Number(t.amount);else totals[t.currency].credit+=Number(t.amount);});});
  var rows=Object.entries(totals).map(function(e){var cur=e[0],b=e[1],rem=b.debit-b.credit;return '<tr><td>'+curLabel(cur)+'</td><td class="cr">'+b.credit+'</td><td class="dr">'+b.debit+'</td><td class="bl '+(rem>=0?'neg':'pos')+'">'+Math.abs(rem)+'</td></tr>';}).join('');
  document.getElementById('summary-title').textContent='📊 کۆی بڕەکان';
  document.getElementById('summary-tbody').innerHTML=rows||'<tr><td colspan="4" style="text-align:center;color:#999;padding:14px">هیچ داتایەک نییە</td></tr>';
  document.getElementById('modal-summary').classList.add('show');
};

window.showDetail=function(aid){
  var a=_accounts.find(function(a){return a.id===aid;});if(!a)return;
  var bals=getBals(a);
  var rows=Object.entries(bals).map(function(e){var cur=e[0],b=e[1],rem=b.debit-b.credit;return '<tr><td>'+curLabel(cur)+'</td><td class="cr">'+b.credit+'</td><td class="dr">'+b.debit+'</td><td class="bl '+(rem>=0?'neg':'pos')+'">'+Math.abs(rem)+'</td></tr>';}).join('');
  document.getElementById('summary-title').textContent='📋 '+a.name;
  document.getElementById('summary-tbody').innerHTML=rows||'<tr><td colspan="4" style="text-align:center;color:#999;padding:14px">هیچ مامەڵەیەک نییە</td></tr>';
  document.getElementById('modal-summary').classList.add('show');
};

window.closeModal=function(id){document.getElementById(id).classList.remove('show');};
document.querySelectorAll('.modal-bg').forEach(function(el){el.addEventListener('click',function(e){if(e.target===el)el.classList.remove('show');});});

function toast(msg){var t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2300);}

// ── SEARCH ──
var _searchActive = false;
var _searchQuery  = '';

window.toggleSearch = function () {
  _searchActive = !_searchActive;
  var bar   = document.getElementById('search-bar');
  var input = document.getElementById('search-input');
  var btn   = document.getElementById('search-toggle-btn');
  if (_searchActive) {
    bar.style.display = 'block';
    btn.style.background = 'rgba(255,255,255,.22)';
    setTimeout(function () { if (input) input.focus(); }, 80);
  } else {
    bar.style.display = 'none';
    btn.style.background = '';
    clearSearch();
  }
};

window.clearSearch = function () {
  _searchQuery = '';
  var input = document.getElementById('search-input');
  var clear = document.getElementById('search-clear');
  var count = document.getElementById('search-results-count');
  if (input) input.value = '';
  if (clear) clear.style.display = 'none';
  if (count) count.style.display = 'none';
  renderList();
};

// ── نۆرمالایزکردن: هەر نوسینێک (کوردی، عەرەبی، لاتینی) ──
// ── TRANSLITERATION MAP — کوردی/عەرەبی → لاتینی ──
// بەمە دەتوانیت "zhiwar" بنوسی و "ژیوار" بیهێنیت
var KURD_TO_LATIN = [
  // تیپە تایبەتەکانی کوردی
  ['ژ', 'zh'], ['چ', 'ch'], ['ش', 'sh'], ['خ', 'kh'],
  ['غ', 'gh'], ['ڵ', 'll'], ['ڕ', 'rr'], ['ۆ', 'o'],
  ['ێ', 'e'],  ['ی', 'y'],  ['و', 'w'],  ['ە', 'a'],
  ['ا', 'a'],  ['ب', 'b'],  ['پ', 'p'],  ['ت', 't'],
  ['ج', 'j'],  ['د', 'd'],  ['ر', 'r'],  ['ز', 'z'],
  ['س', 's'],  ['ع', 'a'],  ['ف', 'f'],  ['ڤ', 'v'],
  ['ق', 'q'],  ['ک', 'k'],  ['گ', 'g'],  ['ل', 'l'],
  ['م', 'm'],  ['ن', 'n'],  ['ه', 'h'],  ['ح', 'h'],
  ['ط', 't'],  ['ص', 's'],  ['ض', 'd'],  ['ظ', 'z'],
  ['ذ', 'z'],  ['ث', 's'],  ['ئ', ''],   ['ء', ''],
  ['إ', 'a'],  ['أ', 'a'],  ['آ', 'a'],  ['ة', 'h'],
  ['ى', 'y'],  ['ۋ', 'w'],  ['ڎ', 'd'],
];

function toLatinKey(str) {
  if (!str) return '';
  var s = str.toLowerCase().trim();
  // لابردنی tashkeel
  s = s.replace(/[\u064B-\u065F\u0670]/g, '');
  // گۆڕینی هەر تیپێک
  for (var i = 0; i < KURD_TO_LATIN.length; i++) {
    var from = KURD_TO_LATIN[i][0];
    var to   = KURD_TO_LATIN[i][1];
    s = s.split(from).join(to);
  }
  // لابردنی شتە ناناسراوەکان
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function normalize(str) {
  if (!str) return '';
  var s = str.toLowerCase().trim();
  // لابردنی tashkeel
  s = s.replace(/[\u064B-\u065F\u0670]/g, '');
  // یەکسانکردنی ئەلفەکان
  s = s.replace(/[أإآ]/g, 'ا')
       .replace(/[ة]/g,   'ه')
       .replace(/[ى]/g,   'ي')
       .replace(/\s+/g,   ' ');
  return s;
}

// گەڕانەوەی هەردوو نموونە: ئەرەبی و لاتینی
function matchSearch(name, query) {
  if (!name || !query) return false;
  var q = query.toLowerCase().trim();
  if (!q) return true;

  // ١. گەڕان بە کوردی/عەرەبی ڕاستەوخۆ
  if (normalize(name).indexOf(normalize(q)) > -1) return true;

  // ٢. گەڕان بە لاتینی — نموونە: "zh" بدۆزێتەوە "ژ"
  var nameLatin  = toLatinKey(name);
  var queryLatin = toLatinKey(q);   // ئەگەر خۆی کوردی نووسی
  if (nameLatin.indexOf(q) > -1)         return true; // "zhiwar" → "ژیوار"
  if (nameLatin.indexOf(queryLatin) > -1) return true;

  // ٣. گەڕان تیپ بە تیپ — هەر تیپێک لە query لە name بدۆزێتەوە
  // نموونە: "z" → ژ،ز،ذ،ظ هەموویان
  var qChars = q.split('');
  var nLatin = toLatinKey(name);
  // ئەگەر تەواوی query لە لاتینی ناو دەبینرێت
  if (nLatin.indexOf(q) > -1) return true;

  return false;
}

window.doSearch = function (val) {
  _searchQuery = val || '';
  var clear = document.getElementById('search-clear');
  if (clear) clear.style.display = _searchQuery ? 'flex' : 'none';
  renderList();
};

// ── renderList نوێکراوە بە فیلتەری سێرچ ──
// پێشتر renderList هەبوو — ئێستا بە وردی دەیگۆڕین
var _origRenderList = renderList;

renderList = function () {
  var el = document.getElementById('user-list');
  if (!el) return;

  if (!_user) {
    el.innerHTML = '<div class="login-prompt" onclick="showLoginModal(\'login\')">'
      + '<div class="lp-icon">🔐</div>'
      + '<div class="lp-title">داخیلبوون پێویستە</div>'
      + '<div class="lp-sub">بۆ بینین و بەڕێوەبردنی ئەکاونتەکانت</div>'
      + '<div class="lp-btns">'
      + '<button class="lp-btn-main" onclick="event.stopPropagation();showLoginModal(\'login\')">چوونەژوورەوە</button>'
      + '<button class="lp-btn-sec"  onclick="event.stopPropagation();showLoginModal(\'register\')">تۆمارکردن</button>'
      + '</div></div>';
    return;
  }

  // فیلتەری tab
  var list = _activeTab === 'all'
    ? _accounts
    : _accounts.filter(function (a) { return a.type === _activeTab; });

  // فیلتەری سێرچ
  if (_searchQuery && _searchQuery.trim()) {
    list = list.filter(function (a) {
      return matchSearch(a.name  || '', _searchQuery)
          || matchSearch(a.phone || '', _searchQuery)
          || matchSearch(a.email || '', _searchQuery);
    });
  }

  // ژمارەی ئەنجامەکان
  var count = document.getElementById('search-results-count');
  if (_searchQuery && _searchQuery.trim()) {
    if (count) {
      count.style.display = 'block';
      count.textContent = list.length + ' ئەنجام دۆزرایەوە';
    }
  } else {
    if (count) count.style.display = 'none';
  }

  if (!list.length) {
    el.innerHTML = _searchQuery
      ? '<div class="search-empty"><div class="se-icon">🔍</div><div class="se-title">هیچ ئەنجامێک نەدۆزرایەوە</div><div class="se-sub">«' + _searchQuery + '» بۆ ناوێکی تر تاقی بکەرەوە</div></div>'
      : '<div class="empty-msg" style="padding:28px 0">هیچ ئەکاونتێک نییە.<br>دووگمەی + بکەرەوە.</div>';
    return;
  }

  // هایلایت کردنی تێکست
  el.innerHTML = list.map(function (a) {
    return buildCard(a, _searchQuery);
  }).join('');
};

// ── buildCard نوێکراوە بە هایلایت ──
var _origBuildCard = buildCard;

buildCard = function (a, searchQ) {
  var card = _origBuildCard(a);
  if (!searchQ || !searchQ.trim()) return card;

  var name     = a.name || '';
  var normName = normalize(name);
  var normQ    = normalize(searchQ);

  // هایلایت ئەگەر کوردی/عەرەبی نووسرا
  var idx = normName.indexOf(normQ);
  if (idx > -1 && normQ.length > 0) {
    // دۆزینەوەی شوێنی ڕاستەکەی لە ناوی ئەصلیدا
    var highlighted = name.slice(0, idx)
      + '<mark class="search-hl">' + name.slice(idx, idx + normQ.length) + '</mark>'
      + name.slice(idx + normQ.length);
    card = card.replace(
      '<div class="user-name">' + name + '</div>',
      '<div class="user-name">' + highlighted + '</div>'
    );
  } else {
    // ئەگەر لاتینی نووسرا، تەواوی ناوەکە هایلایت بکە
    var latinName = toLatinKey(name);
    var latinQ    = searchQ.toLowerCase().trim();
    if (latinName.indexOf(latinQ) > -1) {
      card = card.replace(
        '<div class="user-name">' + name + '</div>',
        '<div class="user-name"><mark class="search-hl">' + name + '</mark></div>'
      );
    }
  }
  return card;
};
