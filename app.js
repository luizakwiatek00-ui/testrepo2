'use strict';

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_ROLES    = 'meetingCost:roles';
const STORAGE_SETTINGS = 'meetingCost:settings';

const DEFAULT_ROLES = [
  { name: 'Manager', rate: 120, count: 0 },
  { name: 'Senior',  rate: 100, count: 0 },
  { name: 'Mid',     rate: 70,  count: 0 },
  { name: 'Junior',  rate: 50,  count: 0 },
];

const DEFAULT_SETTINGS = { currency: 'PLN' };

const TICK_MS = 300;

// ── State ────────────────────────────────────────────────────────────────────

let roles    = [];
let settings = {};

let timer = {
  startTime:     null,
  pausedAt:      null,
  totalPausedMs: 0,
  isRunning:     false,
};

let tickInterval = null;

// ── Persistence ──────────────────────────────────────────────────────────────

function loadStorage() {
  try {
    const r = localStorage.getItem(STORAGE_ROLES);
    roles = r ? JSON.parse(r) : DEFAULT_ROLES.map(x => ({ ...x }));
  } catch {
    roles = DEFAULT_ROLES.map(x => ({ ...x }));
  }

  try {
    const s = localStorage.getItem(STORAGE_SETTINGS);
    settings = s ? JSON.parse(s) : { ...DEFAULT_SETTINGS };
  } catch {
    settings = { ...DEFAULT_SETTINGS };
  }
}

function saveRoles()    { localStorage.setItem(STORAGE_ROLES,    JSON.stringify(roles)); }
function saveSettings() { localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); }

// ── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(value) {
  const locales = { PLN: 'pl-PL', EUR: 'de-DE', USD: 'en-US' };
  return new Intl.NumberFormat(locales[settings.currency] || 'pl-PL', {
    style:    'currency',
    currency: settings.currency || 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

// ── Derived values ────────────────────────────────────────────────────────────

function getTotalHourlyRate()  { return roles.reduce((s, r) => s + r.rate * r.count, 0); }
function getTotalParticipants(){ return roles.reduce((s, r) => s + r.count, 0); }

function getElapsedMs() {
  if (!timer.startTime) return 0;
  const now     = timer.isRunning ? Date.now() : (timer.pausedAt || Date.now());
  return Math.max(0, now - timer.startTime - timer.totalPausedMs);
}

function getMeetingCost() {
  return getTotalHourlyRate() * (getElapsedMs() / 3_600_000);
}

// ── View routing ──────────────────────────────────────────────────────────────

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Render: Main view ─────────────────────────────────────────────────────────

function renderRolesGrid() {
  const grid = document.getElementById('roles-grid');
  grid.innerHTML = '';

  roles.forEach((role, idx) => {
    const tile = document.createElement('div');
    tile.className = 'role-tile';
    tile.innerHTML = `
      <div class="role-info">
        <div class="role-name">${escHtml(role.name)}</div>
        <div class="role-rate">${formatCurrency(role.rate)}/h</div>
      </div>
      <div class="role-controls">
        <button class="btn-count" data-action="dec" data-idx="${idx}" aria-label="Zmniejsz">−</button>
        <span class="role-count" id="count-${idx}">${role.count}</span>
        <button class="btn-count" data-action="inc" data-idx="${idx}" aria-label="Zwiększ">+</button>
      </div>
    `;
    grid.appendChild(tile);
  });
}

function renderMainFooter() {
  document.getElementById('hourly-preview').textContent   = formatCurrency(getTotalHourlyRate());
  document.getElementById('participants-preview').textContent = getTotalParticipants();
}

function renderMainView() {
  renderRolesGrid();
  renderMainFooter();
}

// ── Render: Active view ───────────────────────────────────────────────────────

function renderActiveView() {
  document.getElementById('active-participants').textContent = getTotalParticipants();
  document.getElementById('active-rate').textContent         = formatCurrency(getTotalHourlyRate());
  tickRender();
}

function tickRender() {
  const elapsed = getElapsedMs();
  document.getElementById('cost-display').textContent = formatCurrency(getMeetingCost());
  document.getElementById('time-display').textContent = formatTime(elapsed);
}

// ── Render: Settings view ─────────────────────────────────────────────────────

function renderSettingsView() {
  document.querySelectorAll('input[name="currency"]').forEach(radio => {
    radio.checked = radio.value === settings.currency;
  });

  const container = document.getElementById('roles-settings');
  container.innerHTML = '';

  roles.forEach((role, idx) => {
    const div = document.createElement('div');
    div.className = 'role-setting';
    div.innerHTML = `
      <div class="role-setting-row">
        <label for="sname-${idx}">Nazwa</label>
        <input id="sname-${idx}" type="text" value="${escHtml(role.name)}" data-idx="${idx}" data-field="name" />
      </div>
      <div class="role-setting-row">
        <label for="srate-${idx}">Stawka</label>
        <input id="srate-${idx}" type="number" min="0" step="1" value="${role.rate}" data-idx="${idx}" data-field="rate" />
      </div>
    `;
    container.appendChild(div);
  });
}

// ── Timer actions ─────────────────────────────────────────────────────────────

function startTimer() {
  timer.startTime     = Date.now();
  timer.pausedAt      = null;
  timer.totalPausedMs = 0;
  timer.isRunning     = true;
  startTick();
}

function pauseTimer() {
  if (!timer.isRunning) return;
  timer.pausedAt  = Date.now();
  timer.isRunning = false;
  stopTick();
}

function resumeTimer() {
  if (timer.isRunning || !timer.pausedAt) return;
  timer.totalPausedMs += Date.now() - timer.pausedAt;
  timer.pausedAt  = null;
  timer.isRunning = true;
  startTick();
}

function resetTimer() {
  timer.startTime     = null;
  timer.pausedAt      = null;
  timer.totalPausedMs = 0;
  timer.isRunning     = false;
  stopTick();
  showView('view-main');
  renderMainView();
}

function startTick() {
  stopTick();
  tickInterval = setInterval(tickRender, TICK_MS);
}

function stopTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event delegation ──────────────────────────────────────────────────────────

function bindEvents() {
  // Main view — role +/−
  document.getElementById('roles-grid').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (btn.dataset.action === 'inc') {
      roles[idx].count++;
    } else if (roles[idx].count > 0) {
      roles[idx].count--;
    }
    saveRoles();
    document.getElementById(`count-${idx}`).textContent = roles[idx].count;
    renderMainFooter();
  });

  // Start
  document.getElementById('btn-start').addEventListener('click', () => {
    if (getTotalParticipants() === 0) return;
    startTimer();
    renderActiveView();
    showView('view-active');
    document.getElementById('btn-pause').textContent = 'Pauza';
  });

  // Pause / Resume
  document.getElementById('btn-pause').addEventListener('click', () => {
    if (timer.isRunning) {
      pauseTimer();
      document.getElementById('btn-pause').textContent = 'Wznów';
      tickRender();
    } else {
      resumeTimer();
      document.getElementById('btn-pause').textContent = 'Pauza';
    }
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    resetTimer();
  });

  // Open settings
  document.getElementById('btn-settings').addEventListener('click', () => {
    renderSettingsView();
    showView('view-settings');
  });

  // Back from settings
  document.getElementById('btn-back').addEventListener('click', () => {
    renderMainView();
    showView('view-main');
  });

  // Currency radio
  document.querySelectorAll('input[name="currency"]').forEach(radio => {
    radio.addEventListener('change', () => {
      settings.currency = radio.value;
      saveSettings();
      renderSettingsView();
    });
  });

  // Role settings inputs (name / rate)
  document.getElementById('roles-settings').addEventListener('input', e => {
    const input = e.target;
    if (!input.dataset.idx) return;
    const idx   = parseInt(input.dataset.idx, 10);
    const field = input.dataset.field;
    if (field === 'name') {
      roles[idx].name = input.value;
    } else if (field === 'rate') {
      const v = parseFloat(input.value);
      roles[idx].rate = isNaN(v) || v < 0 ? 0 : v;
    }
    saveRoles();
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────

loadStorage();
bindEvents();
renderMainView();
showView('view-main');
