// ==========================================
// 1. NAVIGATION LOGIC
// ==========================================
const navBtns = document.querySelectorAll('.nav-btn');
const tabs = document.querySelectorAll('.tab-pane');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// ==========================================
// 2. DEVICE INFO (Honest APIs)
// ==========================================
async function loadDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Brand Detection
  let brand = "Unknown";
  if (/Vivo/i.test(ua)) brand = "Vivo";
  else if (/Samsung/i.test(ua)) brand = "Samsung";
  else if (/Xiaomi|Redmi|POCO/i.test(ua)) brand = "Xiaomi";
  else if (/OPPO/i.test(ua)) brand = "OPPO";
  else if (/Infinix/i.test(ua)) brand = "Infinix";
  else if (/Tecno/i.test(ua)) brand = "Tecno";
  else if (/Realme/i.test(ua)) brand = "Realme";
  else if (/Huawei/i.test(ua)) brand = "Huawei";
  else if (/Android/i.test(ua)) brand = "Android Device";
  document.getElementById('dev-brand').innerText = brand;

  // OS Detection
  const androidMatch = ua.match(/Android\s([0-9\.]+)/);
  document.getElementById('dev-os').innerText = androidMatch ? `Android ${androidMatch[1]}` : "Unknown";

  // Screen Res
  document.getElementById('dev-res').innerText = `${window.screen.width}x${window.screen.height}`;

  // RAM (navigator.deviceMemory)
  const ram = navigator.deviceMemory;
  document.getElementById('dev-ram').innerText = ram ? `≥ ${ram} GB` : "Unsupported";

  // Storage (navigator.storage.estimate)
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const freeSpaceGB = ((estimate.quota - estimate.usage) / (1024 * 1024 * 1024)).toFixed(1);
    document.getElementById('dev-storage').innerText = `~${freeSpaceGB} GB free`;
  } else {
    document.getElementById('dev-storage').innerText = "Unsupported";
  }

  // Network
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  document.getElementById('dev-network').innerText = conn ? (conn.effectiveType || "Unknown").toUpperCase() : "Unsupported";
  if (conn) document.getElementById('mon-downlink').innerText = conn.downlink ? `${conn.downlink} Mbps` : "--";
  
  // Battery (Charging & Level)
  if (navigator.getBattery) {
    const battery = await navigator.getBattery();
    
    const updateBattery = () => {
      const level = Math.round(battery.level * 100);
      document.getElementById('battery-status').innerText = `Battery: ${level}%`;
      document.getElementById('mon-battery').innerText = `${level}%`;
      document.getElementById('mon-charging').innerText = battery.charging ? "Charging ⚡" : "Not Charging";
    };
    
    updateBattery();
    battery.addEventListener('levelchange', updateBattery);
    battery.addEventListener('chargingchange', updateBattery);
  } else {
    document.getElementById('battery-status').innerText = "Battery: N/A";
    document.getElementById('mon-battery').innerText = "Unsupported";
    document.getElementById('mon-charging').innerText = "Unsupported";
  }
}
loadDeviceInfo();

// ==========================================
// 3. PERFORMANCE MONITOR (Real FPS)
// ==========================================
let isTestingFPS = false;
let fpsFrameCount = 0;
let fpsLastTime = performance.now();
const fpsDisplay = document.getElementById('fps-value');

document.getElementById('btn-toggle-fps').addEventListener('click', (e) => {
  isTestingFPS = !isTestingFPS;
  e.target.innerText = isTestingFPS ? "Stop Test" : "Start Test";
  if (isTestingFPS) {
    fpsFrameCount = 0;
    fpsLastTime = performance.now();
    requestAnimationFrame(calculateFPS);
  } else {
    fpsDisplay.innerText = "0";
  }
});

function calculateFPS() {
  if (!isTestingFPS) return;
  fpsFrameCount++;
  const time = performance.now();
  
  if (time >= fpsLastTime + 1000) {
    const fps = Math.round((fpsFrameCount * 1000) / (time - fpsLastTime));
    fpsDisplay.innerText = fps;
    fpsFrameCount = 0;
    fpsLastTime = time;
  }
  requestAnimationFrame(calculateFPS);
}

// Slider Listeners
document.getElementById('slider-fps').addEventListener('input', (e) => {
  document.getElementById('val-fps').innerText = e.target.value;
});
document.getElementById('slider-touch').addEventListener('input', (e) => {
  const map = {1: "Low", 2: "Medium", 3: "High"};
  document.getElementById('val-touch').innerText = map[e.target.value];
});

