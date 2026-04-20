// ============================================================
//  SORASEND — 先に夜になったから、お父さんの分まで見ておいた
// ============================================================

const LOCATIONS = [
  { id: 'vn',   name: 'ベトナム',      flag: '🇻🇳', city: 'ホーチミン',      offset: 7  },
  { id: 'th',   name: 'タイ',          flag: '🇹🇭', city: 'バンコク',        offset: 7  },
  { id: 'sg',   name: 'シンガポール',  flag: '🇸🇬', city: 'シンガポール',    offset: 8  },
  { id: 'cn',   name: '中国',          flag: '🇨🇳', city: '上海',            offset: 8  },
  { id: 'us-e', name: 'アメリカ東部',  flag: '🇺🇸', city: 'ニューヨーク',    offset: -5 },
  { id: 'us-w', name: 'アメリカ西部',  flag: '🇺🇸', city: 'ロサンゼルス',    offset: -8 },
  { id: 'uk',   name: 'イギリス',      flag: '🇬🇧', city: 'ロンドン',        offset: 1  },
  { id: 'de',   name: 'ドイツ',        flag: '🇩🇪', city: 'フランクフルト',  offset: 1  },
];

const JAPAN_OFFSET = 9;

let selectedLoc  = null;
let skyDataUrl   = null;
let cdInterval   = null;
let cdRemaining  = 0;
let captureTime  = '';
let animId       = null;
let userMessage  = '';

// --- Screens ---
const sConc    = document.getElementById('sConc');
const sSetup   = document.getElementById('sSetup');
const sCapture = document.getElementById('sCapture');
const sSend    = document.getElementById('sSend');
const sDeliv   = document.getElementById('sDeliv');

function showScreen(el) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el.classList.remove('hidden');
}

