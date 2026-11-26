# 🎓 Smart Parcel Management & Sticker Kiosk
### JK Lakshmipat University — Hostel Parcel System

A full-screen, touch-optimised **kiosk web application** built for the DBMS course project at JKLU. Deployed on touchscreen vending-style terminals at hostel parcel rooms, it allows delivery partners and security guards to log parcels, generate printable stickers with QR codes, and manage collections.

---

## 📂 Project Structure

```
DBMS-Project/
├── index.html          # Main kiosk UI (single-page app)
├── css/
│   ├── main.css        # Dark-mode kiosk design system
│   └── print.css       # Thermal label print styles (100×150mm)
├── js/
│   ├── db.js           # In-memory database layer + seed data (9 tables)
│   └── app.js          # Application logic, state management, all UI
└── README.md
```

---

## 🗄️ Database Schema (9 Tables)

| Table | Key Columns |
|-------|-------------|
| `STUDENTS` | `student_id`, `name`, `mobile_no`, `hostel`, `room_no` |
| `DELIVERY_PARTNERS` | `partner_id`, `name`, `company`, `mobile_no` |
| `SECURITY_GUARDS` | `guard_id`, `name`, `username`, `password_hash` |
| `PARCELS` | `parcel_id`, `student_id`, `partner_id`, `guard_id`, `tracking_no`, `status`, `arrived_at` |
| `PARCEL_STICKERS` | `sticker_id`, `parcel_id`, `qr_token`, `generated_at` |
| `PARCEL_STORAGE` | `storage_id`, `parcel_id`, `location_id`, `stored_at` |
| `STORAGE_LOCATIONS` | `location_id`, `room`, `rack`, `shelf` |
| `VERIFICATION_CODES` | `code_id`, `parcel_id`, `otp_hash`, `expiry_time`, `status` |
| `PARCEL_COLLECTIONS` | `collection_id`, `parcel_id`, `student_id`, `guard_id`, `collected_at` |
| `AUDIT_LOGS` | `log_id`, `parcel_id`, `guard_id`, `action`, `logged_at` |

Storage: **2 rooms × 6 racks × 3 shelves = 36 locations**  
Seed data: **5 demo parcels**, 17 students, 8 delivery partners, 4 guards

---

## 🚀 How to Run

Just open `index.html` in any modern browser — **no server needed**.

```
Right-click index.html → Open with → Chrome / Edge / Firefox
```

Or serve locally:
```bash
npx serve .
# or
python -m http.server 8080
```

---

## 🖥️ Kiosk Features

### 🏠 Idle Attract Screen
- Live clock & date display
- Real-time stats: arrived today, stored, collected, active OTPs
- Large CTA: **"Generate Parcel Sticker / Log Arrival"**
- Guard/Admin button (PIN protected)
- Schema Inspector toggle

### 📦 4-Step Sticker Generation Workflow
| Step | Action |
|------|--------|
| **Step 1** | Search/select student by ID, name, or mobile. Register new student if needed. |
| **Step 2** | Select delivery partner (or add new), enter tracking number, pick receiving guard |
| **Step 3** | Browse available storage racks & shelves, assign location |
| **Step 4** | Auto-generates sticker + QR code + OTP. Print or preview. |

### 🛡️ Guard Quick-Check Panel
- PIN protected (Demo PIN: **1234**)
- Look up any parcel by tracking number, QR token, or student ID
- View storage location, OTP, parcel status
- One-click collection confirmation → updates `PARCEL_COLLECTIONS` + `AUDIT_LOGS`

### 🗄️ Live DB Inspector
- 8 browsable table tabs
- Shows live rows as records are inserted
- Newest records highlighted
- Status badges, timestamp formatting

### ⏱️ Inactivity / Kiosk Lock
- 2-minute inactivity timeout → warning modal with 30-second countdown
- Auto-resets to idle screen if no interaction
- Any touch/click resets the timer

### 🖨️ Sticker Print
- `window.print()` with `@media print` layout
- Sized for **100mm × 150mm** thermal label
- Includes: student details, tracking, storage location, QR code, OTP

---

## 👥 Seed Credentials

| Role | PIN |
|------|-----|
| All Guards | `1234` |

**Demo Guards:** Ratan Singh · Mohan Lal · Bharat Kumar · Chetan Meena

---

## 🧪 Testing the DBMS Flow

1. Open `index.html`
2. Click **"Generate Parcel Sticker / Log Arrival"**
3. Search for `Aarav` → Select student
4. Select `Amazon Logistics`, enter tracking `TEST-001`, pick any guard
5. Select any storage location (green cells = available)
6. Click **"Generate Sticker"** → Preview sticker, see QR code
7. Click **"View DB Inspector"** → watch all tables update live
8. Click **"Print Sticker"**
9. Click **"Done"** → returns to idle

---

## 🎓 DBMS Concepts Demonstrated

- **Relational Schema Design** — Normalized across 9 tables with FK relationships
- **SQL Transactions** — INSERT across PARCELS → PARCEL_STICKERS → PARCEL_STORAGE → AUDIT_LOGS atomically
- **Joins (simulated)** — `getParcelDetails()` performs multi-table lookup
- **Constraints** — Unique IDs, status enums (`STORED`/`COLLECTED`), OTP expiry
- **Audit Trail** — Every action appended to `AUDIT_LOGS`
- **Data Integrity** — OTP invalidated on collection, storage freed

---

*Built for DBMS Project · JK Lakshmipat University · 2026*
