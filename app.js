// ==========================================
// 0. INTRO ANIMATION LOGIC
// ==========================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('intro-screen').classList.add('hide');
  }, 2000); // 2 seconds intro
});

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
// 2. DEVICE INFO (Honest APIs & GPU Detection)
// ==========================================
async function loadDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Phone Model (Limited by browser privacy)
  let brand = "Android Device";
  if (/Vivo/i.test(ua)) brand = "Vivo";
  else if (/Samsung/i.test(ua)) brand = "Samsung";
  else if (/Xiaomi|Redmi|POCO/i.test(ua)) brand = "Xiaomi";
  else if (/OPPO/i.test(ua)) brand = "OPPO";
  else if (/Infinix/i.test(ua)) brand = "Infinix";
  else if (/Tecno/i.test(ua)) brand = "Tecno";
  else if (/Realme/i.test(ua)) brand = "Realme";
  document.getElementById('dev-brand').innerText = brand; // Browser won't give exact model like "Y11"

  const androidMatch = ua.match(/Android\s([0-9\.]+)/);
  document.getElementById('dev-os').innerText = androidMatch ? `Android ${androidMatch[1]}` : "Unknown";

  document.getElementById('dev-res').innerText = `${window.screen.width}x${window.screen.height}`;

  const ram = navigator.deviceMemory;
  document.getElementById('dev-ram').innerText = ram ? `≥ ${ram} GB` : "Unsupported";

  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const freeSpaceGB = ((estimate.quota - estimate.usage) / (1024 * 1024 * 1024)).toFixed(1);
    document.getElementById('dev-storage').innerText = `~${freeSpaceGB} GB free`;
  } else {
    document.getElementById('dev-storage').innerText = "Unsupported";
  }

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  document.getElementById('dev-network').innerText = conn ? (conn.effectiveType || "Unknown").toUpperCase() : "Unsupported";
  if (conn) document.getElementById('mon-downlink').innerText = conn.downlink ? `${conn.downlink} Mbps` : "--";

  // GPU / Render API DETECTION
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        document.getElementById('mon-gpu').innerText = renderer; // Lalabas dito ang Adreno, Mali, o PowerVR
      } else {
        document.getElementById('mon-gpu').innerText = "WebGL Supported (Renderer hidden)";
      }
    } else {
      document.getElementById('mon-gpu').innerText = "WebGL Unsupported";
    }
  } catch(e) {
    document.getElementById('mon-gpu').innerText = "Error detecting GPU";
  }

  // Battery
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

document.getElementById('slider-fps').addEventListener('input', (e) => document.getElementById('val-fps').innerText = e.target.value);
document.getElementById('slider-touch').addEventListener('input', (e) => {
  const map = {1: "Low", 2: "Medium", 3: "High"};
  document.getElementById('val-touch').innerText = map[e.target.value];
});

