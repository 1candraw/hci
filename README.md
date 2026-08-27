# Heavy Care ID (HCI) — E-commerce & DSS Alat Berat
## Project Plan & Implementation Guide

> **Stack:** Node.js (Express) + React 19 (Vite) + Tailwind CSS (opsional) + MySQL  
> **Database lokal:** MySQL  
> **Status:** MVP / Production Ready  
> **SCOPE:** Single distributor alat berat. Tidak ada multi-tenant. Fokus pada penjualan, penawaran harga (quotation), dan sistem rekomendasi SAW.

---

## DAFTAR ISI

1. [Konteks & Latar Belakang](#1-konteks--latar-belakang)
2. [Akar Masalah & Solusi](#2-akar-masalah--solusi)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Struktur Role & Akses](#4-struktur-role--akses)
5. [Database Schema Lengkap](#5-database-schema-lengkap)
6. [Modul & Menu — Internal Panel (Manager, Sales, Ops)](#6-modul--menu--internal-panel)
7. [Modul & Menu — Website Publik (Customer)](#7-modul--menu--website-publik-customer)
8. [Sistem DSS & SAW (Simple Additive Weighting)](#8-sistem-dss--saw)
9. [Positive & Negative Cases](#9-positive--negative-cases)
10. [User Flow](#10-user-flow)
11. [Catatan Implementasi Node.js + React](#11-catatan-implementasi-nodejs--react)

---

## 1. KONTEKS & LATAR BELAKANG

### Tentang Heavy Care ID (HCI)
HCI adalah platform e-commerce B2B/B2C yang dikhususkan untuk distributor alat berat (Excavator, Dozer, dll). Berbeda dengan e-commerce barang retail yang proses checkout-nya instan, penjualan alat berat membutuhkan proses penawaran (quotation), persetujuan harga (approval), dan pemeriksaan logistik yang ketat. 

### Kondisi yang Dituju
Platform ini ditujukan untuk mendigitalisasi proses:
- Menampilkan katalog alat berat secara online.
- Memberikan saran pembelian alat berat kepada calon pembeli yang awam.
- Memindahkan proses negosiasi/penawaran harga dari email/WA menjadi sistem terpadu (*Quotation System*).

---

## 2. AKAR MASALAH & SOLUSI

### Masalah 1: Customer Kesulitan Memilih Alat Berat yang Tepat
**Akar masalah:** Alat berat memiliki banyak spesifikasi teknis kompleks (Tenaga Mesin, Kapasitas Bucket, Kedalaman Gali, Berat Operasional). Pembeli sering salah memilih spesifikasi yang tidak sesuai kebutuhan proyeknya.
**Solusi di aplikasi:** Integrasi **Sistem DSS (Decision Support System)** menggunakan algoritma **SAW (Simple Additive Weighting)**. Customer cukup memasukkan seberapa penting (bobot) kriteria harga dan spesifikasi teknis, lalu sistem akan memeringkat alat berat terbaik.

### Masalah 2: Proses Negosiasi Harga (Quotation) Tidak Terlacak
**Akar masalah:** Penawaran harga alat berat melibatkan diskon besar dan ongkos kirim ke lokasi terpencil. Negosiasi via WA/Email sering hilang dan tidak ter-audit oleh manajer.
**Solusi di aplikasi:** Modul **Quotation**. Customer mengajukan penawaran -> Sales menghitung harga + diskon -> Manager melakukan *Approval* -> Deal. Semua terekam.

### Masalah 3: Modifikasi Data Sensitif Tidak Terlacak
**Akar masalah:** Harga alat berat sangat mahal. Perubahan data harga di katalog tanpa sepengetahuan manajer sangat berisiko.
**Solusi di aplikasi:** **Audit Logs**. Setiap *INSERT, UPDATE, DELETE* pada tabel krusial dicatat (User ID, Aksi, Entitas, Deskripsi, Waktu).

---

## 3. ARSITEKTUR SISTEM

### Single-tenant — Satu Perusahaan, Satu Database
Aplikasi dibuat khusus untuk satu entitas perusahaan (HCI). Arsitekturnya memisahkan Backend dan Frontend secara *decoupled*.

```text
HCI Project (Monorepo)
├── backend/          → RESTful API (Express, Node.js)
│   ├── routes/       → Definisi API Endpoint
│   ├── controllers/  → Handler HTTP Request
│   ├── services/     → Logic Bisnis (termasuk SAW)
│   └── repositories/ → Interaksi Database MySQL
└── frontend/         → React + Vite SPA
    ├── pages/        → Halaman UI
    ├── components/   → Reusable UI
    ├── api/          → Integrasi Axios ke Backend
    └── context/      → State Management (Auth)
```

### Auth Strategy
- Autentikasi menggunakan **JSON Web Token (JWT)**.
- Token disimpan di *Local Storage / Cookie* klien.
- Middleware pada Backend bertugas melakukan verifikasi Token dan mencocokkan `role_id`.

---

## 4. STRUKTUR ROLE & AKSES

| Role | Deskripsi & Akses Utama |
|------|-------------------------|
| **Customer (1)** | Registrasi, akses web publik, hitung SAW, ajukan penawaran (Quotation). |
| **Sales (2)** | Merespons Quotation (input diskon & ongkir), meneruskan ke Manager. |
| **Manager (3)** | Approve/Reject Quotation, Approve Katalog Alat Berat, lihat Dashboard & Laporan. |
| **Operasional (4)** | Memproses status pengiriman (*Logistik*), membuat Surat Jalan, Unit Checklist. |

---

## 5. DATABASE SCHEMA LENGKAP

Berikut adalah entitas utama dalam tabel MySQL (`hci`):

1. **`roles` & `users`**:
   Menyimpan data pengguna dan hak aksesnya. Tersimpan kredensial enkripsi menggunakan *Bcrypt*.
2. **`kategori_alat` & `alat_berat`**:
   - `alat_berat` menyimpan data inti produk: nama, brand, model, harga, dan spesifikasi SAW (tenaga mesin, kapasitas bucket, dll).
   - Memiliki field `status_approval` (pending, approved, rejected).
3. **`saw_sessions` & `saw_results`**:
   - `saw_sessions`: Menyimpan preferensi bobot dari customer (harga_weight, tenaga_mesin_weight, dll).
   - `saw_results`: Menyimpan skor akhir SAW dan *ranking* untuk alat berat terkait sesi tersebut.
4. **`quotations`**:
   - Penghubung *Customer*, *Sales*, *Manager*, dan *Alat Berat*. Menyimpan status negosiasi (PENDING, APPROVED, dsb).
5. **`audit_logs`**:
   - Mencatat *track record* setiap perubahan data di sistem.
6. **Tabel ERP Lanjutan**:
   - `transactions`, `transaction_items`, `payments`, `invoices`, `delivery_orders`, `unit_checklists`.

---

## 6. MODUL & MENU — INTERNAL PANEL

Halaman khusus untuk pengguna internal (Sales, Manager, Operasional).

1. **Dashboard (Manager & Sales)**
   - Ringkasan transaksi, grafik (*recharts*), status *pending approval*.
2. **Katalog & Inventory (Sales & Manager)**
   - Sales menambah alat berat baru (Status: *Pending*).
   - Manager meninjau dan *Approve* alat berat agar tampil ke publik.
3. **Manajemen Quotation (Sales, Manager, Ops)**
   - Sales: Menentukan harga bersih.
   - Manager: Menyetujui harga akhir.
   - Ops: Menyiapkan pengiriman setelah disetujui.
4. **Audit Logs & Reports (Manager)**
   - Menarik laporan penjualan, laporan performa, riwayat login dan aksi pengguna (Generate PDF).

---

## 7. MODUL & MENU — WEBSITE PUBLIK (CUSTOMER)

1. **Landing Page & Katalog Publik**
   - Menampilkan list alat berat yang sudah berstatus *Approved*.
   - Filter dan pencarian produk.
2. **Sistem Rekomendasi (DDS - SAW)**
   - Form kuesioner bobot preferensi (sangat penting - tidak penting) untuk setiap spesifikasi teknis.
   - Halaman hasil rekomendasi dan peringkat.
3. **Customer Portal (My Quotations)**
   - Melacak status penawaran yang diajukan.
   - Unduh faktur/invoice.

---

## 8. SISTEM DSS & SAW

Alur Perhitungan *Simple Additive Weighting* (SAW) di aplikasi ini:
1. **Penentuan Kriteria**: Benefit (Tenaga Mesin, Kapasitas Bucket, Kedalaman Gali, Berat) & Cost (Harga).
2. **Pembobotan**: Customer memberikan nilai kepentingan (1 hingga 4: 1-Tidak Penting, 2-Cukup Penting, 3-Penting, 4-Sangat Penting).
3. **Normalisasi Matriks**: 
   - *Benefit* = Nilai / Max(Nilai)
   - *Cost* = Min(Nilai) / Nilai
4. **Perhitungan Akhir**: Skor Akhir = Σ (Nilai Normalisasi × Bobot).
5. **Output**: Sistem mengembalikan *array* alat berat terurut berdasarkan Skor Tertinggi.

---

## 9. POSITIVE & NEGATIVE CASES

### Kasus Positif (Happy Path)
- **Quotation**: Customer ajukan penawaran -> Sales input harga pas -> Manager Approve -> Operasional proses kirim.
- **Rekomendasi**: Customer tidak mengerti spesifikasi -> Input preferensi utama budget & butuh kapasitas gali besar -> Sistem memunculkan Excavator tipe *Medium* sebagai peringkat 1.

### Kasus Negatif
- **Katalog Belum Disetujui**: Sales input alat berat. Customer *tidak bisa* mencarinya di halaman publik sampai Manager melakukan klik *Approve*.
- **Role Violation**: Pengguna dengan role *Customer* mencoba mengakses route backend `/api/reports` -> Ditolak oleh Middleware `role.middleware.js`.

---

## 10. USER FLOW

**Flow Penawaran (Quotation) Hingga Pengiriman:**
1. **Customer** klik "Ajukan Penawaran" pada detail alat berat.
2. Sistem mencatat `quotations` status *PENDING*.
3. **Sales** melihat daftar pending, klik "Beri Penawaran". Input *Ongkos Kirim* & *Diskon*. Status berubah ke *MENUNGGU_APPROVAL*.
4. **Manager** login, melihat pengajuan, klik "Setuju". Status berubah ke *APPROVED*.
5. **Operasional** melihat status *APPROVED*, lalu menyiapkan fisik barang dan membuat `delivery_orders` serta `unit_checklists`. Status jadi *PROSES_PENGIRIMAN*.

---

## 11. CATATAN IMPLEMENTASI NODE.JS + REACT

### Menjalankan Backend:
```bash
cd backend
npm install
# Setup file .env (DB_NAME=hci)
npm run dev
```

### Menjalankan Frontend:
```bash
cd frontend
npm install
npm run dev
```
*(Default berjalan di http://localhost:5173 dengan Axios baseURL mengarah ke backend)*

---
*Dokumentasi ini disesuaikan dengan arsitektur Project Plan HCI.*