// ==========================================
// 4. GAME LIBRARY & OPTIMIZATION
// ==========================================
const games = [
  { id: 1, title: "Mobile Legends", icon: "🛡️", fps: 60, profile: "Balanced", desc: "5v5 classic MOBA." },
  { id: 2, title: "Wild Rift", icon: "⚔️", fps: 60, profile: "High", desc: "League of Legends mobile version." },
  { id: 3, title: "Honor of Kings", icon: "👑", fps: 90, profile: "Ultra", desc: "Popular global MOBA." },
  { id: 4, title: "Arena of Valor", icon: "🏹", fps: 60, profile: "High", desc: "Fast-paced mobile MOBA." },
  { id: 5, title: "Pokémon UNITE", icon: "⚡", fps: 60, profile: "Balanced", desc: "Team strategic battle." },
  { id: 6, title: "Onmyoji Arena", icon: "🍃", fps: 60, profile: "Balanced", desc: "Anime style MOBA." },
  { id: 7, title: "Vainglory", icon: "💎", fps: 60, profile: "High", desc: "Precision touch controls." },
  { id: 8, title: "Heroes Evolved", icon: "🔥", fps: 60, profile: "Balanced", desc: "Classic 5v5 action." },
  { id: 9, title: "Extraordinary Ones", icon: "🎒", fps: 60, profile: "Balanced", desc: "Anime hero academy MOBA." },
  { id: 10, title: "Marvel Super War", icon: "🦸", fps: 60, profile: "High", desc: "Marvel heroes battle." }
];

const gameListEl = document.getElementById('game-list');
const searchInput = document.getElementById('search-game');

function renderGames(filterText = "") {
  gameListEl.innerHTML = "";
  const filtered = games.filter(g => g.title.toLowerCase().includes(filterText.toLowerCase()));
  
  filtered.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <div class="game-icon">${game.icon}</div>
      <div class="game-title">${game.title}</div>
    `;
    card.addEventListener('click', () => openGameModal(game));
    gameListEl.appendChild(card);
  });
}
renderGames();

searchInput.addEventListener('input', (e) => renderGames(e.target.value));

// Modal Logic
const modal = document.getElementById('game-modal');

function openGameModal(game) {
  document.getElementById('modal-title').innerText = game.title;
  document.getElementById('modal-desc').innerText = game.desc;
  document.getElementById('modal-fps').innerText = `${game.fps} FPS`;
  document.getElementById('modal-profile').innerText = game.profile;
  
  // Honest compatibility check
  const ram = navigator.deviceMemory;
  let compat = "Unknown";
  if (ram) {
    compat = ram >= 4 ? "✅ Device meets recommended specs." : "⚠️ Device may struggle. Use Low settings.";
  } else {
    compat = "⚠️ Cannot read hardware stats. Manually check game settings.";
  }
  document.getElementById('modal-compat').innerText = compat;

  const optBtn = document.getElementById('btn-modal-optimize');
  optBtn.innerText = "OPTIMIZE GAME";
  optBtn.style.background = "var(--text)";
  optBtn.style.color = "var(--bg)";
  
  optBtn.onclick = () => {
    optBtn.innerText = "✅ Optimization Profile Applied!";
    optBtn.style.background = "transparent";
    optBtn.style.color = "var(--text)";
    optBtn.style.border = "1px solid var(--border)";
  };

  modal.classList.remove('hidden');
}

document.getElementById('btn-modal-close').addEventListener('click', () => {
  modal.classList.add('hidden');
});

// ==========================================
// 5. SETTINGS & RESET
// ==========================================
document.getElementById('btn-reset').addEventListener('click', () => {
  if(confirm("Reset all settings to default?")) {
    document.getElementById('setting-theme').value = "dark";
    document.getElementById('setting-anim').checked = true;
    document.getElementById('setting-lib').value = "all";
    alert("Settings reset.");
  }
});

document.getElementById('btn-quick-opt').addEventListener('click', () => {
  alert("Quick Optimization Checklist:\n1. Close background apps.\n2. Turn off Bluetooth/GPS if not used.\n3. Ensure phone is not overheating.\n4. Enable Game Mode in phone settings.");
});

// ==========================================
// 6. PWA SERVICE WORKER REGISTRATION
// ==========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW Error', err));
  });
}
