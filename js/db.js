// ================================================================
// Smart Parcel Management System — Database Layer
// JK Lakshmipat University Hostel Kiosk  v1.0
// ================================================================

const DB = {

  // ============================================================
  // TABLE: STUDENTS
  // ============================================================
  students: [
    { student_id: '22BTECH40001', name: 'Aarav Sharma',      mobile_no: '9876543210', hostel: 'Aravalli Boys Hostel',  room_no: 'A-101' },
    { student_id: '22BTECH40002', name: 'Priya Mehra',       mobile_no: '9876543211', hostel: 'Vindhya Girls Hostel',  room_no: 'B-205' },
    { student_id: '22BTECH40003', name: 'Rohan Gupta',       mobile_no: '9876543212', hostel: 'Aravalli Boys Hostel',  room_no: 'C-312' },
    { student_id: '21BTECH40004', name: 'Sneha Patel',       mobile_no: '9876543213', hostel: 'Vindhya Girls Hostel',  room_no: 'A-108' },
    { student_id: '23BTECH40005', name: 'Karan Verma',       mobile_no: '9876543214', hostel: 'Himalaya Boys Hostel',  room_no: 'D-215' },
    { student_id: '22BTECH40006', name: 'Nisha Joshi',       mobile_no: '9876543215', hostel: 'Sahyadri Girls Hostel', room_no: 'B-301' },
    { student_id: '21BTECH40007', name: 'Arjun Singh',       mobile_no: '9876543216', hostel: 'Himalaya Boys Hostel',  room_no: 'E-110' },
    { student_id: '23BTECH40008', name: 'Divya Rawat',       mobile_no: '9876543217', hostel: 'Sahyadri Girls Hostel', room_no: 'C-204' },
    { student_id: '22BTECH40009', name: 'Vikram Malhotra',   mobile_no: '9876543218', hostel: 'Aravalli Boys Hostel',  room_no: 'A-205' },
    { student_id: '21BTECH40010', name: 'Riya Kapoor',       mobile_no: '9876543219', hostel: 'Vindhya Girls Hostel',  room_no: 'D-112' },
    { student_id: '23MBA50001',   name: 'Harsh Agarwal',     mobile_no: '9876543220', hostel: 'Himalaya Boys Hostel',  room_no: 'F-101' },
    { student_id: '22MBA50002',   name: 'Anjali Desai',      mobile_no: '9876543221', hostel: 'Sahyadri Girls Hostel', room_no: 'A-305' },
    { student_id: '22BTECH40011', name: 'Mohit Kumar',       mobile_no: '9876543222', hostel: 'Aravalli Boys Hostel',  room_no: 'B-108' },
    { student_id: '21BTECH40012', name: 'Pooja Sharma',      mobile_no: '9876543223', hostel: 'Vindhya Girls Hostel',  room_no: 'C-301' },
    { student_id: '23BTECH40013', name: 'Rahul Jain',        mobile_no: '9876543224', hostel: 'Himalaya Boys Hostel',  room_no: 'G-203' },
    { student_id: '22BTECH40014', name: 'Tanvi Bhatt',       mobile_no: '9876543225', hostel: 'Sahyadri Girls Hostel', room_no: 'B-402' },
    { student_id: '21BTECH40015', name: 'Siddharth Rao',     mobile_no: '9876543226', hostel: 'Aravalli Boys Hostel',  room_no: 'D-307' },
  ],

  // ============================================================
  // TABLE: DELIVERY_PARTNERS
  // ============================================================
  delivery_partners: [
    { partner_id: 'DP001', name: 'Ramesh Kumar',    company: 'Amazon Logistics',  mobile_no: '8765432101' },
    { partner_id: 'DP002', name: 'Suresh Yadav',    company: 'Delhivery',         mobile_no: '8765432102' },
    { partner_id: 'DP003', name: 'Mahesh Tiwari',   company: 'BlueDart Express',  mobile_no: '8765432103' },
    { partner_id: 'DP004', name: 'Dinesh Verma',    company: 'DTDC Courier',      mobile_no: '8765432104' },
    { partner_id: 'DP005', name: 'Vinesh Shah',     company: 'Flipkart Quick',    mobile_no: '8765432105' },
    { partner_id: 'DP006', name: 'Ganesh Pandey',   company: 'Meesho Logistics',  mobile_no: '8765432106' },
    { partner_id: 'DP007', name: 'Naresh Patel',    company: 'Ekart Logistics',   mobile_no: '8765432107' },
    { partner_id: 'DP008', name: 'Lokesh Sharma',   company: 'XpressBees',        mobile_no: '8765432108' },
  ],

  // ============================================================
  // TABLE: SECURITY_GUARDS
  // ============================================================
  security_guards: [
    { guard_id: 'SG001', name: 'Ratan Singh',   username: 'ratan.sg',  password_hash: '1234' },
    { guard_id: 'SG002', name: 'Mohan Lal',     username: 'mohan.sg',  password_hash: '1234' },
    { guard_id: 'SG003', name: 'Bharat Kumar',  username: 'bharat.sg', password_hash: '1234' },
    { guard_id: 'SG004', name: 'Chetan Meena',  username: 'chetan.sg', password_hash: '1234' },
  ],

  // ============================================================
  // TABLE: STORAGE_LOCATIONS  (2 rooms × 6 racks × 3 shelves = 36)
  // ============================================================
  storage_locations: (function () {
    const locs = [];
    let id = 1;
    ['Parcel Room A', 'Parcel Room B'].forEach(room => {
      ['Rack 1', 'Rack 2', 'Rack 3', 'Rack 4', 'Rack 5', 'Rack 6'].forEach(rack => {
        ['Shelf 1', 'Shelf 2', 'Shelf 3'].forEach(shelf => {
          locs.push({
            location_id: 'LOC' + String(id).padStart(3, '0'),
            room, rack, shelf
          });
          id++;
        });
      });
    });
    return locs;
  })(),

  // ============================================================
  // TRANSACTIONAL TABLES
  // ============================================================
  parcels:             [],
  parcel_stickers:     [],
  parcel_storage:      [],
  verification_codes:  [],
  parcel_collections:  [],
  audit_logs:          [],

  // ============================================================
  // INTERNAL COUNTERS
  // ============================================================
  _counters: { parcels: 0, stickers: 0, storage: 0, collections: 0, logs: 0, verifications: 0 },

  // ============================================================
  // UTILITY
  // ============================================================
  _makeId(prefix, counterKey) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this._counters[counterKey]++;
    return `${prefix}-${date}-${String(this._counters[counterKey]).padStart(4, '0')}`;
  },

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  formatTs(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })
           + ' ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
  },

  // ============================================================
  // QUERY: Students
  // ============================================================
  searchStudents(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.students.slice(0, 10);
    return this.students.filter(s =>
      s.student_id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.mobile_no.includes(q)
    );
  },

  findStudentById(id) {
    return this.students.find(s => s.student_id.toLowerCase() === (id || '').toLowerCase()) || null;
  },

  // QUERY: Available storage locations (not currently occupied by STORED parcel)
  getAvailableLocations() {
    const occupiedIds = new Set(
      this.parcel_storage
        .filter(ps => {
          const p = this.parcels.find(x => x.parcel_id === ps.parcel_id);
          return p && p.status !== 'COLLECTED';
        })
        .map(ps => ps.location_id)
    );
    return this.storage_locations.filter(l => !occupiedIds.has(l.location_id));
  },

  // QUERY: Parcel lookups
  findParcelByTracking(no) {
    return this.parcels.find(p => p.tracking_no.toLowerCase() === (no || '').toLowerCase()) || null;
  },

  findParcelByQRToken(token) {
    const s = this.parcel_stickers.find(x => x.qr_token === token);
    return s ? (this.parcels.find(p => p.parcel_id === s.parcel_id) || null) : null;
  },

  findParcelsByStudent(student_id) {
    return this.parcels.filter(p => p.student_id === student_id);
  },

  // QUERY: Full parcel details (JOIN equivalent)
  getParcelDetails(parcel_id) {
    const parcel   = this.parcels.find(p => p.parcel_id === parcel_id);
    if (!parcel) return null;
    const student  = this.students.find(s => s.student_id === parcel.student_id);
    const partner  = this.delivery_partners.find(d => d.partner_id === parcel.partner_id);
    const guard    = this.security_guards.find(g => g.guard_id === parcel.guard_id);
    const sticker  = this.parcel_stickers.find(s => s.parcel_id === parcel_id);
    const storage  = this.parcel_storage.find(s => s.parcel_id === parcel_id);
    const location = storage ? this.storage_locations.find(l => l.location_id === storage.location_id) : null;
    const verification = this.verification_codes.find(v => v.parcel_id === parcel_id && v.status === 'ACTIVE');
    const logs     = this.audit_logs.filter(l => l.parcel_id === parcel_id);
    return { parcel, student, partner, guard, sticker, storage, location, verification, logs };
  },

  // QUERY: Today's stats
  getTodayStats() {
    const today = new Date().toISOString().slice(0, 10);
    const arrivedToday  = this.parcels.filter(p => p.arrived_at.startsWith(today)).length;
    const stored        = this.parcels.filter(p => p.status === 'STORED').length;
    const collectedToday = this.parcel_collections.filter(c => c.collected_at.startsWith(today)).length;
    const pendingOTPs   = this.verification_codes.filter(v => v.status === 'ACTIVE').length;
    return { arrivedToday, stored, collectedToday, pendingOTPs, totalParcels: this.parcels.length };
  },

  // ============================================================
  // MUTATIONS
  // ============================================================
  createParcel(student_id, partner_id, guard_id, tracking_no) {
    const parcel = {
      parcel_id:  this._makeId('PCL', 'parcels'),
      student_id, partner_id, guard_id, tracking_no,
      status:     'STORED',
      arrived_at: new Date().toISOString()
    };
    this.parcels.push(parcel);
    return parcel;
  },

  createSticker(parcel_id) {
    const sticker = {
      sticker_id:   this._makeId('STK', 'stickers'),
      parcel_id,
      qr_token:     this.generateUUID(),
      generated_at: new Date().toISOString()
    };
    this.parcel_stickers.push(sticker);
    return sticker;
  },

  assignStorage(parcel_id, location_id) {
    const rec = {
      storage_id:  this._makeId('STO', 'storage'),
      parcel_id, location_id,
      stored_at:   new Date().toISOString()
    };
    this.parcel_storage.push(rec);
    return rec;
  },

  createVerificationCode(parcel_id) {
    const rec = {
      code_id:     this._makeId('VER', 'verifications'),
      parcel_id,
      otp_hash:    this.generateOTP(),
      expiry_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      status:      'ACTIVE'
    };
    this.verification_codes.push(rec);
    return rec;
  },

  recordCollection(parcel_id, student_id, guard_id) {
    const rec = {
      collection_id: this._makeId('COL', 'collections'),
      parcel_id, student_id, guard_id,
      collected_at:  new Date().toISOString()
    };
    this.parcel_collections.push(rec);
    const p = this.parcels.find(x => x.parcel_id === parcel_id);
    if (p) p.status = 'COLLECTED';
    this.verification_codes.forEach(v => { if (v.parcel_id === parcel_id) v.status = 'USED'; });
    return rec;
  },

  addAuditLog(parcel_id, guard_id, action) {
    const rec = {
      log_id:    this._makeId('LOG', 'logs'),
      parcel_id, guard_id, action,
      logged_at: new Date().toISOString()
    };
    this.audit_logs.push(rec);
    return rec;
  },

  addStudent(student_id, name, mobile_no, hostel, room_no) {
    const s = { student_id, name, mobile_no, hostel, room_no };
    this.students.push(s);
    return s;
  },

  addDeliveryPartner(name, company, mobile_no) {
    const partner = {
      partner_id: 'DP' + String(this.delivery_partners.length + 1).padStart(3, '0'),
      name, company, mobile_no
    };
    this.delivery_partners.push(partner);
    return partner;
  },

  verifyGuardPin(pin) {
    return this.security_guards.find(g => g.password_hash === pin) || null;
  },
};