// ==========================================
// 4. GAME LIBRARY WITH LOGOS & INTENT LAUNCH
// ==========================================
// Nilagyan natin ng totoong package names para magamit ang Android Intent (Direct Launch)
const games = [
  { id: 1, title: "Mobile Legends", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Mobile_Legends_Bang_Bang_logo.png/220px-Mobile_Legends_Bang_Bang_logo.png", pkg: "com.mobile.legends", fps: 60, profile: "Balanced", desc: "5v5 classic MOBA." },
  { id: 2, title: "Wild Rift", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/League_of_Legends_Wild_Rift_logo.png/220px-League_of_Legends_Wild_Rift_logo.png", pkg: "com.riotgames.league.wildrift", fps: 60, profile: "High", desc: "League of Legends mobile." },
  { id: 3, title: "Honor of Kings", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Honor_of_Kings_logo.png/220px-Honor_of_Kings_logo.png", pkg: "com.levelinfinite.sgameGlobal", fps: 90, profile: "Ultra", desc: "Popular global MOBA." },
  { id: 4, title: "Arena of Valor", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Arena_of_Valor_logo.png/220px-Arena_of_Valor_logo.png", pkg: "com.tencent.ngame.chty", fps: 60, profile: "High", desc: "Fast-paced mobile MOBA." },
  { id: 5, title: "Pokémon UNITE", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Pok%C3%A9mon_UNITE_logo.png/220px-Pok%C3%A9mon_UNITE_logo.png", pkg: "jp.pokemon.pokemonunite", fps: 60, profile: "Balanced", desc: "Team strategic battle." },
  { id: 6, title: "Onmyoji Arena", icon: "https://play-lh.googleusercontent.com/9L8aV3L9qN2g4Q5X1L9x5X9x5X9x5X9x5X9x5X9x5X9", pkg: "com.netease.g78na.gb", fps: 60, profile: "Balanced", desc: "Anime style MOBA." },
  { id: 7, title: "Vainglory", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1a/Vainglory_logo.png/220px-Vainglory_logo.png", pkg: "com.superevilmegacorp.game", fps: 60, profile: "High", desc: "Precision touch controls." },
  { id: 8, title: "Heroes Evolved", icon: "https://play-lh.googleusercontent.com/1L8aV3L9qN2g4Q5X1L9x5X9x5X9x5X9x5X9x5X9x5", pkg: "com.r2games.heroes", fps: 60, profile: "Balanced", desc: "Classic 5v5 action." },
  { id: 9, title: "Extraordinary Ones", icon: "https://play-lh.googleusercontent.com/2L8aV3L9qN2g4Q5X1L9x5X9x5X9x5X9x5X9x5X9x5", pkg: "com.netease.eo", fps: 60, profile: "Balanced", desc: "Anime hero academy MOBA." },
  { id: 10, title: "Marvel Super War", icon: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Marvel_Super_War_logo.png/220px-Marvel_Super_War_logo.png", pkg: "com.netease.marvelsuperwar", fps: 60, profile: "High", desc: "Marvel heroes battle." }
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
      <img src="${game.icon}" class="game-icon" alt="${game.title}" onerror="this.src='https://via.placeholder.com/60/111/fff?text=Game'">
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
  
  const ram = navigator.deviceMemory;
  let compat = "⚠️ Cannot read hardware stats. Manually check settings.";
  if (ram) compat = ram >= 4 ? "✅ Device meets recommended specs." : "⚠️ Device may struggle. Use Low settings.";
  document.getElementById('modal-compat').innerText = compat;

  // LAUNCH GAME VIA ANDROID INTENT
  const launchBtn = document.getElementById('btn-launch-game');
  launchBtn.onclick = () => {
    // Intent URI: Sinusubukang buksan ang package. Kung wala, mag-eerror (na siyang detection natin)
    const intentUrl = `intent://launch/#Intent;scheme=package;package=${game.pkg};end`;
    window.location.href = intentUrl;
    
    // Fallback kung hindi umubra ang intent
    setTimeout(() => {
       alert("Kung hindi nag-open ang game, malamang hindi ito naka-install sa phone mo.");
    }, 1500);
  };

  modal.classList.remove('hidden');
}
document.getElementById('btn-modal-close').addEventListener('click', () => modal.classList.add('hidden'));

// ==========================================
// 5. SETTINGS (Animation Scale & Reset)
// ==========================================
document.getElementById('setting-anim-scale').addEventListener('change', (e) => {
  const scale = e.target.value;
  // Binabago ang CSS variable para mabilis o bumagal ang animation
  document.documentElement.style.setProperty('--anim-speed', `${scale}s`);
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if(confirm("Reset all settings to default?")) {
    document.getElementById('setting-anim-scale').value = "1";
    document.documentElement.style.setProperty('--anim-speed', '0.3s');
    alert("Settings reset.");
  }
});

document.getElementById('btn-quick-opt').addEventListener('click', () => {
  alert("Quick Optimization Checklist:\n1. Close background apps.\n2. Turn off Bluetooth/GPS if not used.\n3. Ensure phone is not overheating.\n4. Enable Game Mode in phone settings.");
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(err => console.log('SW Error', err)));
}
