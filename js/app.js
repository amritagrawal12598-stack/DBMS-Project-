/* ================================================================
   Smart Parcel Management System — Application Logic
   JK Lakshmipat University Hostel Kiosk  v1.0
   ================================================================ */

'use strict';

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
const State = {
  currentScreen:  'idle',
  currentStep:    1,

  // Workflow selections
  selectedStudent:  null,
  selectedPartner:  null,
  selectedGuard:    null,
  trackingNo:       '',
  selectedLocation: null,

  // Generated records
  currentParcel:   null,
  currentSticker:  null,
  currentStorage:  null,
  currentOTP:      null,

  // Guard panel
  guardPanelOpen:      false,
  guardAuthenticated:  false,
  activeGuard:         null,
  foundParcel:         null,
  guardPanelGuard:     null,

  // DB Inspector
  dbInspectorOpen:  false,
  dbActiveTab:      'parcels',

  // New student mode
  newStudentMode:   false,

  // PIN entry
  pinBuffer: '',
  pinTarget: null, // 'guard' | 'admin'

  // Inactivity
  inactivityTimerId:  null,
  warningTimerId:     null,
  warningCountdown:   30,
  warningIntervalId:  null,
  IDLE_TIMEOUT:       120000,  // 2 min
  WARNING_DURATION:   30,      // 30 s
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function $(id)       { return document.getElementById(id); }
function $q(sel)     { return document.querySelector(sel); }
function $all(sel)   { return document.querySelectorAll(sel); }

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function companyIcon(company) {
  const icons = {
    'Amazon Logistics': '📦', 'Delhivery': '🚚',
    'BlueDart Express': '🔵', 'DTDC Courier': '🟠',
    'Flipkart Quick': '⭐', 'Meesho Logistics': '💜',
    'Ekart Logistics': '🛵', 'XpressBees': '🐝',
  };
  return icons[company] || '📮';
}

// ═══════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
function showToast(message, type = 'info', duration = 3000) {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${esc(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ═══════════════════════════════════════════════════════════════
// INACTIVITY TIMER
// ═══════════════════════════════════════════════════════════════
function resetInactivityTimer() {
  clearTimeout(State.inactivityTimerId);
  clearTimeout(State.warningTimerId);
  if (State.warningIntervalId) { clearInterval(State.warningIntervalId); State.warningIntervalId = null; }
  hideWarningModal();

  if (State.currentScreen !== 'idle') {
    State.inactivityTimerId = setTimeout(() => {
      showInactivityWarning();
    }, State.IDLE_TIMEOUT);
  }
}

function showInactivityWarning() {
  State.warningCountdown = State.WARNING_DURATION;
  const modal = $('modal-inactivity');
  modal.classList.add('active');
  updateWarningDisplay();
  State.warningIntervalId = setInterval(() => {
    State.warningCountdown--;
    updateWarningDisplay();
    if (State.warningCountdown <= 0) {
      clearInterval(State.warningIntervalId);
      State.warningIntervalId = null;
      hideWarningModal();
      resetToIdle();
    }
  }, 1000);
}

function updateWarningDisplay() {
  const countEl = $('inactivity-count');
  const fillEl  = $('inactivity-fill');
  if (countEl) countEl.textContent = State.warningCountdown;
  if (fillEl)  fillEl.style.width  = `${(State.warningCountdown / State.WARNING_DURATION) * 100}%`;
}

function hideWarningModal() {
  const modal = $('modal-inactivity');
  if (modal) modal.classList.remove('active');
}

function keepAlive() {
  hideWarningModal();
  if (State.warningIntervalId) { clearInterval(State.warningIntervalId); State.warningIntervalId = null; }
  resetInactivityTimer();
}

// ═══════════════════════════════════════════════════════════════
// SCREEN NAVIGATION
// ═══════════════════════════════════════════════════════════════
function showScreen(name) {
  $all('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen-${name}`);
  if (target) target.classList.add('active');
  State.currentScreen = name;
  resetInactivityTimer();
}

function resetToIdle() {
  // Clear workflow state
  State.currentStep     = 1;
  State.selectedStudent = null;
  State.selectedPartner = null;
  State.selectedGuard   = null;
  State.trackingNo      = '';
  State.selectedLocation = null;
  State.currentParcel   = null;
  State.currentSticker  = null;
  State.currentStorage  = null;
  State.currentOTP      = null;
  State.newStudentMode  = false;
  State.guardPanelOpen  = false;
  State.guardAuthenticated = false;
  State.activeGuard     = null;
  State.foundParcel     = null;

  // Close drawers
  $('drawer-guard').classList.remove('open');
  $('drawer-db').classList.remove('open');
  State.dbInspectorOpen = false;

  showScreen('idle');
  updateIdleStats();
  clearTimeout(State.inactivityTimerId);
}

// ═══════════════════════════════════════════════════════════════
// IDLE SCREEN
// ═══════════════════════════════════════════════════════════════
function updateClock() {
  const now = new Date();
  const hh  = now.getHours();
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12  = hh % 12 || 12;
  const timeEl = $('clock-time');
  const dateEl = $('clock-date');
  if (timeEl) timeEl.innerHTML = `${h12}:${mm}<span>:${ss} ${ampm}</span>`;
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-IN', {
      weekday:'long', day:'numeric', month:'long', year:'numeric'
    });
  }
}

function updateIdleStats() {
  const stats = DB.getTodayStats();
  const el = (id, val) => { const e = $(id); if (e) e.textContent = val; };
  el('stat-arrived',  stats.arrivedToday);
  el('stat-stored',   stats.stored);
  el('stat-collected',stats.collectedToday);
  el('stat-otps',     stats.pendingOTPs);
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOW — Start
// ═══════════════════════════════════════════════════════════════
function startWorkflow() {
  State.currentStep = 1;
  showScreen('workflow');
  renderStep(1);
  renderProgress();
}

function renderProgress() {
  const steps = ['step-prog-1','step-prog-2','step-prog-3','step-prog-4'];
  const connectors = ['step-conn-1','step-conn-2','step-conn-3'];
  steps.forEach((id, idx) => {
    const el = $(id);
    if (!el) return;
    el.classList.remove('active','done');
    if (idx + 1 < State.currentStep) el.classList.add('done');
    else if (idx + 1 === State.currentStep) el.classList.add('active');
  });
  connectors.forEach((id, idx) => {
    const el = $(id);
    if (!el) return;
    el.style.background = idx + 1 < State.currentStep
      ? 'var(--green-500)'
      : idx + 1 === State.currentStep
        ? 'linear-gradient(90deg,var(--green-500),var(--border))'
        : 'var(--border)';
  });
}

function renderStep(n) {
  $all('.step-panel').forEach(p => p.classList.remove('active'));
  const panel = $(`step-${n}`);
  if (panel) panel.classList.add('active');
  State.currentStep = n;
  renderProgress();

  if (n === 1) renderStep1();
  if (n === 2) renderStep2();
  if (n === 3) renderStep3();
  // Step 4 is rendered by generateSticker()
}

function goNextStep() {
  if (State.currentStep < 4) renderStep(State.currentStep + 1);
}
function goPrevStep() {
  if (State.currentStep > 1) renderStep(State.currentStep - 1);
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 — Student Lookup
// ═══════════════════════════════════════════════════════════════
function renderStep1() {
  const panel = $('step-1-content');
  if (!panel) return;

  panel.innerHTML = `
    <div class="card">
      <div class="card-title">🔍 Search Student</div>
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="student-search" placeholder="Search by Student ID, Name, or Mobile No…" autocomplete="off" />
      </div>
      <div id="student-results" class="result-list" style="margin-top:14px;"></div>
    </div>

    ${State.selectedStudent ? renderSelectedStudent() : ''}

    <div class="card">
      <div class="card-title">➕ New Student?</div>
      <button class="btn-secondary" onclick="toggleNewStudentForm()" id="btn-new-student" style="min-width:200px;">
        📝 Register New Student
      </button>
      <div id="new-student-form" class="new-student-form" style="margin-top:16px;">
        <div class="grid-2">
          <div class="field"><label>Student ID *</label><input type="text" id="ns-id" placeholder="e.g. 24BTECH40016" /></div>
          <div class="field"><label>Full Name *</label><input type="text" id="ns-name" placeholder="Full Name" /></div>
          <div class="field"><label>Mobile No *</label><input type="text" id="ns-mobile" placeholder="10-digit mobile" /></div>
          <div class="field"><label>Hostel *</label>
            <select id="ns-hostel">
              <option value="">Select Hostel…</option>
              <option>Aravalli Boys Hostel</option>
              <option>Himalaya Boys Hostel</option>
              <option>Vindhya Girls Hostel</option>
              <option>Sahyadri Girls Hostel</option>
            </select>
          </div>
          <div class="field"><label>Room No *</label><input type="text" id="ns-room" placeholder="e.g. A-101" /></div>
        </div>
        <button class="btn-green" onclick="registerNewStudent()" style="align-self:flex-start;margin-top:4px;">
          ✅ Register & Select Student
        </button>
      </div>
    </div>

    <div class="workflow-nav">
      <button class="btn-secondary" onclick="resetToIdle()">✖ Cancel</button>
      <button class="btn-primary" id="btn-step1-next"
        ${State.selectedStudent ? '' : 'disabled'}
        onclick="goNextStep()">
        Next: Parcel Details →
      </button>
    </div>
  `;

  // Search handler with debounce
  const input = $('student-search');
  if (input) {
    let debTimer;
    input.addEventListener('input', () => {
      clearTimeout(debTimer);
      debTimer = setTimeout(() => searchAndRenderStudents(input.value), 180);
    });
    searchAndRenderStudents('');
    setTimeout(() => input.focus(), 100);
  }
}

function renderSelectedStudent() {
  const s = State.selectedStudent;
  return `
    <div class="selected-box">
      <div>
        <div class="sel-name">${esc(s.name)}</div>
        <div class="sel-meta">${esc(s.student_id)} · ${esc(s.hostel)} · Room ${esc(s.room_no)} · 📱 ${esc(s.mobile_no)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="check-mark">✅</span>
        <button class="btn-secondary" style="min-height:36px;min-width:70px;font-size:12px;" onclick="clearStudentSelection()">Change</button>
      </div>
    </div>`;
}

function searchAndRenderStudents(query) {
  const results = DB.searchStudents(query);
  const container = $('student-results');
  if (!container) return;

  if (!results.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>No students found for "${esc(query)}"</p></div>`;
    return;
  }

  container.innerHTML = results.map(s => `
    <div class="result-item ${State.selectedStudent?.student_id === s.student_id ? 'selected' : ''}"
         onclick="selectStudent('${esc(s.student_id)}')">
      <div>
        <div class="result-name">${esc(s.name)}</div>
        <div class="result-meta">${esc(s.student_id)} · ${esc(s.hostel)} · Room ${esc(s.room_no)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="result-badge green">${esc(s.mobile_no)}</span>
        ${State.selectedStudent?.student_id === s.student_id ? '<span style="font-size:18px;">✅</span>' : ''}
      </div>
    </div>`).join('');
}

function selectStudent(id) {
  State.selectedStudent = DB.findStudentById(id);
  renderStep1();
  showToast(`Selected: ${State.selectedStudent.name}`, 'success');
  resetInactivityTimer();
}

function clearStudentSelection() {
  State.selectedStudent = null;
  renderStep1();
}

function toggleNewStudentForm() {
  State.newStudentMode = !State.newStudentMode;
  const form = $('new-student-form');
  if (form) form.classList.toggle('show', State.newStudentMode);
}

function registerNewStudent() {
  const id     = $('ns-id')?.value.trim();
  const name   = $('ns-name')?.value.trim();
  const mobile = $('ns-mobile')?.value.trim();
  const hostel = $('ns-hostel')?.value;
  const room   = $('ns-room')?.value.trim();

  if (!id || !name || !mobile || !hostel || !room) {
    showToast('Please fill in all required fields', 'error'); return;
  }
  if (DB.findStudentById(id)) {
    showToast('Student ID already exists!', 'error'); return;
  }
  if (!/^\d{10}$/.test(mobile)) {
    showToast('Enter a valid 10-digit mobile number', 'error'); return;
  }

  const student = DB.addStudent(id, name, mobile, hostel, room);
  State.selectedStudent  = student;
  State.newStudentMode   = false;
  renderStep1();
  showToast(`Student "${name}" registered & selected!`, 'success');
}

// ═══════════════════════════════════════════════════════════════
// STEP 2 — Parcel & Delivery Details
// ═══════════════════════════════════════════════════════════════
function renderStep2() {
  const panel = $('step-2-content');
  if (!panel) return;

  panel.innerHTML = `
    ${State.selectedStudent ? `
    <div class="selected-box">
      <div>
        <div class="sel-name">${esc(State.selectedStudent.name)}</div>
        <div class="sel-meta">${esc(State.selectedStudent.student_id)} · ${esc(State.selectedStudent.hostel)} · Room ${esc(State.selectedStudent.room_no)}</div>
      </div>
      <span class="check-mark">✅</span>
    </div>` : ''}

    <div class="card">
      <div class="card-title">📦 Tracking Number</div>
      <div class="field">
        <label>Tracking / AWB Number *</label>
        <input type="text" id="tracking-input" placeholder="e.g. AMZ-2026-XXXXXXX"
          value="${esc(State.trackingNo)}"
          oninput="State.trackingNo=this.value.trim(); updateStep2Nav();" autocomplete="off" />
      </div>
    </div>

    <div class="card">
      <div class="card-title">🚚 Select Delivery Partner</div>
      <div class="partner-grid" id="partner-grid">
        ${DB.delivery_partners.map(p => `
          <div class="partner-card ${State.selectedPartner?.partner_id === p.partner_id ? 'selected' : ''}"
               onclick="selectPartner('${esc(p.partner_id)}')">
            <div class="partner-logo">${companyIcon(p.company)}</div>
            <div class="partner-company">${esc(p.company)}</div>
            <div class="partner-name">${esc(p.name)}</div>
            <div class="partner-phone">${esc(p.mobile_no)}</div>
          </div>`).join('')}
        <div class="partner-card" onclick="showAddPartnerForm()" style="border-style:dashed;opacity:0.6;">
          <div class="partner-logo">➕</div>
          <div class="partner-company">ADD NEW</div>
          <div class="partner-name">New Partner</div>
        </div>
      </div>
      <div id="add-partner-form" style="display:none;margin-top:16px;">
        <div class="grid-2" style="gap:12px;">
          <div class="field"><label>Name</label><input type="text" id="np-name" placeholder="Delivery person name" /></div>
          <div class="field"><label>Company</label><input type="text" id="np-company" placeholder="e.g. IndiaPost" /></div>
          <div class="field"><label>Mobile</label><input type="text" id="np-mobile" placeholder="Mobile number" /></div>
        </div>
        <button class="btn-green" onclick="registerNewPartner()" style="margin-top:12px;min-height:44px;">✅ Add & Select</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🛡️ Receiving Security Guard</div>
      <div class="guard-selector" id="guard-selector">
        ${DB.security_guards.map(g => `
          <div class="guard-opt ${State.selectedGuard?.guard_id === g.guard_id ? 'selected' : ''}"
               onclick="selectGuard('${esc(g.guard_id)}')">
            <div style="font-size:24px;margin-bottom:4px;">👮</div>
            <div class="guard-opt-name">${esc(g.name)}</div>
            <div class="guard-opt-id">${esc(g.guard_id)}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="workflow-nav">
      <button class="btn-secondary" onclick="goPrevStep()">← Back</button>
      <button class="btn-primary" id="btn-step2-next"
        ${(State.selectedPartner && State.selectedGuard && State.trackingNo) ? '' : 'disabled'}
        onclick="goNextStep()">
        Next: Storage Location →
      </button>
    </div>
  `;
}

function selectPartner(id) {
  State.selectedPartner = DB.delivery_partners.find(p => p.partner_id === id) || null;
  renderStep2(); resetInactivityTimer();
  showToast(`Partner: ${State.selectedPartner?.company}`, 'info');
}

function selectGuard(id) {
  State.selectedGuard = DB.security_guards.find(g => g.guard_id === id) || null;
  renderStep2(); resetInactivityTimer();
  showToast(`Guard: ${State.selectedGuard?.name}`, 'info');
}

function updateStep2Nav() {
  const btn = $('btn-step2-next');
  if (btn) btn.disabled = !(State.selectedPartner && State.selectedGuard && State.trackingNo);
}

function showAddPartnerForm() {
  const f = $('add-partner-form');
  if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function registerNewPartner() {
  const name    = $('np-name')?.value.trim();
  const company = $('np-company')?.value.trim();
  const mobile  = $('np-mobile')?.value.trim();
  if (!name || !company || !mobile) { showToast('Fill all partner fields', 'error'); return; }
  const partner = DB.addDeliveryPartner(name, company, mobile);
  State.selectedPartner = partner;
  renderStep2();
  showToast(`Partner "${company}" added!`, 'success');
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 — Assign Storage Location
// ═══════════════════════════════════════════════════════════════
function renderStep3() {
  const panel = $('step-3-content');
  if (!panel) return;

  const available = DB.getAvailableLocations();
  const roomGroups = {};
  available.forEach(loc => {
    if (!roomGroups[loc.room]) roomGroups[loc.room] = [];
    roomGroups[loc.room].push(loc);
  });

  panel.innerHTML = `
    <div class="card" style="background:rgba(59,130,246,0.04);">
      <div class="card-title">📋 Summary So Far</div>
      <div class="info-grid">
        <div class="info-cell">
          <div class="label">👤 Student</div>
          <div class="value">${esc(State.selectedStudent?.name)}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${esc(State.selectedStudent?.hostel)} · ${esc(State.selectedStudent?.room_no)}</div>
        </div>
        <div class="info-cell">
          <div class="label">📦 Delivery</div>
          <div class="value">${esc(State.selectedPartner?.company)}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Tracking: ${esc(State.trackingNo)}</div>
        </div>
        <div class="info-cell">
          <div class="label">🛡️ Guard</div>
          <div class="value">${esc(State.selectedGuard?.name)}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${esc(State.selectedGuard?.guard_id)}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🗄️ Available Storage Locations 
        <span style="font-weight:400;color:var(--green-400);">(${available.length} slots free)</span>
      </div>
      ${Object.entries(roomGroups).map(([room, locs]) => `
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;color:var(--blue-500);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em;">📁 ${esc(room)}</div>
          <div class="location-grid">
            ${locs.map(loc => `
              <div class="location-card ${State.selectedLocation?.location_id === loc.location_id ? 'selected' : ''}"
                   onclick="selectLocation('${esc(loc.location_id)}')">
                <div class="loc-icon">🗂️</div>
                <div class="loc-rack">${esc(loc.rack)}</div>
                <div class="loc-shelf">${esc(loc.shelf)}</div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
      ${available.length === 0 ? `<div class="empty-state"><span class="empty-icon">🚫</span><p>No storage locations available. Please collect some parcels first.</p></div>` : ''}
    </div>

    ${State.selectedLocation ? `
    <div class="selected-box">
      <div>
        <div class="sel-name">📍 ${esc(State.selectedLocation.room)} — ${esc(State.selectedLocation.rack)}, ${esc(State.selectedLocation.shelf)}</div>
        <div class="sel-meta">Location ID: ${esc(State.selectedLocation.location_id)}</div>
      </div>
      <span class="check-mark">✅</span>
    </div>` : ''}

    <div class="workflow-nav">
      <button class="btn-secondary" onclick="goPrevStep()">← Back</button>
      <button class="btn-gold" id="btn-generate"
        ${State.selectedLocation ? '' : 'disabled'}
        onclick="generateSticker()">
        🏷️ Generate Sticker & Log Parcel
      </button>
    </div>
  `;
}

function selectLocation(id) {
  State.selectedLocation = DB.storage_locations.find(l => l.location_id === id) || null;
  renderStep3();
  resetInactivityTimer();
  showToast(`Location: ${State.selectedLocation?.rack}, ${State.selectedLocation?.shelf}`, 'info');
}

// ═══════════════════════════════════════════════════════════════
// STEP 4 — Generate Sticker
// ═══════════════════════════════════════════════════════════════
function generateSticker() {
  if (!State.selectedStudent || !State.selectedPartner || !State.selectedGuard
      || !State.trackingNo || !State.selectedLocation) {
    showToast('Missing required data!', 'error'); return;
  }

  // DB Transactions
  const parcel  = DB.createParcel(
    State.selectedStudent.student_id,
    State.selectedPartner.partner_id,
    State.selectedGuard.guard_id,
    State.trackingNo
  );
  const sticker  = DB.createSticker(parcel.parcel_id);
  const storage  = DB.assignStorage(parcel.parcel_id, State.selectedLocation.location_id);
  const otp      = DB.createVerificationCode(parcel.parcel_id);
  DB.addAuditLog(parcel.parcel_id, State.selectedGuard.guard_id, 'PARCEL_ARRIVED');

  State.currentParcel  = parcel;
  State.currentSticker = sticker;
  State.currentStorage = storage;
  State.currentOTP     = otp;

  renderStep(4);
  renderStickerPreview();
  updateIdleStats();
  refreshDbInspector();
  showToast('Parcel logged! Sticker generated.', 'success');
}

function renderStickerPreview() {
  const panel = $('step-4-content');
  if (!panel) return;

  const s  = State.selectedStudent;
  const p  = State.selectedPartner;
  const g  = State.selectedGuard;
  const l  = State.selectedLocation;
  const pk = State.currentParcel;
  const st = State.currentSticker;
  const ot = State.currentOTP;

  panel.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:48px;animation:heroFloat 2s ease-in-out infinite;">🎉</div>
      <h3 style="font-size:24px;font-weight:800;color:var(--green-400);margin-top:8px;">Parcel Logged Successfully!</h3>
      <p style="color:var(--text-secondary);font-size:14px;margin-top:4px;">${esc(pk.parcel_id)} · ${new Date(pk.arrived_at).toLocaleString('en-IN')}</p>
    </div>

    <div class="sticker-wrapper">

      <!-- Printable Sticker -->
      <div id="sticker-preview">
        <div class="sticker-header">
          <div class="sticker-univ">🎓 JK Lakshmipat University, Jaipur</div>
          <div class="sticker-title">📦 Smart Parcel Kiosk</div>
          <div class="sticker-id-pill">${esc(st.sticker_id)}</div>
        </div>

        <div class="sticker-section-title">🧑‍🎓 Student Details</div>
        <div class="sticker-row"><span class="sk-label">Name</span><span class="sk-value">${esc(s.name)}</span></div>
        <div class="sticker-row"><span class="sk-label">Student ID</span><span class="sk-value">${esc(s.student_id)}</span></div>
        <div class="sticker-row"><span class="sk-label">Hostel</span><span class="sk-value">${esc(s.hostel)}</span></div>
        <div class="sticker-row"><span class="sk-label">Room No.</span><span class="sk-value">${esc(s.room_no)}</span></div>
        <div class="sticker-row"><span class="sk-label">Mobile</span><span class="sk-value">${esc(s.mobile_no)}</span></div>

        <hr class="sticker-divider">

        <div class="sticker-section-title">🚚 Delivery Details</div>
        <div class="sticker-row"><span class="sk-label">Partner</span><span class="sk-value">${esc(p.company)}</span></div>
        <div class="sticker-row"><span class="sk-label">Tracking No.</span><span class="sk-value" style="font-family:'JetBrains Mono',monospace;">${esc(pk.tracking_no)}</span></div>
        <div class="sticker-row"><span class="sk-label">Guard</span><span class="sk-value">${esc(g.name)}</span></div>
        <div class="sticker-row"><span class="sk-label">Arrived</span><span class="sk-value">${DB.formatTs(pk.arrived_at)}</span></div>

        <hr class="sticker-divider">

        <div class="sticker-section-title">📍 Storage Location</div>
        <div class="sticker-loc-box">
          <div class="loc-part"><div class="lp-label">Room</div><div class="lp-val">${esc(l.room.replace('Parcel Room ',''))}</div></div>
          <div class="loc-part"><div class="lp-label">Rack</div><div class="lp-val">${esc(l.rack.replace('Rack ',''))}</div></div>
          <div class="loc-part"><div class="lp-label">Shelf</div><div class="lp-val">${esc(l.shelf.replace('Shelf ',''))}</div></div>
        </div>

        <div id="sticker-qr"></div>
        <div style="text-align:center;font-size:9px;color:#6b7280;font-family:'JetBrains Mono',monospace;margin-top:-4px;">${st.qr_token.slice(0,16)}…</div>

        ${ot ? `
        <div class="sticker-otp-box">
          <div class="otp-label">🔑 Collection OTP</div>
          <div class="otp-val">${esc(ot.otp_hash)}</div>
          <div style="font-size:9px;color:#16a34a;">Valid 24 hours · Share with student only</div>
        </div>` : ''}

        <div class="sticker-footer">
          JKLU Smart Parcel System · ${new Date().getFullYear()} · ${esc(st.sticker_id)}
        </div>
      </div>

      <!-- Action Panel -->
      <div class="sticker-actions">
        <h4>📋 Sticker Actions</h4>

        <div class="card" style="padding:16px;">
          <div class="card-title" style="font-size:11px;margin-bottom:10px;">📊 Logged Records</div>
          <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;font-family:'JetBrains Mono',monospace;">
            <div style="color:var(--blue-500);">✓ PARCELS: ${esc(pk.parcel_id)}</div>
            <div style="color:var(--gold-400);">✓ STICKERS: ${esc(st.sticker_id)}</div>
            <div style="color:var(--green-400);">✓ STORAGE: ${esc(State.currentStorage.storage_id)}</div>
            ${ot ? `<div style="color:var(--orange-400);">✓ OTP: ${ot.otp_hash}</div>` : ''}
            <div style="color:var(--text-muted);">✓ AUDIT LOG created</div>
          </div>
        </div>

        <button class="btn-gold" onclick="printSticker()" id="btn-print" style="min-height:56px;font-size:16px;">
          🖨️ Print Sticker
        </button>

        <button class="btn-secondary" onclick="toggleDbInspector()" style="min-height:52px;">
          🗄️ View DB Inspector
        </button>

        <button class="btn-green" onclick="resetToIdle()" style="min-height:56px;font-size:16px;">
          ✅ Done — Return to Kiosk
        </button>
      </div>
    </div>
  `;

  // Generate QR Code
  setTimeout(() => {
    const qrEl = $('sticker-qr');
    if (qrEl && typeof QRCode !== 'undefined') {
      qrEl.innerHTML = '';
      new QRCode(qrEl, {
        text: `JKLU-PARCEL:${st.sticker_id}:${st.qr_token}`,
        width: 140, height: 140,
        colorDark: '#000000', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else if (qrEl) {
      qrEl.innerHTML = `<div style="width:140px;height:140px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#666;border:1px solid #ddd;border-radius:4px;">QR: ${st.sticker_id}</div>`;
    }
  }, 100);
}

function printSticker() {
  // Build the hidden print area with proper print markup
  const st = State.currentSticker;
  const pk = State.currentParcel;
  const s  = State.selectedStudent;
  const p  = State.selectedPartner;
  const g  = State.selectedGuard;
  const l  = State.selectedLocation;
  const ot = State.currentOTP;

  let printArea = $('sticker-print-area');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'sticker-print-area';
    document.body.appendChild(printArea);
  }

  printArea.innerHTML = `
    <div class="sp-header">
      <div class="sp-univ">JK Lakshmipat University, Jaipur — Smart Parcel Kiosk</div>
      <div class="sp-title">📦 Parcel Sticker</div>
      <span class="sp-sticker-id">${esc(st.sticker_id)}</span>
    </div>

    <div class="sp-section">Student Details</div>
    <div class="sp-row"><span class="sp-label">Name:</span><span class="sp-value">${esc(s.name)}</span></div>
    <div class="sp-row"><span class="sp-label">Student ID:</span><span class="sp-value">${esc(s.student_id)}</span></div>
    <div class="sp-row"><span class="sp-label">Hostel:</span><span class="sp-value">${esc(s.hostel)}</span></div>
    <div class="sp-row"><span class="sp-label">Room:</span><span class="sp-value">${esc(s.room_no)}</span></div>
    <div class="sp-row"><span class="sp-label">Mobile:</span><span class="sp-value">${esc(s.mobile_no)}</span></div>

    <hr class="sp-dash">

    <div class="sp-section">Delivery Details</div>
    <div class="sp-row"><span class="sp-label">Partner:</span><span class="sp-value">${esc(p.company)}</span></div>
    <div class="sp-row"><span class="sp-label">Tracking:</span><span class="sp-value">${esc(pk.tracking_no)}</span></div>
    <div class="sp-row"><span class="sp-label">Guard:</span><span class="sp-value">${esc(g.name)}</span></div>
    <div class="sp-row"><span class="sp-label">Arrived:</span><span class="sp-value">${DB.formatTs(pk.arrived_at)}</span></div>

    <hr class="sp-dash">

    <div class="sp-section">Storage Location</div>
    <div class="sp-loc-box">
      <div class="sp-loc-part"><span class="sp-loc-label">Room</span><span class="sp-loc-val">${esc(l.room)}</span></div>
      <div class="sp-loc-part"><span class="sp-loc-label">Rack</span><span class="sp-loc-val">${esc(l.rack)}</span></div>
      <div class="sp-loc-part"><span class="sp-loc-label">Shelf</span><span class="sp-loc-val">${esc(l.shelf)}</span></div>
    </div>

    <div class="sp-qr-wrap" id="print-qr"></div>
    <div class="sp-scan-note">Scan QR to verify • Token: ${st.qr_token.slice(0,20)}…</div>

    ${ot ? `
    <hr class="sp-dash">
    <div class="sp-otp">
      <div class="sp-otp-label">Collection OTP (valid 24h — share with student only)</div>
      <div class="sp-otp-val">${esc(ot.otp_hash)}</div>
    </div>` : ''}

    <div class="sp-footer">
      JK Lakshmipat University Smart Parcel System · ${esc(st.sticker_id)} · ${DB.formatTs(new Date().toISOString())}
    </div>
  `;

  // Generate QR for print
  setTimeout(() => {
    const printQrEl = $('print-qr');
    if (printQrEl && typeof QRCode !== 'undefined') {
      new QRCode(printQrEl, {
        text: `JKLU-PARCEL:${st.sticker_id}:${st.qr_token}`,
        width: 110, height: 110,
        colorDark: '#000000', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    }
    setTimeout(() => window.print(), 400);
  }, 100);
}

// ═══════════════════════════════════════════════════════════════
// PIN MODAL
// ═══════════════════════════════════════════════════════════════
function showPinModal(target = 'guard') {
  State.pinBuffer = '';
  State.pinTarget = target;
  updatePinDisplay();
  $('modal-pin').classList.add('active');
  $('pin-error').textContent = '';
}

function closePinModal() {
  $('modal-pin').classList.remove('active');
  State.pinBuffer = '';
}

function pinInput(digit) {
  if (State.pinBuffer.length >= 4) return;
  State.pinBuffer += digit;
  updatePinDisplay();
  if (State.pinBuffer.length === 4) {
    setTimeout(attemptPinAuth, 200);
  }
}

function pinDelete() {
  State.pinBuffer = State.pinBuffer.slice(0, -1);
  updatePinDisplay();
}

function updatePinDisplay() {
  const dots = $all('.pin-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i < State.pinBuffer.length);
  });
}

function attemptPinAuth() {
  const guard = DB.verifyGuardPin(State.pinBuffer);
  if (guard) {
    State.activeGuard = guard;
    State.guardAuthenticated = true;
    closePinModal();
    if (State.pinTarget === 'guard') openGuardPanel();
    showToast(`Welcome, ${guard.name}!`, 'success');
  } else {
    $('pin-error').textContent = '❌ Incorrect PIN. Try again.';
    State.pinBuffer = '';
    updatePinDisplay();
  }
}

// ═══════════════════════════════════════════════════════════════
// GUARD PANEL
// ═══════════════════════════════════════════════════════════════
function triggerGuardPanel() {
  if (!State.guardAuthenticated) {
    showPinModal('guard');
  } else {
    openGuardPanel();
  }
}

function openGuardPanel() {
  State.guardPanelOpen = true;
  $('drawer-guard').classList.add('open');
  renderGuardPanel();
  resetInactivityTimer();
}

function closeGuardPanel() {
  State.guardPanelOpen = false;
  State.foundParcel = null;
  State.guardPanelGuard = null;
  $('drawer-guard').classList.remove('open');
}

function renderGuardPanel() {
  const body = $('guard-panel-body');
  if (!body) return;

  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:12px;">
      <span style="font-size:28px;">👮</span>
      <div>
        <div style="font-weight:700;">${esc(State.activeGuard?.name)}</div>
        <div style="font-size:12px;color:var(--text-muted);">${esc(State.activeGuard?.guard_id)} · Guard Mode Active</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔍 Parcel Lookup</div>
      <div class="field">
        <label>Tracking No / QR Token / Student ID</label>
        <input type="text" id="guard-search-input" placeholder="Enter to search…" autocomplete="off" />
      </div>
      <button class="btn-primary" onclick="guardSearchParcel()" style="margin-top:12px;min-height:48px;min-width:140px;">
        🔍 Search Parcel
      </button>
    </div>

    <div id="guard-result-area"></div>
  `;

  const inp = $('guard-search-input');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') guardSearchParcel(); });
}

function guardSearchParcel() {
  const query = $('guard-search-input')?.value.trim();
  if (!query) { showToast('Enter a search query', 'warning'); return; }

  let parcel = DB.findParcelByTracking(query)
            || DB.findParcelByQRToken(query)
            || DB.findParcelsByStudent(query)[0];

  const area = $('guard-result-area');
  if (!parcel) {
    area.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><p>No parcel found for "${esc(query)}"</p></div>`;
    return;
  }

  State.foundParcel = parcel;
  const details = DB.getParcelDetails(parcel.parcel_id);
  renderGuardParcelDetails(details, area);
}

function renderGuardParcelDetails(d, container) {
  const isStored = d.parcel.status === 'STORED';
  container.innerHTML = `
    <div class="parcel-status-card">
      <div class="parcel-status-header ${isStored ? 'stored' : 'collected'}">
        <div>
          <div style="font-weight:800;font-size:15px;">${esc(d.parcel.parcel_id)}</div>
          <div style="font-size:12px;color:var(--text-muted);">${esc(d.parcel.tracking_no)}</div>
        </div>
        <span class="parcel-status-badge ${isStored ? 'stored' : 'collected'}">${d.parcel.status}</span>
      </div>

      <div class="parcel-detail-grid">
        <div class="pdg-row"><span class="pdg-label">Student</span><span class="pdg-value">${esc(d.student?.name)} (${esc(d.student?.student_id)})</span></div>
        <div class="pdg-row"><span class="pdg-label">Hostel / Room</span><span class="pdg-value">${esc(d.student?.hostel)} · ${esc(d.student?.room_no)}</span></div>
        <div class="pdg-row"><span class="pdg-label">Mobile</span><span class="pdg-value">${esc(d.student?.mobile_no)}</span></div>
        <div class="pdg-row"><span class="pdg-label">Partner</span><span class="pdg-value">${esc(d.partner?.company)} (${esc(d.partner?.name)})</span></div>
        <div class="pdg-row"><span class="pdg-label">Arrived</span><span class="pdg-value">${DB.formatTs(d.parcel.arrived_at)}</span></div>
        <div class="pdg-row"><span class="pdg-label">Guard</span><span class="pdg-value">${esc(d.guard?.name)}</span></div>
        ${d.location ? `<div class="pdg-row"><span class="pdg-label">Location</span><span class="pdg-value">${esc(d.location.room)} · ${esc(d.location.rack)} · ${esc(d.location.shelf)}</span></div>` : ''}
        ${d.sticker ? `<div class="pdg-row"><span class="pdg-label">Sticker ID</span><span class="pdg-value" style="font-family:'JetBrains Mono',monospace;">${esc(d.sticker.sticker_id)}</span></div>` : ''}
      </div>

      ${d.verification && isStored ? `
      <div class="otp-display">
        <div class="otp-label">🔑 Collection OTP</div>
        <div class="otp-code">${esc(d.verification.otp_hash)}</div>
        <div style="font-size:11px;color:var(--green-400);margin-top:4px;">Valid until ${DB.formatTs(d.verification.expiry_time)}</div>
      </div>` : ''}
    </div>

    ${isStored ? `
    <div class="collect-confirm">
      <h4>📤 Mark as Collected</h4>
      <p>Select the guard recording this collection, then confirm.</p>
      <div class="guard-selector" style="margin-bottom:16px;">
        ${DB.security_guards.map(g => `
          <div class="guard-opt ${State.guardPanelGuard?.guard_id === g.guard_id ? 'selected' : ''}"
               onclick="selectGuardPanelGuard('${esc(g.guard_id)}')">
            <div class="guard-opt-name">${esc(g.name)}</div>
            <div class="guard-opt-id">${esc(g.guard_id)}</div>
          </div>`).join('')}
      </div>
      <button class="btn-green" style="width:100%;min-height:52px;"
        onclick="confirmCollection('${esc(d.parcel.parcel_id)}','${esc(d.student?.student_id)}')">
        ✅ Confirm Collection
      </button>
    </div>` : `
    <div style="padding:16px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:12px;text-align:center;color:var(--green-400);font-weight:700;">
      ✅ This parcel has been collected
    </div>`}
  `;
}

function selectGuardPanelGuard(id) {
  State.guardPanelGuard = DB.security_guards.find(g => g.guard_id === id) || null;
  const area = $('guard-result-area');
  if (State.foundParcel && area) {
    const details = DB.getParcelDetails(State.foundParcel.parcel_id);
    renderGuardParcelDetails(details, area);
  }
}

function confirmCollection(parcel_id, student_id) {
  const guardId = (State.guardPanelGuard || State.activeGuard)?.guard_id;
  if (!guardId) { showToast('Select the collecting guard first', 'warning'); return; }

  DB.recordCollection(parcel_id, student_id, guardId);
  DB.addAuditLog(parcel_id, guardId, 'PARCEL_COLLECTED');

  State.foundParcel = DB.findParcelByTracking(State.foundParcel.tracking_no)
                   || DB.parcels.find(p => p.parcel_id === parcel_id);

  const details = DB.getParcelDetails(parcel_id);
  const area = $('guard-result-area');
  if (area) renderGuardParcelDetails(details, area);

  updateIdleStats();
  refreshDbInspector();
  showToast('Parcel marked as COLLECTED!', 'success');
}

// ═══════════════════════════════════════════════════════════════
// DB INSPECTOR
// ═══════════════════════════════════════════════════════════════
const DB_INSPECTOR_TABLES = {
  parcels: {
    label: 'PARCELS',
    cols: ['parcel_id','student_id','partner_id','guard_id','tracking_no','status','arrived_at'],
    statusCol: 'status'
  },
  parcel_stickers: {
    label: 'PARCEL_STICKERS',
    cols: ['sticker_id','parcel_id','qr_token','generated_at'],
  },
  parcel_storage: {
    label: 'PARCEL_STORAGE',
    cols: ['storage_id','parcel_id','location_id','stored_at'],
  },
  audit_logs: {
    label: 'AUDIT_LOGS',
    cols: ['log_id','parcel_id','guard_id','action','logged_at'],
  },
  verification_codes: {
    label: 'VERIF. CODES',
    cols: ['code_id','parcel_id','otp_hash','expiry_time','status'],
    statusCol: 'status'
  },
  parcel_collections: {
    label: 'COLLECTIONS',
    cols: ['collection_id','parcel_id','student_id','guard_id','collected_at'],
  },
  students: {
    label: 'STUDENTS',
    cols: ['student_id','name','mobile_no','hostel','room_no'],
  },
  delivery_partners: {
    label: 'PARTNERS',
    cols: ['partner_id','name','company','mobile_no'],
  },
};

function toggleDbInspector() {
  State.dbInspectorOpen = !State.dbInspectorOpen;
  $('drawer-db').classList.toggle('open', State.dbInspectorOpen);
  if (State.dbInspectorOpen) refreshDbInspector();
  resetInactivityTimer();
}

function switchDbTab(tabKey) {
  State.dbActiveTab = tabKey;
  $all('.db-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabKey));
  refreshDbTable();
}

function refreshDbInspector() {
  if (!State.dbInspectorOpen) return;
  refreshDbTable();
}

function refreshDbTable() {
  const cfg  = DB_INSPECTOR_TABLES[State.dbActiveTab];
  const data = DB[State.dbActiveTab] || [];
  const wrap = $('db-table-container');
  const countEl = $('db-row-count');
  if (!wrap) return;
  if (countEl) countEl.textContent = `${data.length} rows`;

  if (!data.length) {
    wrap.innerHTML = `<div class="empty-state" style="padding:30px;"><span class="empty-icon" style="font-size:36px;">📭</span><p>No records yet</p></div>`;
    return;
  }

  const cols = cfg.cols;
  wrap.innerHTML = `
    <table class="db-table">
      <thead>
        <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${[...data].reverse().map((row, idx) => `
          <tr class="${idx < 1 ? 'new-row' : ''}">
            ${cols.map(c => {
              let val = row[c] ?? '—';
              if (c === cfg?.statusCol) {
                return `<td><span class="db-badge ${String(val).toLowerCase()}">${val}</span></td>`;
              }
              if (c.endsWith('_at') || c.endsWith('_time')) {
                return `<td>${DB.formatTs(val)}</td>`;
              }
              val = String(val);
              if (val.length > 36) val = val.slice(0, 33) + '…';
              return `<td>${esc(val)}</td>`;
            }).join('')}
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL EVENT LISTENERS (inactivity reset)
// ═══════════════════════════════════════════════════════════════
['click','touchstart','keydown','mousemove'].forEach(evt => {
  document.addEventListener(evt, () => {
    if (State.currentScreen !== 'idle') resetInactivityTimer();
  }, { passive: true });
});

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
function initApp() {
  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Idle stats
  updateIdleStats();
  setInterval(updateIdleStats, 15000);

  // Show idle screen
  showScreen('idle');

  console.log('%c🎓 JKLU Smart Parcel Kiosk v1.0 — Ready', 'color:#3b82f6;font-weight:900;font-size:16px;');
  console.log('%cDB Tables:', 'color:#f59e0b;font-weight:700;', DB);
}

window.addEventListener('DOMContentLoaded', initApp);