// ============================================================
// SEED TRANSACTIONAL DATA  (5 demo parcels)
// ============================================================
(function seedDemo() {
  const seeds = [
    { sid: '22BTECH40001', pid: 'DP001', gid: 'SG001', trk: 'AMZ-2026-001234', loc: 'LOC001', status: 'STORED',    hrsAgo: 2  },
    { sid: '22BTECH40002', pid: 'DP002', gid: 'SG002', trk: 'DLV-2026-567890', loc: 'LOC003', status: 'STORED',    hrsAgo: 5  },
    { sid: '21BTECH40004', pid: 'DP003', gid: 'SG001', trk: 'BDT-2026-112233', loc: 'LOC005', status: 'COLLECTED', hrsAgo: 36 },
    { sid: '23BTECH40005', pid: 'DP005', gid: 'SG003', trk: 'FLK-2026-445566', loc: 'LOC007', status: 'STORED',    hrsAgo: 1  },
    { sid: '22BTECH40006', pid: 'DP006', gid: 'SG002', trk: 'MSH-2026-778899', loc: 'LOC009', status: 'STORED',    hrsAgo: 3  },
  ];

  seeds.forEach(seed => {
    const arrivedAt = new Date(Date.now() - seed.hrsAgo * 3600 * 1000).toISOString();
    const dateStr   = arrivedAt.slice(0, 10).replace(/-/g, '');

    DB._counters.parcels++;
    const parcel_id = `PCL-${dateStr}-${String(DB._counters.parcels).padStart(4, '0')}`;
    DB.parcels.push({
      parcel_id, student_id: seed.sid, partner_id: seed.pid, guard_id: seed.gid,
      tracking_no: seed.trk, status: seed.status, arrived_at: arrivedAt
    });

    DB._counters.stickers++;
    const sticker_id = `STK-${dateStr}-${String(DB._counters.stickers).padStart(4, '0')}`;
    DB.parcel_stickers.push({ sticker_id, parcel_id, qr_token: DB.generateUUID(), generated_at: arrivedAt });

    DB._counters.storage++;
    const storage_id = `STO-${dateStr}-${String(DB._counters.storage).padStart(4, '0')}`;
    DB.parcel_storage.push({ storage_id, parcel_id, location_id: seed.loc, stored_at: arrivedAt });

    DB._counters.logs++;
    DB.audit_logs.push({
      log_id: `LOG-${dateStr}-${String(DB._counters.logs).padStart(4, '0')}`,
      parcel_id, guard_id: seed.gid, action: 'PARCEL_ARRIVED', logged_at: arrivedAt
    });

    if (seed.status === 'STORED') {
      DB._counters.verifications++;
      DB.verification_codes.push({
        code_id:     `VER-${dateStr}-${String(DB._counters.verifications).padStart(4, '0')}`,
        parcel_id, otp_hash: DB.generateOTP(),
        expiry_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: 'ACTIVE'
      });
    } else {
      const colAt = new Date(Date.now() - 0.5 * 3600 * 1000).toISOString();
      DB._counters.collections++;
      DB.parcel_collections.push({
        collection_id: `COL-${dateStr}-${String(DB._counters.collections).padStart(4, '0')}`,
        parcel_id, student_id: seed.sid, guard_id: 'SG001', collected_at: colAt
      });
      DB._counters.logs++;
      DB.audit_logs.push({
        log_id: `LOG-${dateStr}-${String(DB._counters.logs).padStart(4, '0')}`,
        parcel_id, guard_id: 'SG001', action: 'PARCEL_COLLECTED', logged_at: colAt
      });
    }
  });
})();