// ============================================================
//  Starfield
// ============================================================
function initStars() {
  const sf = document.getElementById('starfield');
  for (let i = 0; i < 200; i++) {
    const s    = document.createElement('div');
    s.className = 'star';
    const size = (Math.random() * 1.8 + 0.3).toFixed(1);
    const op   = (Math.random() * 0.7 + 0.2).toFixed(2);
    s.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `left:${(Math.random() * 100).toFixed(2)}%`,
      `top:${(Math.random() * 100).toFixed(2)}%`,
      `--op:${op}`,
      `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
      `--delay:-${(Math.random() * 6).toFixed(1)}s`,
    ].join(';');
    sf.appendChild(s);
  }
}
initStars();

// ============================================================
//  Start
// ============================================================
document.getElementById('btnStart').addEventListener('click', () => showScreen(sSetup));

// ============================================================
//  Location grid
// ============================================================
const locGrid = document.getElementById('locGrid');
LOCATIONS.forEach(loc => {
  const card = document.createElement('div');
  card.className = 'loc-card';
  card.innerHTML = `<div class="loc-flag">${loc.flag}</div><div class="loc-name">${loc.name}</div><div class="loc-city">${loc.city}</div>`;
  card.addEventListener('click', () => {
    document.querySelectorAll('.loc-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedLoc = loc;
    showDiff(loc);
  });
  locGrid.appendChild(card);
});

function showDiff(loc) {
  const diff     = JAPAN_OFFSET - loc.offset;
  const diffBox  = document.getElementById('diffBox');
  const diffMain = document.getElementById('diffMain');
  const diffSub  = document.getElementById('diffSub');
  const btnNext  = document.getElementById('btnNext1');

  diffMain.textContent = `${diff}時間 早く夜が来ます`;
  diffSub.textContent  = `${loc.city}に夜が来るのは日本より${diff}時間後。子どもが送った空が、お父さんのもとに届きます。`;
  diffBox.classList.remove('hidden');
  btnNext.classList.remove('hidden');
}

document.getElementById('btnNext1').addEventListener('click', () => {
  showScreen(sCapture);
  initCanvas();
});

// ============================================================
//  Sky Canvas
// ============================================================
const canvas = document.getElementById('skyCanvas');
const stars  = [];

function initCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  stars.length  = 0;

  for (let i = 0; i < 260; i++) {
    stars.push({
      x:     Math.random(),
      y:     Math.random() * 0.9,
      r:     Math.random() * 1.3 + 0.2,
      base:  Math.random() * 0.65 + 0.3,
      phase: Math.random() * Math.PI * 2,
      spd:   Math.random() * 0.5 + 0.2,
    });
  }

  if (animId) cancelAnimationFrame(animId);
  renderSky();
}

function renderSky(t = 0) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const ts = t * 0.001;

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,   '#010408');
  bg.addColorStop(0.6, '#060d1c');
  bg.addColorStop(1,   '#0c1525');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stars
  stars.forEach(s => {
    const op = s.base * (0.5 + 0.5 * Math.sin(ts * s.spd + s.phase));
    ctx.beginPath();
    ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${op.toFixed(2)})`;
    ctx.fill();
  });

  // Moon
  const mx = W * 0.72;
  const my = H * 0.18;
  const mr = Math.min(W, H) * 0.044;

  // glow
  const glow = ctx.createRadialGradient(mx, my, mr * 0.3, mx, my, mr * 3.5);
  glow.addColorStop(0, 'rgba(255,240,200,0.22)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(mx, my, mr * 3.5, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // moon body
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fillStyle = '#f8f0da';
  ctx.fill();

  // crescent cutout
  ctx.beginPath();
  ctx.arc(mx + mr * 0.42, my - mr * 0.08, mr * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = '#040810';
  ctx.fill();

  // Horizon fade
  const hor = ctx.createLinearGradient(0, H * 0.68, 0, H);
  hor.addColorStop(0, 'rgba(0,0,0,0)');
  hor.addColorStop(1, 'rgba(4,10,22,0.75)');
  ctx.fillStyle = hor;
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  animId = requestAnimationFrame(renderSky);
}

// Capture canvas
document.getElementById('btnSendCanvas').addEventListener('click', () => {
  cancelAnimationFrame(animId);
  userMessage = document.getElementById('msgInput').value.trim();
  skyDataUrl  = canvas.toDataURL('image/jpeg', 0.85);
  captureTime = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  goToSend();
});

// Upload photo
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('previewImg').src = ev.target.result;
    skyDataUrl = ev.target.result;
    document.getElementById('captureUi').classList.add('hidden');
    document.getElementById('photoPreview').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

document.getElementById('btnSendPhoto').addEventListener('click', () => {
  userMessage = document.getElementById('msgInputPhoto').value.trim();
  captureTime = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  goToSend();
});

document.getElementById('btnCancelPhoto').addEventListener('click', () => {
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('captureUi').classList.remove('hidden');
  fileInput.value = '';
  skyDataUrl = null;
  if (!animId) renderSky();
});

// ============================================================
//  Sending screen
// ============================================================
function goToSend() {
  showScreen(sSend);

  if (skyDataUrl) {
    document.getElementById('sendSky').style.backgroundImage = `url(${skyDataUrl})`;
  }

  const diff    = JAPAN_OFFSET - selectedLoc.offset;
  cdRemaining   = diff * 3600;

  // dad's current local time (UTC)
  const nowUtc  = new Date();
  const dadHour = ((nowUtc.getUTCHours() + selectedLoc.offset) % 24 + 24) % 24;
  const dadMin  = nowUtc.getUTCMinutes().toString().padStart(2, '0');
  document.getElementById('dadTime').textContent =
    `現在の${selectedLoc.city}の時刻：${dadHour.toString().padStart(2, '0')}:${dadMin}`;

  startCountdown();
}

function startCountdown() {
  clearInterval(cdInterval);
  updateCdDisplay(cdRemaining);
  cdInterval = setInterval(() => {
    cdRemaining--;
    if (cdRemaining <= 0) {
      clearInterval(cdInterval);
      deliver();
      return;
    }
    updateCdDisplay(cdRemaining);
  }, 1000);
}

function updateCdDisplay(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  document.getElementById('cdH').textContent = h.toString().padStart(2, '0');
  document.getElementById('cdM').textContent = m.toString().padStart(2, '0');
  document.getElementById('cdS').textContent = s.toString().padStart(2, '0');
}

document.getElementById('btnDemo').addEventListener('click', () => {
  clearInterval(cdInterval);
  deliver();
});

// ============================================================
//  Delivered screen
// ============================================================
function deliver() {
  showScreen(sDeliv);
  if (skyDataUrl) {
    document.getElementById('delivSky').style.backgroundImage = `url(${skyDataUrl})`;
  }
  document.getElementById('capTime').textContent = captureTime;

  const msgBox  = document.getElementById('delivMsg');
  const msgText = document.getElementById('delivMsgText');
  if (userMessage) {
    msgText.textContent = userMessage;
    msgBox.classList.remove('hidden');
  } else {
    msgBox.classList.add('hidden');
  }
}

// ============================================================
//  夜空フルビュー
// ============================================================
document.getElementById('btnViewSky').addEventListener('click', () => {
  document.getElementById('delivSky').classList.add('fullview');
  document.getElementById('delivUi').classList.add('fade-out');
  document.getElementById('btnCloseSky').classList.remove('hidden');
});
document.getElementById('btnCloseSky').addEventListener('click', () => {
  document.getElementById('delivSky').classList.remove('fullview');
  document.getElementById('delivUi').classList.remove('fade-out');
  document.getElementById('btnCloseSky').classList.add('hidden');
});

// ============================================================
//  Retry
// ============================================================
document.getElementById('btnRetry').addEventListener('click', () => {
  clearInterval(cdInterval);
  cancelAnimationFrame(animId);
  selectedLoc = null;
  skyDataUrl  = null;
  captureTime = '';
  animId      = null;

  document.querySelectorAll('.loc-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('diffBox').classList.add('hidden');
  document.getElementById('btnNext1').classList.add('hidden');
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('captureUi').classList.remove('hidden');
  document.getElementById('msgInput').value = '';
  fileInput.value = '';
  userMessage = '';

  showScreen(sConc);
});
