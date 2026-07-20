# JHMPro — Workshop Management System
## Project Plan & Implementation Guide

> **Stack:** Laravel 13 + Livewire 4 + Alpine.js + Tailwind CSS + PHP 8.3+  
> **Database lokal:** MySQL (instalasi langsung)  
> **Database production:** PostgreSQL (Heroku)  
> **Integrasi:** Midtrans (payment) · Shipbite (shipping)  
> **Author:** Voldemort (Marcelo) — Solo Developer
> **Status:** Brainstorming / Pre-development  
> **Last Updated:** Juni 2026
>
> **SCOPE:** Single bengkel — JHMPro. Tidak ada multi-tenant, tidak ada feature flag, semua fitur selalu aktif.

---

## DAFTAR ISI

1. [Konteks & Latar Belakang](#1-konteks--latar-belakang)
2. [Akar Masalah & Solusi](#2-akar-masalah--solusi)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Struktur Role & Akses](#4-struktur-role--akses)
5. [Database Schema Lengkap](#5-database-schema-lengkap)
6. [Modul & Menu — Admin Panel](#6-modul--menu--admin-panel)
7. [Modul & Menu — Mekanik Panel](#7-modul--menu--mekanik-panel)
8. [Modul & Menu — Website Publik (Customer)](#8-modul--menu--website-publik-customer)
9. [Integrasi Eksternal](#9-integrasi-eksternal)
10. [Sistem RFM & K-Means](#10-sistem-rfm--k-means)
11. [Positive & Negative Cases](#11-positive--negative-cases)
12. [User Flow](#12-user-flow)
13. [Roadmap Pengembangan](#13-roadmap-pengembangan)
14. [Catatan Implementasi Laravel 13 + Livewire 4](#14-catatan-implementasi-laravel-13--livewire-4)

---
## 1. KONTEKS & LATAR BELAKANG

### Tentang JHMPro
JHMPro adalah bengkel motor **spesialis modifikasi mesin** milik keluarga. Berbeda dari bengkel servis harian, fokus utamanya adalah pekerjaan modifikasi yang granular: bore up, ganti noken as, retune ECU, porting polish, dan sebagainya. Bengkel juga memiliki fasilitas **dyno test**, sehingga bengkel lain (partner) bisa datang khusus untuk keperluan pengukuran tenaga.

### Kondisi Saat Ini
- Pencatatan masih manual (buku/WhatsApp)
- Tidak ada riwayat spesifikasi mesin customer yang terstruktur
- Tidak ada sistem booking — customer harus datang langsung untuk cek slot
- Tidak ada visibilitas stok sparepart
- Tidak ada data untuk analisis customer

### Pengguna Internal Saat Ini
- **Admin aktif:** 2 orang (developer + ibu)
- **Mekanik:** Ayah sebagai kepala mekanik (role mekanik kemungkinan belum dipakai aktif di awal)

### Rencana Jangka Panjang
Aplikasi ini dibuat khusus untuk JHMPro — **single bengkel**, tidak ada multi-tenant.

---

## 2. AKAR MASALAH & SOLUSI

Bagian ini adalah inti dari brainstorming — mendeskripsikan masalah nyata yang dialami bengkel dan bagaimana aplikasi ini menyelesaikannya.

### Masalah 1: Tidak Ada Riwayat Spesifikasi Mesin yang Terstruktur

**Akar masalah:**
Customer modifikasi mesin sering kembali untuk upgrade lanjutan. Setiap kali mereka datang, mekanik harus "mengingat" atau menebak kondisi mesin saat ini — piston ukuran berapa, noken as merek apa, ECU yang dipakai. Kalau mekanik sedang tidak ada atau lupa, informasi ini hilang. Tidak ada dokumentasi yang bisa diandalkan.

**Dampak nyata:**
- Risiko kesalahan rekomendasi part (misalnya rekomendasikan piston yang tidak kompatibel)
- Waktu terbuang untuk diagnosis ulang setiap kunjungan
- Customer kehilangan kepercayaan jika bengkel tidak "ingat" motor mereka

**Solusi di aplikasi:**
Tabel `vehicle_engine_specs` (one-to-one dengan kendaraan) menyimpan kondisi mesin terkini secara granular per komponen. Setiap perubahan otomatis tercatat di `vehicle_modification_logs` sebagai snapshot — sehingga ada riwayat lengkap kondisi mesin dari waktu ke waktu. Customer bisa lihat riwayat ini sendiri via portal.

---

### Masalah 2: Booking Tidak Efisien — Customer Harus Datang Dulu

**Akar masalah:**
Untuk pekerjaan modifikasi yang membutuhkan waktu panjang, slot bengkel terbatas (hanya 2 orang). Customer sering datang dan pulang tanpa kepastian karena slot penuh. Ini membuang waktu customer dan mengurangi kepercayaan.

**Dampak nyata:**
- Potensi kehilangan customer karena ketidaknyamanan
- Bengkel tidak bisa merencanakan beban kerja harian
- Admin menerima pertanyaan slot via WhatsApp yang tidak terstruktur

**Solusi di aplikasi:**
Sistem booking online dengan kalender slot. Customer bisa cek ketersediaan dan booking dari rumah. Admin konfirmasi via panel. Mode `per_day` dengan kapasitas 2 sesuai kondisi JHMPro. Mode `per_mekanik` tersedia jika suatu saat bengkel menambah mekanik tetap.

---

### Masalah 3: Tidak Ada Visibilitas Stok Sparepart

**Akar masalah:**
Sparepart racing/modifikasi yang dijual JHMPro (termasuk import Thailand) tidak tercatat secara sistematis. Stok sering tidak diketahui secara real-time. Kadang customer sudah booking modifikasi tertentu, ternyata partnya habis.

**Dampak nyata:**
- Pekerjaan tertunda karena part tidak tersedia
- Tidak ada peringatan dini ketika stok menipis
- Tidak ada data untuk keputusan restock

**Solusi di aplikasi:**
Inventory management dengan `stock_movements` sebagai audit trail. Setiap transaksi (invoice/order) otomatis mengurangi stok. Alert dashboard ketika stok ≤ `minimum_stock`. Admin bisa lihat histori keluar-masuk stok setiap part.

---

### Masalah 4: Tidak Ada Data Customer untuk Pengambilan Keputusan

**Akar masalah:**
Bengkel tidak tahu siapa customer paling loyal, siapa yang sudah lama tidak kembali, atau berapa rata-rata nilai transaksi per customer. Semua keputusan bisnis (kapan promo, siapa yang perlu dihubungi) berdasarkan intuisi.

**Dampak nyata:**
- Tidak bisa targetkan customer yang tepat untuk promo
- Customer lama (high value) pergi tanpa diketahui
- Tidak ada data untuk evaluasi pertumbuhan bisnis

**Solusi di aplikasi:**
Segmentasi customer menggunakan **RFM (Recency, Frequency, Monetary) + K-Means Clustering**. Dihitung otomatis setiap malam. Hasilnya: 5 segmen customer (Champion, Loyal, Potential, At Risk, Lost) yang bisa dilihat di dashboard dan di-export untuk campaign WhatsApp. Ini juga menjadi fitur diferensiasi saat dijual ke bengkel lain.

---

### Masalah 5: Penjualan Sparepart Terbatas pada Walk-in

**Akar masalah:**
JHMPro menjual part racing (termasuk import Thailand) yang sulit didapat di tempat lain. Saat ini hanya bisa dibeli langsung di bengkel atau via chat WhatsApp yang tidak terstruktur. Potensi penjualan ke luar area tidak termanfaatkan.

**Dampak nyata:**
- Jangkauan customer terbatas pada area sekitar bengkel
- Proses pemesanan via WA tidak efisien dan rawan kesalahan
- Tidak ada tracking order untuk customer

**Solusi di aplikasi:**
Online shop terintegrasi dengan Midtrans (payment) dan Shipbite (shipping). Customer bisa browse katalog, beli, bayar, dan tracking pengiriman — semua dari satu platform. Admin proses order dari panel admin.

---

### Masalah 6: Tidak Ada Sistem Partner Dyno yang Tercatat

**Akar masalah:**
Bengkel lain yang datang untuk dyno test dicatat secara informal. Tidak ada riwayat, tidak ada invoice terstruktur untuk transaksi partner.

**Solusi di aplikasi:**
Entitas `partners` terpisah dari `customers`. Invoice tipe `partner` untuk mencatat transaksi dyno. Laporan bisa difilter per partner.

---

## 3. ARSITEKTUR SISTEM

### Single-tenant — Satu Bengkel, Satu Database

Aplikasi ini dibuat khusus untuk JHMPro. Tidak ada `workshop_id`, tidak ada Global Scope tenant. Arsitektur sesederhana mungkin.

```
Database: jhmpro
├── users           → semua user internal + customer
├── customers       → data customer bengkel
├── vehicles        → kendaraan milik customer
├── invoices        → transaksi bengkel
├── orders          → transaksi online shop
└── ... tabel lainnya
```

### Panel Aplikasi (Custom Multi-Panel — Blade + Livewire + Tailwind)

Tanpa Filament, setiap panel dibangun sebagai **route group Laravel** dengan middleware role-check, layout Blade masing-masing, dan sidebar yang dirender secara kondisional.

| Panel | URL Prefix | Guard | Role | Login Page |
|-------|-----------|-------|------|------------|
| Admin Panel | `/admin` | `admin` | `super_admin`, `admin` | `/admin/login` |
| Mekanik Panel | `/mekanik` | `admin` | `mekanik` | `/admin/login` |
| Website Publik | `/` | `web` | `customer` (guest & auth) | `/login` |

> **Catatan guard:** Guard `admin` digunakan untuk semua user internal (super_admin, admin, mekanik). Guard `web` khusus customer. Dua guard = dua sesi terpisah = tidak bisa "cross-login".

### Auth Strategy
- **User internal** (super_admin, admin, mekanik): Guard `admin`, login di `/admin/login`, sesi terpisah dari customer
- **Customer**: Guard `web`, login di `/login`
- Tabel `users` satu untuk semua role, dibedakan via kolom `role`
- Middleware `CheckRole` melindungi route per area:
  - `/admin/*` → role IN ('super_admin', 'admin')
  - `/mekanik/*` → role = 'mekanik'
  - Beberapa route admin dibatasi lebih lanjut: role = 'super_admin'

### Routing Structure
```
// routes/web.php

// Customer routes
Route::middleware('guest:web')->group(fn() => ['/login', '/register']);
Route::middleware('auth:web')->group(fn() => ['/dashboard', '/vehicles', '/booking', '/orders', ...]);

// Admin routes
Route::prefix('admin')->middleware(['auth:admin', 'role:super_admin,admin'])->group(fn() => [
    // semua route admin
]);
Route::prefix('admin')->middleware(['auth:admin', 'role:super_admin'])->group(fn() => [
    '/admin/reports', '/admin/settings', ...
]);

// Mekanik routes
Route::prefix('mekanik')->middleware(['auth:admin', 'role:mekanik'])->group(function () {
    // route mekanik saja
});
```

### Stack Lengkap
```
Backend    : Laravel 13 (PHP >= 8.3)
Admin UI   : Blade + Livewire 4 + Alpine.js + Tailwind CSS (custom, full control)
Mekanik UI : Blade + Livewire 4 + Alpine.js + Tailwind CSS (panel terpisah, layout berbeda)
Frontend   : Blade + Livewire 4 + Alpine.js + Tailwind CSS (website publik customer)
Database   : MySQL (lokal, instalasi langsung) / PostgreSQL (Heroku production)
Payment    : Midtrans Snap
Shipping   : Shipbite API
Queue      : Laravel Queue (database driver awal, upgrade ke Redis jika perlu)
Schedule   : Laravel Scheduler (untuk RFM job harian)
```

---

## 4. STRUKTUR ROLE & AKSES

### Hierarki Role

```
super_admin   → Admin Panel, akses penuh semua fitur + config + laporan keuangan
└── admin     → Admin Panel, operasional harian (tanpa config & laporan)
    └── mekanik → Mekanik Panel, hanya work order milik sendiri
customer      → Website Publik saja (register mandiri)
```

**Catatan penting — tidak ada self-register untuk user internal:**
- Admin dan mekanik **tidak bisa register sendiri** — akun dibuat oleh super_admin
- Hanya customer yang bisa register mandiri via `/register` di website publik
- Route `/register` di website publik harus memastikan role yang dibuat selalu `customer`
- Super_admin membuat akun admin/mekanik dari menu Pengaturan → Manajemen User

### Permission Matrix

| Fitur | super_admin | admin | mekanik | customer |
|-------|:-----------:|:-----:|:-------:|:--------:|
| Config aplikasi & settings | ✅ | ❌ | ❌ | ❌ |
| Akses Kasir POS | ✅ | ✅ | ❌ | ❌ |
| Buat akun admin & mekanik | ✅ | ❌ | ❌ | ❌ |
| Aktifkan / nonaktifkan akun | ✅ | ❌ | ❌ | ❌ |
| Reset password user internal | ✅ | ❌ | ❌ | ❌ |
| Laporan keuangan | ✅ | ❌ | ❌ | ❌ |
| Customer & kendaraan CRUD | ✅ | ✅ | ❌ | ❌ |
| Invoice CRUD | ✅ | ✅ | ❌ | ❌ |
| Booking (sisi admin) | ✅ | ✅ | ❌ | ❌ |
| Inventory & sparepart | ✅ | ✅ | ❌ | ❌ |
| Work order (semua) | ✅ | ✅ | ❌ | ❌ |
| Work order (milik sendiri) | ✅ | ✅ | ✅ | ❌ |
| Dashboard RFM | ✅ | ✅ | ❌ | ❌ |
| Edit profil sendiri | ✅ | ✅ | ✅ | ✅ |
| Kelola kategori sparepart | ✅ | ❌ | ❌ | ❌ |
| Booking (sisi customer) | ❌ | ❌ | ❌ | ✅ |
| Online shop (beli) | ❌ | ❌ | ❌ | ✅ |
| Lihat spek motor sendiri | ❌ | ❌ | ❌ | ✅ |

---

## 5. DATABASE SCHEMA LENGKAP

### Grup 1 — Auth & Users

#### `users`
```
id              PK
name            string
email           string unique
password        string
role            enum('super_admin', 'admin', 'mekanik', 'customer')
is_active       boolean default true
is_available    boolean default true        -- toggle online/offline untuk mekanik
timestamps
```

---

### Grup 2 — Customer & Kendaraan

#### `customers`
```
id              PK
nama            string
no_hp           string
email           string nullable
alamat          text nullable
catatan         text nullable
timestamps
```

#### `partners`
```
id              PK
nama_bengkel    string
contact_person  string
no_hp           string
alamat          text nullable
catatan         text nullable
timestamps
```

#### `vehicles`
```
id              PK
customer_id     FK → customers.id
merk            string
model           string
tipe            string nullable
tahun           year
no_polisi       string
no_rangka       string nullable
no_mesin        string nullable
warna           string nullable
foto            string nullable
catatan         text nullable
timestamps
```

#### `vehicle_engine_specs`
```
id                  PK
vehicle_id          FK → vehicles.id  UNIQUE (one-to-one)

-- Cylinder Head
cylinder_head       string nullable
porting_polish      string nullable
klep_in             string nullable
klep_ex             string nullable
per_klep            string nullable
noken_as            string nullable

-- Cylinder Block
cylinder_block      string nullable
boring_size         string nullable
piston              string nullable
piston_ring         string nullable
pen_piston          string nullable

-- Crankshaft
crankshaft          string nullable
stroke              string nullable
big_end             string nullable
small_end           string nullable

-- Kopling
kopling             string nullable
per_kopling         string nullable

-- Fuel System
karburator_injeksi  string nullable
filter_udara        string nullable
knalpot             string nullable

-- Pengapian
pengapian_type      string nullable
cdi_ecu             string nullable
koil                string nullable
busi                string nullable

-- Kelistrikan
kelistrikan_acg     string nullable
kelistrikan_aki     string nullable

-- Transmisi
rasio_gigi          string nullable
gir_depan           string nullable
gir_belakang        string nullable
rantai              string nullable

catatan_tambahan    text nullable
updated_at          timestamp
```

#### `vehicle_modification_logs`
```
id              PK
vehicle_id      FK → vehicles.id
invoice_id      FK → invoices.id nullable  -- null jika log manual
user_id         FK → users.id
judul           string
deskripsi       text nullable
specs_snapshot  json   -- snapshot vehicle_engine_specs saat itu
parts_used      json   -- [{sparepart_id, nama, qty}]
foto            json nullable
logged_at       timestamp
```

---

### Grup 3 — Operasional Bengkel

#### `services`
```
id                  PK
nama_service        string
deskripsi           text nullable
harga_default       decimal(15,2)
durasi_estimasi     int nullable   -- menit
is_active           boolean default true
is_bookable         boolean default false
timestamps
```

#### `invoices`
```
id              PK
vehicle_id      FK → vehicles.id nullable
customer_id     FK → customers.id nullable
partner_id      FK → partners.id nullable
user_id         FK → users.id
booking_id      FK → bookings.id nullable
invoice_number  string   unique   -- INV-2025-0001
-- vehicle_id nullable: kosongkan jika transaksi beli sparepart saja (tanpa servis)
-- customer_id nullable: kosongkan jika pembeli tidak mau daftar (walk-in anonim)
tanggal         date
tipe            enum('walk_in','booking','partner','online')
catatan         text nullable
subtotal        decimal(15,2)
discount        decimal(15,2) default 0
grand_total     decimal(15,2)
payment_status  enum('unpaid','partial','paid') default 'unpaid'
amount_paid     decimal(15,2) default 0
timestamps
```

#### `invoice_items`
```
id                    PK
invoice_id            FK → invoices.id
service_id            FK → services.id nullable
sparepart_id          FK → spareparts.id nullable
type                  enum('service','sparepart')
nama_snapshot         string   -- nama saat transaksi, immutable
qty                   int default 1
harga_jual            decimal(15,2)
harga_beli_snapshot   decimal(15,2)   -- HPP saat transaksi
subtotal              decimal(15,2)
timestamps
```

#### `work_orders`
```
id               PK
invoice_id       FK → invoices.id
vehicle_id       FK → vehicles.id
mekanik_id       FK → users.id nullable
status           enum('antrian','proses','selesai') default 'antrian'
keluhan_customer text nullable
catatan_mekanik  text nullable
mulai_at         timestamp nullable
selesai_at       timestamp nullable
timestamps
```

---

### Grup 4 — Booking

#### `bookings`
```
id              PK
customer_id     FK → customers.id nullable   -- null hanya untuk source='manual' (admin input) tanpa customer terdaftar
vehicle_id      FK → vehicles.id nullable
mekanik_id      FK → users.id nullable
invoice_id      FK → invoices.id nullable    -- diisi setelah jadi invoice
booking_number  string unique   -- BK-2025-0001
-- customer_id TIDAK PERNAH null untuk booking dari website publik
-- vehicle_id TIDAK PERNAH null untuk booking dari website publik
-- Null hanya mungkin jika admin input manual dari panel (sumber: manual)
tanggal_booking date
jam_mulai       time nullable
jam_selesai     time nullable
status          enum('pending','confirmed','cancelled','completed') default 'pending'
source          enum('website','manual') default 'website'
-- 'website': dari form booking publik (customer_id & vehicle_id selalu terisi)
-- 'manual' : admin input dari panel (customer_id & vehicle_id bisa null jika tamu walk-in)
keluhan         text nullable
catatan_admin   text nullable
nama_pemesan    string
no_hp_pemesan   string
confirmed_at    timestamp nullable
cancelled_at    timestamp nullable
cancel_reason   string nullable
timestamps
```

#### `booking_services`
```
id              PK
booking_id      FK → bookings.id
service_id      FK → services.id nullable
bundle_id       FK → product_bundles.id nullable
type            enum('service','bundle')
nama_snapshot   string
harga_estimasi  decimal(15,2)
```

#### `booking_slots`
```
id              PK
mekanik_id      FK → users.id nullable   -- null jika mode per_day
tanggal         date
kapasitas       int
terisi          int default 0
is_blocked      boolean default false
blocked_reason  string nullable
timestamps
UNIQUE(tanggal, mekanik_id)
```

---

### Grup 5 — Inventory & Produk

#### `sparepart_categories`
```
id              PK
parent_id       FK → sparepart_categories.id nullable   -- self-referencing
name            string
slug            string
icon_image      string nullable
description     text nullable
timestamps
```

#### `spareparts`
```
id              PK
category_id     FK → sparepart_categories.id nullable
sku             string   unique
item_name       string
brand           string nullable
satuan          string   -- pcs, set, liter, dll
harga_beli      decimal(15,2)
harga_jual      decimal(15,2)
harga_online    decimal(15,2) nullable
stock           int default 0
minimum_stock   int default 0
berat           int nullable   -- gram, untuk kalkulasi ongkir
dimensi         json nullable  -- {"p":10,"l":5,"t":3} cm
images          json nullable
deskripsi       text nullable
is_active       boolean default true
is_sold_online  boolean default false
timestamps
```

#### `stock_movements`
```
id              PK
sparepart_id    FK → spareparts.id
user_id         FK → users.id
type            enum('in','out','adjustment')
qty             int
stock_before    int
stock_after     int
reference_type  string nullable   -- 'invoice', 'order', 'manual'
reference_id    int nullable
catatan         text nullable
timestamps
```

#### `product_bundles`
```
id              PK
nama            string
slug            string   unique
deskripsi       text nullable
harga           decimal(15,2)
images          json nullable
is_active       boolean default true
is_sold_online  boolean default false
is_bookable     boolean default false
timestamps
```

#### `product_bundle_items`
```
id              PK
bundle_id       FK → product_bundles.id
sparepart_id    FK → spareparts.id nullable
service_id      FK → services.id nullable
type            enum('sparepart','service')
qty             int default 1
harga_snapshot  decimal(15,2)
```

---

### Grup 6 — Online Shop & Payment

#### `orders`
```
id              PK
customer_id     FK → customers.id nullable
order_number    string unique   -- ORD-2025-0001
nama_penerima   string
no_hp_penerima  string
alamat_kirim    text
provinsi        string
kota            string
kecamatan       string
kode_pos        string
subtotal        decimal(15,2)
ongkir          decimal(15,2) default 0
discount        decimal(15,2) default 0
grand_total     decimal(15,2)
status          enum('pending','processing','shipped','delivered','cancelled') default 'pending'
payment_status  enum('unpaid','paid','expired','refunded') default 'unpaid'
timestamps
```

#### `order_items`
```
id              PK
order_id        FK → orders.id
sparepart_id    FK → spareparts.id nullable
bundle_id       FK → product_bundles.id nullable
type            enum('sparepart','bundle')
nama_snapshot   string
qty             int
harga_snapshot  decimal(15,2)
subtotal        decimal(15,2)
```

#### `payments`
```
id                       PK
payable_type             string   -- 'App\Models\Invoice' atau 'App\Models\Order'
payable_id               int      -- polymorphic
midtrans_order_id        string nullable unique
midtrans_transaction_id  string nullable
midtrans_status          string nullable   -- pending, settlement, expire, deny
payment_method           string nullable   -- gopay, bca_va, qris, dll
amount                   decimal(15,2)
snap_token               string nullable
payment_url              string nullable
raw_response             json nullable
paid_at                  timestamp nullable
expired_at               timestamp nullable
timestamps
```

#### `shipments`
```
id                  PK
order_id            FK → orders.id
shipbite_order_id   string nullable
courier             string
service_type        string
tracking_number     string nullable
origin_address      json
destination_address json
weight              int   -- gram
shipping_cost       decimal(15,2)
insurance_cost      decimal(15,2) default 0
status              enum('pending','picked_up','in_transit','delivered','returned') default 'pending'
raw_response        json nullable
shipped_at          timestamp nullable
delivered_at        timestamp nullable
timestamps
```

---

### Grup 7 — RFM & K-Means

#### `cluster_definitions`
```
id                PK
label             string   -- 'Champion', 'Loyal', 'Potential', 'At Risk', 'Lost'
description       text nullable
color_hex         string   -- '#1D9E75'
icon              string nullable
action_suggestion text nullable
centroid          json nullable   -- {"r":4.2,"f":3.1,"m":4.8}
updated_at        timestamp
```

#### `customer_rfm`
```
id              PK
customer_id     FK → customers.id
source          enum('bengkel','online_shop','combined')
recency_days    int
frequency       int
monetary        decimal(15,2)
r_score         tinyint   -- 1-5
f_score         tinyint   -- 1-5
m_score         tinyint   -- 1-5
rfm_score       decimal(5,2)
cluster_id      int   -- FK → cluster_definitions.id
cluster_label   string
period_start    date
period_end      date
calculated_at   timestamp
UNIQUE(customer_id, source)
```

#### `rfm_history`
```
id              PK
customer_id     FK → customers.id
source          enum('bengkel','online_shop','combined')
year_month      string   -- '2025-04'
recency_days    int
frequency       int
monetary        decimal(15,2)
cluster_id      int
cluster_label   string
created_at      timestamp
```

---

## 6. MODUL & MENU — ADMIN PANEL

### Navigasi Sidebar

```
UTAMA
  Dashboard
  Kalender Booking

BENGKEL
  Customer
  Partner
  Invoice
  Work Order

INVENTORI
  Sparepart
  Kategori Sparepart
  Stock Movements
  Services
  Product Bundles

ONLINE SHOP
  Orders

ANALITIK
  Segmentasi RFM
  Laporan Keuangan*

PENGATURAN*
  Profil Bengkel
  Manajemen User
  Config Booking
  Config Segmen RFM

* hanya super_admin
```

---

### Dashboard `/admin`

**Widget yang ditampilkan:**
- Stat cards: pendapatan hari ini, pendapatan bulan ini, invoice pending, booking pending, order online baru, stok kritis
- Bar chart pendapatan 7 / 30 hari (toggle)
- Mini chart distribusi segmen RFM (5 cluster, berbeda warna)
- Tabel booking pending (5 teratas) — aksi konfirmasi/tolak langsung dari dashboard
- Tabel invoice belum lunas — badge jatuh tempo merah
- Alert banner daftar sparepart stok ≤ minimum_stock

---

### Customer `/admin/customers`

**List:**
- Kolom: nama, no HP, email, total kendaraan, total transaksi, segmen RFM badge warna, tanggal daftar
- Filter: segmen RFM, rentang tanggal daftar
- Search: nama, no HP, email
- Aksi baris: lihat detail, edit, hapus (jika tidak ada invoice)
- Export CSV per segmen (untuk WA blast)

**Detail `/admin/customers/{id}`:**
- Info profil + badge segmen RFM + skor R / F / M terkini
- Stat: total kunjungan, total spend, rata-rata spend per kunjungan, terakhir kunjungan
- Tab Kendaraan: list motor milik customer, link ke detail masing-masing
- Tab Invoice: riwayat semua invoice customer ini
- Tab Booking: riwayat semua booking customer ini
- Tab Order Online: riwayat order dari online shop
- Tab RFM History: tabel pergerakan segmen bulan ke bulan

---

### Partner `/admin/partners`

**List:**
- Kolom: nama bengkel, contact person, no HP, alamat, total kunjungan dyno, total transaksi
- Search: nama bengkel, contact person
- Aksi: buat baru, edit, lihat detail

**Detail `/admin/partners/{id}`:**
- Info lengkap partner
- Riwayat semua invoice tipe `partner` dari bengkel ini
- Total transaksi partner

---

### Kendaraan `/admin/vehicles/{id}`
*(diakses dari detail customer, bukan menu utama)*

**Header:** foto, merk, model, tahun, no polisi, no rangka, no mesin, warna, catatan

**Stat:** total kunjungan motor ini, jumlah modifikasi, total spend, terakhir servis

**Tab Spek Mesin Terkini:**
- Form editable per kategori — Cylinder Head, Cylinder Block, Crankshaft, Kopling, Fuel System, Pengapian, Kelistrikan, Transmisi
- Setiap kategori dalam card terpisah
- Tombol "Edit Spek Mesin" → form aktif → simpan → auto-create modification_log

**Tab History Modifikasi:**
- Timeline card per perubahan, urut dari terbaru
- Setiap card: tanggal, judul, deskripsi, parts used, foto (jika ada), link invoice terkait
- Tombol "Tambah Log Manual" (tanpa mengubah spek, untuk catatan tambahan)

**Tab Invoice:** semua invoice yang melibatkan kendaraan ini

---

### Invoice `/admin/invoices`

**List:**
- Kolom: no invoice, tanggal, nama customer / partner, tipe badge (walk_in / booking / partner / online), grand total, status pembayaran badge, admin pembuat
- Filter: tipe, status pembayaran, rentang tanggal, admin pembuat
- Summary total pendapatan sesuai filter aktif (di atas tabel)
- Search: no invoice, nama customer
- Bulk export PDF / CSV

**Buat Invoice `/admin/invoices/create`:**
- Pilih tipe → field yang muncul menyesuaikan:
  - `walk_in` / `booking`: customer + kendaraan
  - `partner`: partner saja (tanpa kendaraan)
- Customer searchable dropdown, bisa buat baru inline via modal
- Kendaraan filtered by customer yang dipilih
- Repeater invoice items:
  - Pilih tipe: service atau sparepart
  - Search by nama / SKU
  - Qty + harga otomatis terisi dari master data, bisa dioverride
  - Subtotal otomatis terhitung
  - Warning jika stok sparepart = 0 (bisa override dengan konfirmasi)
- Discount (nominal atau persen) + grand_total otomatis
- Metode pembayaran + amount_paid → payment_status otomatis (unpaid / partial / paid)
- Post-save: stok sparepart berkurang, stock_movements dibuat

**Aksi setelah simpan:**
- Tombol "Buat Work Order" → flow work order
- Tombol "Kirim ke WhatsApp" → generate link PDF invoice
- Tombol "Generate Link Midtrans" → flow payment Midtrans

**Detail Invoice `/admin/invoices/{id}`:**
- Header: no invoice, tanggal, tipe, customer/partner, kendaraan
- Tabel items: nama, qty, harga jual, subtotal (+ kolom HPP hanya terlihat admin)
- Summary: subtotal, discount, grand_total, amount_paid, sisa
- Riwayat pembayaran dari tabel `payments` (Midtrans atau manual)
- Link ke work order terkait (jika ada)
- Link ke booking asal (jika tipe booking)
- Aksi: tambah pembayaran partial, generate link Midtrans, cetak PDF, update spek mesin

---

### Booking `/admin/bookings`

**Kalender `/admin/bookings/calendar`:**
- Kalender bulanan — setiap hari menampilkan terisi/kapasitas
- Warna slot: hijau (tersedia) / kuning (hampir penuh) / merah (penuh) / abu (diblokir)
- Klik hari → panel samping kanan: daftar booking hari itu + aksi per item
- Tombol "Block Tanggal" → input alasan → tanggal disabled di kalender customer
- Tombol "+ Booking Manual" → form input booking dari WA

**List `/admin/bookings`:**
- Kolom: no booking, tanggal, nama pemesan, no HP, kendaraan, service yang diminta, sumber (website / manual), status badge
- Filter: status, tanggal, sumber
- Search: nama pemesan, no booking
- Aksi per baris:
  - Konfirmasi → notifikasi ke customer
  - Tolak → wajib isi alasan → notifikasi ke customer
  - Reschedule → pilih tanggal baru → cek slot
  - Buat Invoice & WO → form invoice pre-fill dari data booking

**Config Slot `/admin/booking-slots/config`** *(super_admin only):*
- Kapasitas slot per hari (default: 2)
- Hari operasional: toggle Senin–Minggu
- Maksimum advance booking (hari ke depan yang bisa dipilih customer)

---

### Work Order `/admin/work-orders`

**List:**
- Kolom: no WO, tanggal, customer, kendaraan, mekanik assigned, status badge (antrian / proses / selesai), durasi pengerjaan
- Filter: status, mekanik, rentang tanggal
- Search: no WO, nama customer
- Assign / reassign mekanik langsung dari list (tanpa masuk ke detail)

**Detail `/admin/work-orders/{id}`:**
- Info customer & kendaraan + keluhan customer
- Spek mesin terkini dari vehicle_engine_specs (read-only — untuk referensi admin)
- Catatan mekanik + daftar part referensi yang diinput mekanik
- Timeline status: antrian → proses → selesai (dengan timestamp mulai & selesai)
- Link ke invoice terkait
- Aksi: ubah mekanik assigned, tandai selesai (admin bisa override)

---

### Sparepart `/admin/spareparts`

**List:**
- Kolom: SKU, nama, brand, kategori, satuan, harga beli, harga jual, harga online, stok (merah jika ≤ minimum_stock), is_sold_online toggle
- Filter: kategori, stok kritis, aktif/nonaktif, dijual online
- Search: SKU, nama, brand
- Bulk action: aktifkan, nonaktifkan, toggle is_sold_online
- Tombol Restock per baris → modal input qty masuk + auto stock_movement
- Import CSV sparepart (dengan error report baris yang gagal)

**Form Buat/Edit Sparepart:**
- SKU (auto-generate atau manual), nama, brand, kategori, satuan
- Harga beli, harga jual, harga online (nullable)
- Stok awal, minimum stok (untuk alert)
- Berat (gram) + dimensi (p×l×t) — wajib diisi jika is_sold_online = true
- Upload gambar (multiple)
- Deskripsi (untuk halaman produk online shop)
- Toggle: is_active, is_sold_online

---

### Kategori Sparepart `/admin/sparepart-categories`

- Tree view hierarkis — parent → child (max 2 level disarankan)
- CRUD: nama, slug, upload icon/image, deskripsi
- Drag & drop reorder (implementasi via Livewire + SortableJS atau Alpine.js)

---

### Stock Movements `/admin/stock-movements`

**List (audit trail):**
- Kolom: tanggal, sparepart, tipe (in/out/adjustment) badge, qty, stok sebelum → sesudah, referensi (invoice/order/manual), user yang input
- Filter: tipe, sparepart, rentang tanggal, user

**Aksi:**
- Tombol "Adjustment Manual" → modal: pilih sparepart, qty (positif = tambah, negatif = kurang), catatan wajib diisi

---

### Services `/admin/services`

**List + Form:**
- Nama service, deskripsi, harga default, estimasi durasi (menit)
- Toggle: is_active, is_bookable (bisa dipilih customer saat booking online)

---

### Product Bundles `/admin/product-bundles`

**List + Form:**
- Nama, slug, deskripsi, harga bundle, upload gambar (multiple)
- Toggle: is_active, is_sold_online, is_bookable
- Repeater bundle items:
  - Pilih tipe: sparepart atau service
  - Search item
  - Qty + harga snapshot saat bundle dibuat
  - Preview total harga dari semua items

---

### Orders `/admin/orders`

**List:**
- Kolom: no order, tanggal, nama customer, total item, grand total, status pembayaran badge, status order badge, kurir + no resi
- Filter: status pembayaran, status order, rentang tanggal
- Search: no order, nama penerima

**Detail `/admin/orders/{id}`:**
- Info pemesan: nama, no HP, alamat kirim lengkap
- Item-item order + qty + harga snapshot + subtotal
- Riwayat pembayaran Midtrans (midtrans_status history)
- Section pengiriman:
  - Input berat aktual (gram)
  - Pilih kurir & layanan via Shipbite
  - Tombol "Buat Pengiriman" → call Shipbite API → dapat tracking_number
- Tracking no resi + status pengiriman terkini

**Aksi:**
- Proses order (konfirmasi packing) → orders.status → processing
- Buat pengiriman → Shipbite API → orders.status → shipped
- Kirim notif ke customer (no resi + link tracking)

---

### Segmentasi RFM `/admin/rfm`

- Tab sumber: Bengkel · Online Shop · Combined
- Stat cards: total customer aktif, jumlah per segmen, avg monetary
- Bar chart distribusi segmen (klik segmen → filter tabel otomatis)
- Scatter plot R vs M (bubble size = F)
- Tabel customer: nama, recency_days, frequency, monetary, cluster_label (bisa filter & sort)
- Timestamp "Terakhir dihitung: {calculated_at}"
- Tombol Recalculate (dispatch job ke queue)
- Export CSV per segmen

---

### Laporan Keuangan `/admin/reports` *(super_admin only)*

- Filter: rentang tanggal, tipe transaksi (bengkel / online shop / semua)
- Summary: total pendapatan, total HPP, gross margin, jumlah transaksi
- Chart tren pendapatan per bulan
- Tabel service terlaris (by revenue)
- Tabel sparepart terlaris (by qty terjual)
- Export PDF / Excel

---

### Pengaturan `/admin/settings` *(super_admin only)*

**Tab Profil Bengkel:**
- Nama bengkel, logo, tagline, alamat lengkap, no HP, email, jam operasional

**Tab Manajemen User:**
- List user internal: nama, email, role, status aktif, terakhir login
- **Buat akun baru** (role: admin atau mekanik) — isi nama, email, password sementara
- **Aktifkan / nonaktifkan akun** — user nonaktif tidak bisa login
- **Reset password** — generate password baru, kirim ke email user
- **Edit role** — ubah role antara admin dan mekanik
- Admin dan mekanik tidak bisa register sendiri — akun wajib dibuat super_admin

**Tab Config Booking:**
- Kapasitas slot per hari
- Maksimum advance booking (hari)
- Hari operasional (toggle Senin–Minggu)
- Jam buka & tutup bengkel (opsional, untuk info kalender)

**Tab Config Segmen RFM:**
- Edit label, deskripsi, warna hex, icon per cluster (dari cluster_definitions)
- Slider bobot R / F / M (validasi: total harus = 100%)
- Input jumlah K cluster (3–5, default 5)
- Simpan → efektif saat recalculate berikutnya

## 7. MODUL & MENU — MEKANIK PANEL

Route prefix `/mekanik`, layout Blade terpisah (`layouts/mekanik.blade.php`), guard `admin`, middleware `role:mekanik`.
Mekanik **hanya bisa akses work order yang diassign ke dirinya** — scope query `WHERE mekanik_id = auth('admin')->id()`.

### Navigasi Sidebar (Mekanik)

```
Dashboard
Work Order Saya
```

Tidak ada menu lain. Mekanik tidak bisa akses customer, invoice, sparepart, atau halaman lain.

---

### Dashboard `/mekanik`

- Stat: job hari ini, job antrian, job selesai bulan ini
- List work order hari ini langsung tampil (tanpa klik menu terpisah)
- Toggle is_available → mengubah users.is_available (online/offline)

---

### Work Order Saya `/mekanik/work-orders`

**List:**
- Hanya WO yang mekanik_id = user yang login
- Kolom: no WO, nama customer, kendaraan, service/keluhan singkat, status badge, tanggal
- Filter: status (antrian / proses / selesai)

**Detail `/mekanik/work-orders/{id}`:**

Info yang ditampilkan:
- Nama customer + no HP customer
- Detail kendaraan: merk, model, tahun, no polisi
- Keluhan customer (dari work_orders.keluhan_customer)
- Spek mesin terkini dari vehicle_engine_specs — **READ-ONLY**, tidak bisa diedit mekanik

Input yang bisa dilakukan mekanik:
- Catatan mekanik (textarea, auto-save tiap beberapa detik)
- Tambah referensi part yang dibutuhkan (search dari sparepart master data)
  - Ini hanya referensi catatan, stok BELUM berkurang
  - Admin yang finalisasi dan kurangi stok via invoice
- Checklist item pekerjaan (opsional)

Timer pengerjaan:
- Auto-start saat status berubah ke proses (mulai_at = NOW())
- Tampil durasi berjalan di UI

Update status:
- Tombol **"Mulai Kerjakan"** → status antrian → proses, mulai_at dicatat
- Tombol **"Tandai Selesai"** → status proses → selesai, selesai_at dicatat
  - Jika catatan kosong → konfirmasi dialog sebelum lanjut
  - Setelah selesai → notifikasi otomatis ke admin
  - Tombol status terkunci setelah WO selesai (tidak bisa diubah mekanik)

## 8. MODUL & MENU — WEBSITE PUBLIK (CUSTOMER)

Blade + Livewire 4 + Tailwind CSS, guard `web`.
Auth customer sepenuhnya terpisah dari internal panel — halaman login berbeda, session berbeda.

### Navigasi Website Publik

```
NAVBAR (semua halaman)
  Logo / Nama Bengkel
  Beranda
  Booking
  Toko
  Tentang Kami
  [Login / Nama User + dropdown]

DROPDOWN USER (jika sudah login)
  Dashboard
  Motor Saya
  Riwayat Booking
  Riwayat Order
  Profil
  Keluar
```

---

### Halaman Publik (tanpa login)

**Landing Page `/`**
- Hero section: nama bengkel, tagline, CTA "Booking Sekarang" + "Lihat Toko"
- Section layanan unggulan (dari services WHERE is_active = true, tampilkan 4–6 teratas)
- Section produk featured dari online shop (spareparts + bundles WHERE is_sold_online = true)
- Section info bengkel: fasilitas (dyno, modifikasi), jam operasional, alamat + Google Maps embed
- Floating tombol WhatsApp (link wa.me)

**Login `/login`**
- Form: email + password
- Link "Daftar akun baru"
- Link "Lupa password?"

**Register `/register`** *(hanya untuk customer — role otomatis `customer`)*
- Form: nama lengkap, no HP / WhatsApp, email, password, konfirmasi password

**Lupa Password `/forgot-password`**
- Input email → kirim link reset via email
- Halaman `/reset-password` untuk set password baru dari link

---

### Halaman Customer (perlu login)

**Dashboard `/dashboard`**
- Greeting: "Halo [Nama]!" + badge segmen RFM — *"Kamu adalah pelanggan Champion kami! 🏆"*
- Card booking aktif / upcoming (status, tanggal, kendaraan)
- Card order terbaru (status, no resi jika sudah dikirim)
- Quick action buttons: Booking Baru · Motor Saya · Ke Toko

**Motor Saya `/vehicles`**
- Grid / list card per kendaraan: foto, merk + model, tahun, no polisi, jumlah kunjungan bengkel
- Tombol "Tambah Motor Baru" → form tambah kendaraan

**Tambah Motor `/vehicles/create`**
- Form: merk, model, tipe (opsional), tahun, no polisi, warna (opsional), foto (opsional), catatan

**Detail Motor `/vehicles/{id}`**
- Info dasar kendaraan
- Tab "Spek Mesin Terkini":
  - Data dari vehicle_engine_specs — READ-ONLY untuk customer
  - Jika semua null → "Spek mesin belum dicatat. Akan diisi bengkel setelah servis pertama."
  - Tampil per kategori dalam card yang bersih dan mudah dibaca
- Tab "History Modifikasi":
  - Timeline card per entry dari vehicle_modification_logs, urut terbaru
  - Setiap card: tanggal, judul, deskripsi, foto (jika ada), parts yang digunakan
  - Jika kosong → "Belum ada riwayat modifikasi untuk motor ini."
- Tombol "Booking Servis untuk Motor Ini" → shortcut ke form booking dengan motor ini pre-selected

**Riwayat Booking `/bookings`**
- List semua booking milik customer yang login
- Kolom: no booking, tanggal, kendaraan, service, sumber, status badge
- Booking status `pending` bisa dibatalkan sendiri oleh customer
- Klik baris → lihat detail booking (read-only)

**Riwayat Order `/orders`**
- List semua order milik customer yang login
- Kolom: no order, tanggal, total item, grand total, status pembayaran badge, status order badge
- Klik baris → detail order:
  - Item-item yang dibeli + qty + harga
  - Alamat pengiriman
  - Status pengiriman + no resi + link tracking Shipbite

**Profil `/profile`**
- Edit: nama, no HP, email, alamat
- Ubah password (form terpisah: password lama + baru + konfirmasi)
- Info read-only: segmen RFM bengkel + segmen RFM online shop (badge)

---

### Booking Online `/booking`

**Step 1 — Pilih Kendaraan:**
- Jika sudah login + punya kendaraan: tampil list motor customer (radio select)
- Jika sudah login tapi belum punya motor: form tambah motor baru inline
- Jika guest (belum login): form nama pemesan + no HP (wajib) + info motor (tidak disimpan ke DB)

**Step 2 — Pilih Service & Jadwal:**
- List service / bundle WHERE is_bookable = true AND is_active = true (dengan harga estimasi)
- Customer bisa pilih lebih dari 1 service
- Kalender interaktif:
  - Hari available: booking_slots.terisi < kapasitas AND is_blocked = false → bisa diklik
  - Hari penuh: disabled, warna merah
  - Hari diblokir: disabled, warna abu
  - Hari sebelum hari ini: disabled
  - Lebih dari max advance days: disabled
- Textarea keluhan / kebutuhan (opsional)

**Step 3 — Konfirmasi:**
- Ringkasan: kendaraan, service yang dipilih, tanggal, keluhan, estimasi harga
- Disclaimer: "Harga final dikonfirmasi saat motor tiba di bengkel"
- Tombol "Kirim Booking" → bookings INSERT, booking_slots.terisi++

**Halaman Sukses `/booking/success`:**
- No. booking, tanggal, service yang dipesan
- "Admin akan mengkonfirmasi booking dalam 1×24 jam"
- "Kamu akan dihubungi via WhatsApp / email setelah dikonfirmasi"
- Tombol "Lihat Riwayat Booking"

---

### Online Shop

**Katalog `/shop`**
- Grid produk: spareparts + bundles WHERE is_sold_online = true AND is_active = true
- Filter sidebar: kategori (hierarkis), brand, rentang harga
- Search by nama / SKU
- Sort: terbaru, harga termurah, harga termahal, terlaris
- Badge "Stok Terbatas" jika stok ≤ minimum_stock + 5
- Badge "Habis" jika stok = 0 (tombol keranjang disabled)

**Detail Produk `/shop/{slug}`**
- Galeri foto (multiple image)
- Nama, brand, kategori, harga, stok tersedia, deskripsi
- Jika bundle: tampilkan daftar isi (sparepart + service yang termasuk)
- Selector qty + tombol "Tambah ke Keranjang"
- Jika belum login → klik keranjang → redirect ke /login dengan redirect_back

**Keranjang `/cart`**
- List item: foto, nama, harga satuan, qty (edit inline), subtotal
- Jika qty diubah > stok tersedia → di-cap ke stok max + warning
- Hapus item
- Total belanja (subtotal semua item)
- Tombol "Checkout" → redirect ke /checkout

**Checkout `/checkout`**
- Form alamat pengiriman: nama penerima, no HP penerima, alamat lengkap, provinsi, kota, kecamatan, kode pos
- Pilih kurir via Shipbite API (otomatis hitung berat total dari items)
  - Tampil opsi: kurir, layanan, estimasi hari, harga ongkir
  - Jika API timeout → error "Gagal mengambil opsi pengiriman, coba lagi"
- Summary: subtotal + ongkir yang dipilih = grand total
- Tombol "Bayar Sekarang"

**Pembayaran `/checkout/pay`**
- Midtrans Snap modal muncul otomatis
- Pilih metode: QRIS, VA bank (BCA, Mandiri, BNI, dll), GoPay, OVO, dll
- Setelah bayar → Midtrans redirect ke halaman sukses / gagal

**Order Sukses `/checkout/success`**
- Konfirmasi: no order, grand total, estimasi pengiriman
- "Admin akan memproses dan mengirim pesananmu segera"
- Tombol "Lihat Detail Order"

## 9. INTEGRASI EKSTERNAL

### Midtrans (Payment Gateway)

```
Flow Invoice:
Admin request snap token → Midtrans API → simpan ke payments → 
kirim link ke customer → customer bayar → Midtrans webhook →
update payments.midtrans_status → update invoices.payment_status

Flow Order:
Customer checkout → create order → generate snap token →
Midtrans Snap modal → bayar → webhook → update orders.payment_status →
stok berkurang otomatis
```

**Penting:**
- Server key & client key disimpan di `.env` — supaya tiap bengkel bisa punya Midtrans account sendiri
- Webhook endpoint: `POST /webhook/midtrans` — no auth, verifikasi via signature key
- Verifikasi: `hash(order_id + status_code + gross_amount + server_key) == signature_key`

### Shipbite (Shipping Aggregator)

```
Flow Checkout:
Customer input alamat → call Shipbite API (cek ongkir) →
tampilkan opsi kurir + harga → customer pilih → simpan ke order

Flow Fulfillment:
Admin proses order → call Shipbite API (create shipment) →
dapat tracking_number → simpan ke shipments →
webhook Shipbite update shipments.status secara otomatis
```

**Penting:**
- API key Shipbite disimpan di `.env`
- Berat produk (`spareparts.berat`) wajib diisi untuk kalkulasi ongkir
- Webhook endpoint: `POST /webhook/shipbite`

---

## 10. SISTEM RFM & K-MEANS

### Konteks untuk JHMPro
Bengkel modifikasi memiliki pola transaksi berbeda dari bengkel servis harian:
- Customer mungkin hanya datang 1–2x setahun, tapi dengan nilai transaksi besar (Rp 5–20jt)
- Frequency yang rendah tidak berarti customer tidak loyal
- **Bobot M (monetary) harus lebih tinggi dari F (frequency)** — default: R=0.3, F=0.3, M=0.4
- Bobot bisa dikonfigurasi via Pengaturan RFM di admin panel

### Sumber Data RFM

| Source | Data dari | Catatan |
|--------|-----------|---------|
| `bengkel` | Tabel `invoices` (tipe: walk_in, booking, partner) | Hanya invoice `payment_status = paid` |
| `online_shop` | Tabel `orders` | Hanya `payment_status = paid` |
| `combined` | Gabungan keduanya | Union customer dari kedua sumber |

### Scheduled Job (Daily 00:00)
```
  Untuk setiap source (bengkel, online_shop, combined):
    1. Ambil semua customer dengan transaksi dalam periode
    2. Hitung R = hari sejak transaksi terakhir
    3. Hitung F = jumlah transaksi total
    4. Hitung M = total nilai transaksi
    5. Scoring 1-5 via quintile/percentile
    6. rfm_score = (R*w_r) + (F*w_f) + (M*w_m)
    7. K-Means clustering (K dari config, default 5)
    8. UPSERT customer_rfm
    9. Jika bulan baru: INSERT ke rfm_history (append only)
    10. UPDATE cluster_definitions.centroid
```

### Implementasi K-Means
- **Awal:** `php-ml` library (cukup untuk ratusan customer)
- **Input vector:** [r_score, f_score, m_score] per customer
- **K default:** 5 (Champion, Loyal, Potential, At Risk, Lost)
- **Edge case:** jika customer < K, gunakan K = min(5, jumlah_customer)
- **Upgrade path:** Python microservice via HTTP endpoint jika dataset besar

### Label Cluster Default

| ID | Label | Karakteristik | Aksi yang Disarankan |
|----|-------|---------------|----------------------|
| 0 | Champion | R tinggi, F tinggi, M tinggi | Pertahankan, jadikan brand ambassador |
| 1 | Loyal | F & M tinggi, R sedang | Reward, upsell produk premium |
| 2 | Potential | R tinggi, F & M rendah | Nurture, dorong transaksi kedua |
| 3 | At Risk | R menurun, dulunya aktif | Promo reaktivasi via WA |
| 4 | Lost | R sangat lama, semua rendah | Win-back campaign atau biarkan |

---

## 11. POSITIVE & NEGATIVE CASES

Bagian ini mendeskripsikan skenario happy path dan edge case untuk setiap modul. Gunakan sebagai referensi saat menulis business logic dan validasi.

---

### 11.1 Customer & Kendaraan

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Admin buat customer baru (nama + no HP) | Customer tersimpan di DB |
| P2 | Admin tambah kendaraan untuk customer yang sudah ada | Kendaraan terhubung ke `customer_id` benar, `vehicle_engine_specs` dibuat otomatis via Observer (semua field null) |
| P3 | Admin update spek mesin (ganti noken as + piston) | `vehicle_engine_specs` diupdate, `vehicle_modification_logs` dibuat otomatis dengan `specs_snapshot` kondisi sebelum update |
| P4 | Admin search customer by no HP | Menampilkan customer yang no HP-nya cocok |
| P5 | Customer login lihat detail motor sendiri | Hanya tampil kendaraan milik `customer_id` yang login |
| P6 | Admin filter customer segmen "At Risk" | Menampilkan customer dengan `cluster_label = 'At Risk'` di `customer_rfm` |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Admin tambah kendaraan tanpa pilih customer | Validasi gagal: "Customer wajib dipilih" |
| N2 | Admin input no polisi yang sudah terdaftar | Validasi gagal: "No polisi sudah terdaftar" |
| N3 | Customer A akses motor Customer B via `/vehicles/999` | 404 — scope query by `customer_id` milik yang login |
| N4 | Admin input no polisi yang sudah terdaftar | Validasi gagal: "No polisi sudah terdaftar" |
| N5 | Admin hapus customer yang masih punya invoice belum lunas | Block/warning: "Customer memiliki invoice yang belum lunas" |

---

### 11.2 Invoice

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Admin buat invoice walk-in, tambah 2 service + 1 sparepart | Invoice + `invoice_items` tersimpan, stok sparepart berkurang, `stock_movements` type `out` tercatat |
| P2 | Admin input pembayaran tunai full grand_total | `payment_status → paid`, `amount_paid = grand_total` |
| P3 | Admin input pembayaran partial | `payment_status → partial`, sisa tampil di detail |
| P4 | Admin generate link Midtrans untuk invoice unpaid | Snap token dibuat, record `payments` dengan `midtrans_status = pending` |
| P5 | Webhook Midtrans `settlement` diterima | `payments.midtrans_status → settlement`, `invoices.payment_status → paid` |
| P6 | Invoice dibuat dari booking yang confirmed | `invoices.booking_id` terisi, `bookings.invoice_id` terisi, `bookings.status → completed` |
| P7 | Admin selesaikan invoice modifikasi → update spek mesin | `vehicle_engine_specs` diupdate, `vehicle_modification_logs` otomatis terbuat dengan `invoice_id` yang benar |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Admin simpan invoice tanpa item apapun | Validasi gagal: "Invoice harus memiliki minimal 1 item" |
| N2 | Admin tambah sparepart ke invoice, stok = 0 | Warning: "Stok [nama] tidak mencukupi" — bisa override dengan konfirmasi eksplisit |
| N3 | Webhook Midtrans dengan signature tidak valid | 403, tolak request, log error |
| N4 | Admin edit invoice yang sudah `paid` | Hanya field `catatan` yang bisa diedit; item dan harga terkunci |
| N5 | Admin input `amount_paid` melebihi `grand_total` | Validasi gagal: "Pembayaran tidak boleh melebihi total tagihan" |
| N6 | Admin hapus invoice yang sudah punya `stock_movements` | Soft delete / block — stok tidak di-rollback otomatis, tampilkan peringatan |

---

### 11.3 Booking

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Customer pilih tanggal yang masih ada slot → submit | `bookings` status `pending`, `booking_slots.terisi++`, admin dapat notifikasi |
| P2 | Admin konfirmasi booking | `status → confirmed`, `confirmed_at` terisi, notifikasi terkirim ke customer |
| P3 | Admin input booking manual dari WA | `source = manual`, boleh tanpa `customer_id` asal `nama_pemesan` + `no_hp_pemesan` diisi |
| P4 | Hari H, admin buat Invoice+WO dari booking | Invoice + WO terbuat, `bookings.invoice_id` terisi, `status → completed` |
| P5 | Admin block tanggal 1 Mei (libur) | `booking_slots.is_blocked = true`, tanggal tidak bisa dipilih customer |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Customer booking tanggal sudah penuh (`terisi = kapasitas`) | Error: "Slot tanggal ini sudah penuh, pilih tanggal lain" |
| N2 | Customer booking melebihi `booking_max_days_advance` | Tanggal disabled di kalender, tidak bisa dipilih |
| N3 | Customer booking di tanggal yang di-block | Tanggal tidak tersedia, tidak bisa dipilih |
| N4 | Admin tolak booking yang sudah `confirmed` | Wajib isi `cancel_reason`, `booking_slots.terisi--`, notif ke customer |
| N5 | Customer coba booking sebelum isi no HP di profil | Redirect ke /profile: "Lengkapi no HP sebelum booking" |
| N6 | Customer coba booking sebelum punya kendaraan terdaftar | Redirect ke /vehicles/create: "Tambahkan kendaraan terlebih dahulu" |
| N7 | Customer yang belum login coba akses /booking langsung | Redirect ke /login?redirect=/booking |
| N8 | Dua customer booking slot terakhir bersamaan (race condition) | DB transaction + lockForUpdate — satu berhasil, satunya error "Slot sudah penuh" |

---

### 11.4 Inventory & Stock

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Admin restock sparepart +50 pcs | `spareparts.stock += 50`, `stock_movements` type `in` tercatat |
| P2 | Invoice dengan 2 sparepart disimpan | Stok kedua sparepart berkurang sesuai qty, 2 record `stock_movements` type `out` |
| P3 | Order online paid, admin proses | `stock_movements` type `out` dengan `reference_type = order` |
| P4 | Admin adjustment manual (koreksi selisih fisik) | `stock_movements` type `adjustment`, catatan wajib diisi |
| P5 | Stok mencapai `minimum_stock` | Alert banner di dashboard admin, item muncul di daftar stok kritis |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Admin input restock dengan qty = 0 atau negatif | Validasi gagal: "Qty harus lebih dari 0" |
| N2 | Admin nonaktifkan sparepart yang masih ada stok > 0 | Konfirmasi warning: "Sparepart masih ada stok, yakin nonaktifkan?" |
| N3 | Admin hapus sparepart yang sudah dipakai di invoice | Block delete: "Sparepart sudah digunakan di invoice, tidak bisa dihapus" |
| N4 | Admin set `minimum_stock` negatif | Validasi gagal: "Minimum stok tidak boleh negatif" |
| N5 | Import CSV sparepart dengan SKU duplikat | Baris duplikat dilewati + tampilkan error report, baris valid tetap diimport |
| N6 | Admin aktifkan `is_sold_online = true` tapi berat masih null | Validasi gagal: "Berat wajib diisi jika produk dijual online" — tidak bisa disimpan |
| N7 | Admin buat shipment, ada item order dengan berat = null | Error sebelum call Shipbite API: "Berat produk [nama] belum diisi, tidak bisa kalkulasi ongkir" |
| N8 | Admin (bukan super_admin) coba akses `/admin/sparepart-categories` | 403 Forbidden — halaman hanya untuk super_admin |

---

### 11.5 Work Order (Mekanik)

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Mekanik login → hanya lihat WO milik sendiri | Query otomatis filter `mekanik_id = auth()->id()` |
| P2 | Mekanik klik "Mulai Kerjakan" | `status → proses`, `mulai_at` terisi timestamp sekarang |
| P3 | Mekanik tambah catatan + referensi part | `catatan_mekanik` tersimpan, part tersimpan sebagai referensi (stok belum berkurang) |
| P4 | Mekanik klik "Selesai" | `status → selesai`, `selesai_at` terisi, admin mendapat notifikasi |
| P5 | Mekanik lihat spek mesin untuk referensi | Data dari `vehicle_engine_specs` tampil dalam mode read-only |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Mekanik A akses WO Mekanik B via `/mekanik/work-orders/999` | 404 — scope by `mekanik_id` milik yang login |
| N2 | Mekanik akses URL menu invoice `/admin/invoices` | 403 Forbidden — route tidak ada di panel mekanik |
| N3 | Mekanik tandai "Selesai" tanpa isi catatan | Konfirmasi dialog: "Selesaikan tanpa catatan mekanik?" — boleh dilanjutkan |
| N4 | Mekanik coba ubah status WO yang sudah `selesai` | Tombol status terkunci, tidak bisa diubah oleh mekanik |

---

### 11.6 Online Shop

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Customer checkout 2 produk, pilih JNE REG | Ongkir dihitung via Shipbite API, `orders` dibuat dengan ongkir benar |
| P2 | Customer bayar via QRIS Midtrans | Snap terbuka, setelah scan webhook diterima, `orders.payment_status → paid` |
| P3 | Admin proses order → buat shipment | Shipbite API dipanggil, `shipments.tracking_number` terisi, `orders.status → shipped` |
| P4 | Customer tracking order | Status terkini dari `shipments.status` diupdate via Shipbite webhook |
| P5 | Order paid → stok berkurang | `stock_movements` type `out`, `reference_type = order` |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Customer checkout produk yang habis stok (race condition) | Validasi saat checkout: "Stok [nama] tidak mencukupi", order tidak dibuat |
| N2 | Payment Midtrans expired (tidak dibayar 24 jam) | Webhook `expire` diterima, `orders.payment_status → expired`, stok tidak dikurangi |
| N3 | Customer akses order milik customer lain | 404 — scope by `customer_id` milik yang login |
| N4 | Fitur `online_shop` nonaktif, customer akses `/shop` | 404 atau halaman "Toko belum tersedia" |
| N5 | Shipbite API timeout saat cek ongkir | Error: "Gagal mengambil opsi pengiriman, coba lagi" — order belum dibuat |
| N6 | Customer submit checkout tanpa pilih kurir | Validasi gagal: "Pilih metode pengiriman terlebih dahulu" |

---

### 11.7 RFM & K-Means

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Scheduled job RFM jalan malam ini | Semua `customer_rfm` diupdate, `rfm_history` di-append jika bulan baru |
| P2 | Admin klik "Recalculate" manual | Job dispatch ke queue, notifikasi "Sedang diproses" |
| P3 | Customer "At Risk" transaksi lagi | Setelah recalculate, R-score naik, kemungkinan naik cluster |
| P4 | Admin export CSV segmen "At Risk" | CSV berisi nama, no HP, email, R/F/M score, total spend |
| P5 | Customer 1x transaksi tapi Rp 15jt (nilai besar) | Karena bobot M lebih tinggi, customer masuk "Potential" bukan "Lost" |
| P6 | Admin ubah bobot M dari 0.4 ke 0.5 | Recalculate berikutnya menggunakan bobot baru |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Belum ada customer satupun → job RFM jalan | Selesai tanpa error, `customer_rfm` kosong, tidak crash |
| N2 | K=5 tapi customer hanya 3 | K = min(5, jumlah_customer) = 3, log warning, tidak crash |
| N3 | Job gagal (server issue) | Error tercatat di Laravel log, bisa trigger manual dari admin |
| N4 | Admin set bobot R+F+M bukan = 100% | Validasi gagal: "Total bobot harus = 100%" |
| N5 | Customer terdaftar tapi belum pernah transaksi | Tidak masuk kalkulasi RFM, tidak ada record di `customer_rfm` |

---

### 11.8 Auth & Akses

#### ✅ Positive Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| P1 | Admin login dengan kredensial benar | Redirect ke /admin/dashboard |
| P2 | Mekanik login → panel mekanik dengan menu terbatas | Hanya dashboard + work order yang tampil |
| P3 | Customer login di website publik | Redirect ke /dashboard customer |
| P4 | Session admin expire | Redirect ke /admin/login, setelah login balik ke URL terakhir |
| P5 | Super admin buat akun admin baru dari Pengaturan | Akun terbuat, role=admin, password sementara dikirim ke email |
| P6 | Super admin nonaktifkan akun mekanik | users.is_active = false, mekanik tidak bisa login, sesi aktif di-invalidate |
| P7 | Super admin aktifkan kembali akun yang nonaktif | users.is_active = true, user bisa login kembali |

#### ❌ Negative Cases
| # | Skenario | Expected Result |
|---|----------|-----------------|
| N1 | Admin coba login di `/login` (halaman customer) | Error: "Akun tidak ditemukan" — jangan bocorkan bahwa akun admin ada |
| N2 | Customer coba akses `/admin` | Redirect ke /admin/login, setelah input kredensial customer → middleware role-check gagal, redirect ke /admin/login dengan error |
| N3 | User is_active = false coba login | Error: "Akun tidak aktif, hubungi administrator" |
| N4 | Mekanik coba akses `/admin/invoices` langsung via URL | 403 Forbidden |
| N5 | Seseorang coba register di `/register` dengan menambahkan role=admin di request | Role tetap di-hardcode `customer` di controller — input role dari luar diabaikan |
| N6 | Admin (bukan super_admin) coba akses menu Manajemen User | Menu tidak tampil, akses URL langsung → 403 Forbidden |
| N7 | Super admin coba nonaktifkan akun dirinya sendiri | Block: "Tidak bisa menonaktifkan akun sendiri" |

---

## 12. USER FLOW

Bagian ini mendeskripsikan alur lengkap setiap role dari masuk aplikasi hingga menyelesaikan tugas utamanya. Format: narasi step-by-step + kondisi penting (IF/ELSE) di setiap percabangan.

---

### 12.1 Flow: Admin — Login & Dashboard

```
1. Admin buka /admin
   IF sudah login (guard: admin) → redirect ke /admin/dashboard
   IF belum login → redirect ke /admin/login

2. Admin input email + password → submit
   IF kredensial valid AND role IN ('admin', 'super_admin') AND is_active = true
     → redirect ke /admin/dashboard
   IF kredensial salah
     → error "Email atau password salah", tetap di halaman login
   IF is_active = false
     → error "Akun tidak aktif, hubungi administrator"

3. Dashboard tampil:
   → Stat cards dihitung dari DB
   → Alert stok kritis: query spareparts WHERE stock <= minimum_stock
   → Booking pending: query bookings WHERE status = 'pending'
   → Invoice unpaid: query invoices WHERE payment_status IN ('unpaid','partial')
   → Widget RFM hanya tampil IF feature rfm_analytics aktif
   → Menu navigasi tampil sesuai role:
       @if(auth('admin')->user()->role === 'super_admin')
           → menu Laporan Keuangan + Pengaturan tampil
       @endif
```

---

### 12.2 Flow: Admin — Buat Invoice Walk-in

```
1. Admin klik menu Invoice → List Invoice → tombol "Buat Invoice"

2. Form invoice terbuka
   → Admin pilih tipe: 'walk_in'
   → Field yang muncul: customer (searchable), kendaraan, tanggal, catatan

3. Admin cari customer
   IF customer sudah ada → pilih dari dropdown (search by nama/no HP)
   IF customer belum ada → klik "Tambah Customer Baru" (modal inline)
     → Isi nama, no HP, email (opsional) → simpan → otomatis terpilih

4. Admin pilih kendaraan
   → Dropdown filtered by customer yang terpilih
   IF customer belum punya kendaraan → klik "Tambah Kendaraan Baru" (modal inline)

5. Admin tambah item (repeater)
   → Pilih tipe: 'service' atau 'sparepart'
   IF tipe = 'service'
     → Search service by nama → harga_default otomatis terisi → admin bisa override harga
   IF tipe = 'sparepart'
     → Search sparepart by nama/SKU → stok tampil → harga_jual otomatis terisi
     → IF stok = 0 → warning "Stok habis" (bisa tetap lanjut dengan konfirmasi)
     → qty × harga = subtotal otomatis

6. Admin isi discount (opsional) → grand_total otomatis terhitung

7. Admin pilih metode pembayaran + input amount_paid
   IF amount_paid = 0 → payment_status = 'unpaid'
   IF amount_paid > 0 AND amount_paid < grand_total → payment_status = 'partial'
   IF amount_paid >= grand_total → payment_status = 'paid'

8. Admin klik "Simpan"
   → invoice_number di-generate: INV-{YEAR}-{NNNN}
   → Setiap invoice_item type 'sparepart':
       stock_movements INSERT (type: 'out', reference: invoice)
       spareparts.stock DECREMENT qty
   → Redirect ke halaman detail invoice

9. Di halaman detail invoice, admin bisa:
   → Klik "Buat Work Order" → flow work order (lihat 16.5)
   → Klik "Kirim ke WhatsApp" → generate link PDF, buka WA dengan pesan template
   → Klik "Generate Link Midtrans" → flow Midtrans (lihat 16.3)
   → Klik "Update Spek Mesin" → flow modification log (lihat 16.4)
```

---

### 12.3 Flow: Admin — Pembayaran via Midtrans (Invoice)

```
1. Admin buka detail invoice yang payment_status = 'unpaid' atau 'partial'
   → Klik "Generate Link Midtrans"

2. Sistem call Midtrans Snap API
   IF API berhasil
     → payments INSERT (payable_type: Invoice, payable_id: invoice_id,
        midtrans_order_id, snap_token, payment_url, status: 'pending')
     → Tampilkan tombol "Salin Link" + QR code (opsional)
   IF API gagal
     → Error: "Gagal terhubung ke Midtrans, coba lagi"

3. Admin kirim link ke customer (WhatsApp / salin manual)

4. Customer buka link → Midtrans Snap modal terbuka
   Customer pilih metode bayar → bayar

5. Midtrans kirim webhook ke POST /webhook/midtrans
   → Sistem verifikasi signature key
   IF signature tidak valid → 403, log error, stop
   IF signature valid:
     → Cari payments by midtrans_order_id
     → Update payments.midtrans_status sesuai transaction_status

     IF transaction_status = 'settlement' atau 'capture'
       → invoices.payment_status = 'paid'
       → invoices.amount_paid = grand_total
       → payments.paid_at = NOW()
     IF transaction_status = 'pending'
       → Tidak ada perubahan invoice, tunggu update berikutnya
     IF transaction_status IN ('expire', 'cancel', 'deny')
       → invoices.payment_status tetap 'unpaid'
       → payments.midtrans_status diupdate
```

---

### 12.3b Flow: Pendaftaran Kendaraan Baru

```
JALUR A — Admin input (saat customer datang ke bengkel):

1. Admin buka menu Customer → klik nama customer
2. Di detail customer → Tab Kendaraan → klik "Tambah Kendaraan"
3. Form: merk, model, tipe, tahun, no polisi, warna, foto, catatan
4. Simpan
   → vehicles INSERT (customer_id = customer yang sedang dibuka)
   → vehicle_engine_specs INSERT otomatis via Observer (semua null)
5. Admin bisa langsung buka detail kendaraan baru
   → Tab Spek Mesin masih kosong — akan diisi setelah servis (Jalur A/B di flow 12.4b)

JALUR B — Customer input sendiri via portal:

1. Customer login → buka /vehicles → klik "Tambah Motor Baru"
2. Form wajib diisi:
   → Merk, model, tahun, no polisi (wajib)
   → Warna, foto, catatan (opsional)
   → No rangka & no mesin (opsional tapi dianjurkan untuk motor modifikasi)
3. Submit
   → vehicles INSERT (customer_id = customer yang login)
   → vehicle_engine_specs INSERT otomatis via Observer (semua null)
4. Motor muncul di list kendaraan customer
   → Spek mesin kosong — admin isi setelah servis pertama
   → Customer bisa langsung gunakan motor ini untuk booking

SYARAT BISA BOOKING (cek saat customer buka /booking):
→ Harus sudah login (redirect ke /login jika belum)
→ Profil harus lengkap: nama + no_hp wajib terisi
   IF no_hp kosong → redirect ke /profile dengan pesan
   "Lengkapi no HP terlebih dahulu sebelum booking"
→ Harus punya minimal 1 kendaraan terdaftar
   IF belum ada kendaraan → redirect ke /vehicles/create dengan pesan
   "Tambahkan kendaraan terlebih dahulu sebelum booking"
→ Tidak ada jalur guest booking — semua booking harus terhubung
   ke akun customer dan kendaraan yang terdaftar

CATATAN:
→ Kedua jalur menghasilkan data yang sama di DB
→ Customer TIDAK BISA input engine specs — hanya bisa lihat (read-only)
→ Engine specs hanya bisa diedit oleh admin (lihat flow 12.4b)
→ Jika customer tambah kendaraan via portal sebelum datang ke bengkel,
   admin tinggal verifikasi data saat customer tiba (no rangka, no mesin dll)
```

---

### 12.4 Flow: Admin — Update Spek Mesin & Modification Log

```
1. Admin buka detail kendaraan (/admin/vehicles/{id})
   → Tab "Spek Mesin Terkini" tampil form vehicle_engine_specs terkini

2. Admin klik "Edit Spek Mesin"
   → Form editable per kategori (Cylinder Head, Cylinder Block, dst)

3. Admin ubah field yang berubah (misal: noken_as, piston)
   → Klik "Simpan Perubahan"

4. Sistem:
   → Ambil data vehicle_engine_specs SEBELUM update → simpan sebagai specs_snapshot (JSON)
   → UPDATE vehicle_engine_specs dengan data baru
   → INSERT vehicle_modification_logs:
       vehicle_id, invoice_id (jika dari konteks invoice, else null),
       user_id (admin yang login), judul (auto: "Update Spek - {tanggal}"),
       specs_snapshot (kondisi sebelum), parts_used (dari invoice_items jika ada)

5. Admin bisa juga klik "Tambah Log Manual" (tanpa update spek)
   → Modal: isi judul, deskripsi, upload foto (opsional)
   → INSERT vehicle_modification_logs tanpa update vehicle_engine_specs

6. Tab "History Modifikasi" menampilkan semua log urut dari terbaru:
   → Setiap card: tanggal, judul, deskripsi, parts used, foto, link invoice (jika ada)
```

---

### 12.4b Flow: Admin — Pengisian Engine Specs (3 Jalur)

Engine specs (`vehicle_engine_specs`) dibuat otomatis saat kendaraan didaftarkan via Observer,
tapi semua field null. Ada 3 jalur pengisian tergantung konteks.

```
KONDISI AWAL:
Kendaraan baru didaftarkan
→ vehicle_engine_specs INSERT otomatis (semua field null)
→ Di portal customer tampil: "Spek mesin belum dicatat.
   Akan diisi bengkel setelah servis pertama."

════════════════════════════════════════════════
JALUR A — Servis pertama, specs diisi setelah WO selesai
════════════════════════════════════════════════

1. Customer datang servis pertama kali
   → Admin buat invoice (tipe: walk_in atau booking)
   → Admin buat work order → assign ke mekanik

2. Mekanik bongkar mesin, catat kondisi motor
   → Mekanik input catatan mekanik di panel mekanik
     (referensi part, observasi kondisi mesin)
   → Mekanik klik "Tandai Selesai"

3. Admin mendapat notifikasi WO selesai
   → Admin buka detail invoice
   → Admin klik "Update Spek Mesin"
   → Form specs terbuka (semua field masih null)
   → Admin input specs berdasarkan catatan mekanik
   → Simpan

4. Sistem (dalam 1 DB transaction):
   → specs_snapshot = kondisi sebelum (semua null)
   → UPDATE vehicle_engine_specs dengan data baru
   → INSERT vehicle_modification_logs:
       judul: "Input Awal Spek Mesin"
       invoice_id: invoice yang bersangkutan
       specs_snapshot: null (kondisi awal)

════════════════════════════════════════════════
JALUR B — Motor sudah dimodif sebelumnya, admin input manual
════════════════════════════════════════════════

1. Customer datang dengan motor yang sudah punya modif dari tempat lain
   → Admin daftarkan kendaraan dari detail customer

2. Admin buka detail kendaraan → Tab "Spek Mesin Terkini"
   → Klik "Edit Spek Mesin"
   → Input kondisi mesin saat ini berdasarkan info customer/mekanik
   → Simpan

3. Sistem:
   → UPDATE vehicle_engine_specs
   → INSERT vehicle_modification_logs:
       judul: "Input Awal Spek Mesin"
       invoice_id: NULL (bukan dari transaksi)
       specs_snapshot: kondisi sebelum (null semua)

════════════════════════════════════════════════
JALUR C — Modifikasi lanjutan, update specs setelah WO
════════════════════════════════════════════════

1. Customer kembali untuk modifikasi lanjutan (specs sudah terisi sebelumnya)
   → Admin buat invoice → WO → assign mekanik

2. Mekanik kerjakan modifikasi
   → Mekanik input catatan: part yang diganti, observasi mesin
   → Mekanik klik "Tandai Selesai"

3. Admin buka detail invoice → klik "Update Spek Mesin"
   → Form terbuka dengan data specs TERKINI (bukan null)
   → Admin update HANYA field yang berubah
     (misal: noken_as, piston, cdi_ecu)
   → Simpan

4. Sistem (dalam 1 DB transaction):
   → specs_snapshot = seluruh kondisi specs SEBELUM diubah
   → UPDATE vehicle_engine_specs dengan data baru
   → INSERT vehicle_modification_logs:
       judul: "Update Spek - {tanggal}"
       invoice_id: invoice modifikasi ini
       specs_snapshot: kondisi sebelum perubahan
       parts_used: dari invoice_items type sparepart

CATATAN PENTING:
→ Mekanik TIDAK BISA edit specs langsung — hanya bisa input catatan
→ Admin yang finalisasi dan update specs ke DB
→ Setiap kali specs diubah dan disimpan → modification_log SELALU dibuat
→ DB::transaction() wajib: jika INSERT log gagal → ROLLBACK UPDATE specs
→ Di portal customer, history modif tampil dari vehicle_modification_logs
   urut dari terbaru, dengan detail parts_used dan link invoice
```

---

### 12.5 Flow: Admin — Manajemen Work Order

```
1. Work order bisa terbuat dari dua jalur:

   JALUR A — Dari invoice:
   → Admin di halaman detail invoice → klik "Buat Work Order"
   → Form: pilih mekanik (dropdown users role='mekanik' is_available=true),
     keluhan_customer (pre-fill dari booking jika ada)
   → INSERT work_orders (status: 'antrian', invoice_id, vehicle_id, mekanik_id)
   → Work order muncul di panel mekanik yang bersangkutan

   JALUR B — Dari booking:
   → Admin di list booking → klik "Buat Invoice & WO" pada booking confirmed
   → Sistem otomatis buat invoice (tipe: 'booking') + work order sekaligus
   → bookings.invoice_id terisi, bookings.status → 'completed'

2. Admin bisa assign/reassign mekanik dari list work order
   → Dropdown mekanik aktif (is_available = true)
   IF mekanik sedang handle WO lain → tampilkan info jumlah WO aktif mekanik tsb

3. Status update dari mekanik masuk real-time (Livewire 4)
   → Admin lihat perubahan status di list tanpa refresh

4. Saat WO status → 'selesai':
   → Admin mendapat notifikasi
   → Admin bisa langsung proses pembayaran dari detail invoice terkait
```

---

### 12.6 Flow: Admin — Konfirmasi Booking

```
1. Admin mendapat notifikasi booking baru (dashboard widget / notif panel)

2. Admin buka list booking / kalender → klik booking yang pending

3. Detail booking tampil:
   → Nama pemesan, no HP, kendaraan, service yang diminta,
     tanggal, keluhan, sumber (website/manual)

4. Admin memilih aksi:

   AKSI A — Konfirmasi:
   → bookings.status → 'confirmed'
   → bookings.confirmed_at = NOW()
   → booking_slots.terisi++ (jika belum dihitung saat booking dibuat)
   → Notifikasi terkirim ke customer (email / WA)

   AKSI B — Tolak:
   → Modal: wajib isi cancel_reason
   → bookings.status → 'cancelled'
   → bookings.cancelled_at = NOW()
   → bookings.cancel_reason terisi
   → booking_slots.terisi-- (kembalikan slot)
   → Notifikasi alasan penolakan terkirim ke customer

   AKSI C — Reschedule:
   → Admin pilih tanggal baru
   → Cek booking_slots tanggal baru: IF terisi < kapasitas → lanjut
   → booking_slots lama: terisi--
   → booking_slots baru: terisi++
   → bookings.tanggal_booking diupdate, status tetap 'confirmed'
   → Notifikasi perubahan jadwal ke customer

5. Hari H customer datang:
   → Admin buka booking yang confirmed → klik "Proses Hari Ini"
   → Redirect ke form buat invoice (pre-fill dari data booking)
   → Setelah invoice tersimpan → work order dibuat → booking.status → 'completed'
```

---

### 12.7 Flow: Admin — Proses Order Online Shop

```
1. Notifikasi order baru masuk (dashboard / menu Online Shop)
   → Order hanya muncul IF payment_status = 'paid' (webhook Midtrans sudah diterima)

2. Admin buka detail order:
   → Info pemesan, alamat kirim, item yang dibeli, bukti pembayaran Midtrans

3. Admin verifikasi stok setiap item
   IF stok mencukupi → lanjut proses
   IF stok tidak cukup (race condition lolos) → admin hubungi customer, batalkan/partial

4. Admin klik "Proses Order" → orders.status → 'processing'
   → Stok berkurang, stock_movements INSERT (type: 'out', reference: order)

5. Admin packing barang → klik "Buat Pengiriman"
   → Form: input berat aktual (gram), pilih kurir & layanan
   → Sistem call Shipbite API create shipment
   IF API berhasil
     → shipments INSERT (tracking_number, courier, status: 'pending')
     → orders.status → 'shipped'
     → Notifikasi ke customer: "Pesananmu sudah dikirim! No resi: {tracking_number}"
   IF API gagal
     → Error: "Gagal membuat pengiriman, coba lagi atau input manual"
     → Admin bisa input tracking_number manual

6. Shipbite kirim webhook update status pengiriman
   → shipments.status diupdate: picked_up → in_transit → delivered
   → Customer bisa tracking dari halaman /orders di website
```

---

### 12.8 Flow: Admin — Dashboard RFM & Segmentasi

```
1. Admin buka menu "Segmentasi RFM" (/admin/rfm)
   IF feature rfm_analytics nonaktif → redirect 403 atau halaman "Fitur tidak tersedia"

2. Halaman tampil dengan data dari customer_rfm (hasil kalkulasi terakhir)
   → Timestamp "Terakhir dihitung: {calculated_at}"
   → Tab: Bengkel · Online Shop · Combined

3. Admin klik tab "Bengkel"
   → Stat cards: total customer aktif, jumlah per segmen, avg monetary
   → Bar chart distribusi segmen
   → Scatter plot R vs M
   → Tabel customer dengan kolom: nama, recency_days, frequency, monetary, cluster_label

4. Admin klik segmen "At Risk" di bar chart
   → Tabel otomatis filter: hanya customer cluster_label = 'At Risk'

5. Admin klik "Export CSV"
   → Download file CSV berisi customer segmen yang aktif di filter
   → Bisa dipakai untuk campaign WhatsApp blast

6. Admin klik "Recalculate"
   → Dispatch job ke queue
   → Notifikasi: "Sedang diproses, halaman akan terupdate otomatis"
   IF job selesai → customer_rfm diupdate, halaman refresh data
   IF job error → notifikasi error, cek Laravel log

7. Admin buka Pengaturan → Config Segmen RFM (super_admin only)
   → Edit label, warna, icon per cluster
   → Slider bobot R/F/M (validasi: total harus = 100%)
   → Input jumlah K (3-5)
   → Simpan → efektif saat recalculate berikutnya
```

---

### 12.9 Flow: Mekanik — Menangani Work Order

```
1. Mekanik buka /mekanik
   IF belum login → redirect ke /admin/login (guard: admin)
   IF sudah login → dashboard mekanik

2. Dashboard menampilkan WO hari ini yang diassign ke mekanik login
   → Query: work_orders WHERE mekanik_id = auth()->id()
             AND DATE(created_at) = TODAY
             AND status != 'selesai'

3. Mekanik klik WO yang ingin dikerjakan → halaman detail WO

4. Mekanik baca info:
   → Nama customer, kendaraan, keluhan customer
   → Spek mesin terkini (vehicle_engine_specs) — READ-ONLY untuk referensi

5. Mekanik klik "Mulai Kerjakan"
   → work_orders.status → 'proses'
   → work_orders.mulai_at = NOW()
   → Timer mulai berjalan di UI

6. Selama pengerjaan, mekanik bisa:
   → Isi catatan mekanik (textarea, auto-save opsional)
   → Tambah referensi part dari inventory (searchable)
     CATATAN: ini hanya referensi, stok BELUM berkurang — admin yang finalisasi

7. Mekanik selesai → klik "Tandai Selesai"
   IF catatan kosong → konfirmasi dialog: "Selesaikan tanpa catatan?"
   → work_orders.status → 'selesai'
   → work_orders.selesai_at = NOW()
   → Admin mendapat notifikasi bahwa WO selesai

8. Mekanik tidak bisa:
   → Akses menu lain di luar work order
   → Lihat WO milik mekanik lain
   → Ubah status WO yang sudah 'selesai'
   → Edit data customer, kendaraan, invoice
```

---

### 12.10 Flow: Customer — Register & Login

```
1. Customer buka website publik (/)
   → Landing page bengkel tampil

2. Customer klik "Daftar" / "Login"

   JALUR REGISTER:
   → Form: nama, no HP, email, password, konfirmasi password
   → Role di-hardcode `customer` di controller — tidak bisa dimanipulasi dari luar
   → Validasi:
     IF email sudah terdaftar → "Email sudah digunakan"
     IF password < 8 karakter → "Password minimal 8 karakter"
     IF password != konfirmasi → "Password tidak cocok"
   → Jika valid: users INSERT (role: 'customer') → auto-login → redirect /dashboard
   → Dashboard tampil banner: "Lengkapi profil (no HP) dan tambahkan kendaraan
     agar bisa melakukan booking" — hilang setelah keduanya terpenuhi

   JALUR LOGIN:
   → Form: email + password
   IF valid AND role = 'customer' AND is_active = true → redirect /dashboard
   IF valid tapi role != 'customer' (misal admin coba login di sini)
     → Error: "Akun tidak ditemukan"  -- jangan bocorkan bahwa akun admin ada
   IF kredensial salah → "Email atau password salah"
   IF is_active = false → "Akun tidak aktif"
```

---

### 12.11 Flow: Customer — Tambah Kendaraan

```
1. Customer login → buka /vehicles → klik "Tambah Kendaraan"

2. Form: merk, model, tipe, tahun, no polisi, no rangka (opsional),
         no mesin (opsional), warna (opsional), foto (opsional), catatan

3. Submit
   IF no polisi sudah terdaftar untuk customer ini → validasi gagal
   ELSE → vehicles INSERT (customer_id dari customer yang login)
        → vehicle_engine_specs INSERT otomatis (semua field null)
        → Redirect ke halaman detail kendaraan baru

4. Customer lihat detail kendaraan:
   → Spek mesin kosong semua (null) — akan diisi bengkel setelah servis pertama
   → History modifikasi kosong
   → Tombol "Booking Servis untuk Motor Ini" → shortcut ke form booking
```

---

---

### 12.12 Flow: Customer — Booking Servis

```
1. Customer buka /booking

   PRE-CHECK (dilakukan sebelum form tampil):
   IF belum login
     → redirect ke /login?redirect=/booking
   IF no_hp belum diisi di profil
     → redirect ke /profile?required=phone
     → pesan: "Lengkapi no HP terlebih dahulu sebelum booking"
   IF belum punya kendaraan terdaftar
     → redirect ke /vehicles/create?redirect=/booking
     → pesan: "Tambahkan kendaraan terlebih dahulu sebelum booking"

   Tidak ada jalur guest booking — semua booking wajib terhubung
   ke akun customer dan kendaraan yang terdaftar di DB.

2. STEP 1 — Pilih Kendaraan:
   → Tampil list kendaraan milik customer yang login → pilih salah satu
   (pre-check sudah memastikan minimal 1 kendaraan ada)

3. STEP 2 — Pilih Service & Jadwal:
   → Tampil list services/bundles WHERE is_bookable = true AND is_active = true
   → Customer pilih satu atau lebih service
   → Kalender tampil:
     → Tersedia: booking_slots.terisi < kapasitas AND is_blocked = false
     → Penuh: disabled (merah)
     → Diblokir: disabled (abu)
     → Lebih dari max advance days: disabled
   → Customer pilih tanggal → isi keluhan/kebutuhan (textarea)

4. STEP 3 — Konfirmasi:
   → Ringkasan: kendaraan, service, tanggal, keluhan, estimasi harga
   → Disclaimer: "Harga final dikonfirmasi saat motor tiba di bengkel"
   → Customer klik "Kirim Booking"

5. Sistem:
   → bookings INSERT:
       status: 'pending', source: 'website'
       customer_id: auth()->id()      ← selalu terisi
       vehicle_id: kendaraan terpilih ← selalu terisi
       nama_pemesan: customer.nama    ← auto-fill dari profil
       no_hp_pemesan: customer.no_hp  ← auto-fill dari profil
   → booking_services INSERT per service dipilih
   → booking_slots.terisi++ (dalam DB transaction + lockForUpdate)
   → Redirect ke /booking/success

6. Halaman sukses:
   → No. booking, tanggal, service yang dipesan
   → "Admin akan mengkonfirmasi dalam 1x24 jam via WhatsApp/email"
   → Tombol "Lihat Riwayat Booking"

7. Admin konfirmasi/tolak → notifikasi ke customer (lihat flow 12.6)
```

---

### 12.13 Flow: Customer — Belanja Online Shop

```
1. Customer buka /shop
   IF feature online_shop nonaktif → halaman "Toko belum tersedia"

2. Customer browse katalog:
   → Filter kategori (sparepart_categories hierarkis)
   → Search by nama / SKU
   → Sort: harga termurah, terbaru, dll

3. Customer buka detail produk (/shop/{slug})
   → Foto, deskripsi, harga, stok, kategori
   IF produk adalah bundle → tampil daftar isi (sparepart + service)
   IF stok <= minimum_stock + 5 → badge "Stok Terbatas"
   IF stok = 0 → tombol "Tambah ke Keranjang" disabled

4. Customer klik "Tambah ke Keranjang"
   IF belum login → redirect /login (dengan redirect_back ke halaman produk)
   IF sudah login → item ditambahkan ke keranjang (session atau DB)

5. Customer buka /cart:
   → List item + qty + subtotal per item
   → Edit qty: IF qty > stok → warning, qty di-cap ke stok tersedia
   → Hapus item
   → Total belanja (subtotal semua item)
   → Klik "Checkout"

6. Halaman checkout (/checkout):
   → Form alamat: nama penerima, no HP, alamat lengkap, provinsi, kota, kecamatan, kode pos
   → Sistem call Shipbite API dengan berat total semua item
     IF API berhasil → tampil opsi kurir (JNE REG, JNE YES, J&T, SiCepat, dll) + harga
     IF API gagal → error "Gagal mengambil opsi pengiriman, coba lagi"
   → Customer pilih kurir → ongkir tampil di summary
   → Summary: subtotal + ongkir = grand_total
   → Klik "Bayar Sekarang"

7. Sistem:
   → orders INSERT (status: 'pending', payment_status: 'unpaid')
   → order_items INSERT per item (dengan nama_snapshot dan harga_snapshot)
   → Call Midtrans API → generate snap_token
   → payments INSERT (payable: order, status: 'pending')
   → Redirect ke /checkout/pay

8. Midtrans Snap modal terbuka → customer pilih metode → bayar
   → Webhook Midtrans masuk (flow 16.3 berlaku untuk order juga)
   IF settlement → orders.payment_status → 'paid', stok berkurang, notif ke admin
   IF expire → orders.payment_status → 'expired', stok tidak dikurangi

9. Customer lihat riwayat di /orders:
   → Status order: pending → processing → shipped → delivered
   → Klik detail → lihat item + tracking no resi
   → Klik no resi → status terkini dari Shipbite
```

---

### 12.14 Flow: Customer — Lihat Spek & History Motor

```
1. Customer login → buka /vehicles → klik salah satu kendaraan

2. Halaman detail kendaraan tampil:
   → Info dasar: merk, model, tahun, no polisi
   → Tab "Spek Mesin Terkini":
     → Data dari vehicle_engine_specs per kategori
     IF semua field null → pesan "Spek mesin belum dicatat oleh bengkel"
     IF ada data → tampil per kategori (Cylinder Head, Cylinder Block, dst)
     CATATAN: customer hanya bisa LIHAT, tidak bisa edit

   → Tab "History Modifikasi":
     → Timeline dari vehicle_modification_logs ORDER BY logged_at DESC
     → Setiap entry: tanggal, judul, deskripsi, foto (jika ada), parts yang digunakan
     IF belum ada log → pesan "Belum ada riwayat modifikasi"

3. Customer klik entry history:
   → Expand detail: specs_snapshot kondisi saat itu, deskripsi lengkap, foto
   → Link ke invoice terkait (jika invoice_id ada)
     IF invoice ada → tampil ringkasan invoice (no invoice, tanggal, total)
     CATATAN: customer hanya lihat summary, bukan detail HPP
```

---


### 12.17 Flow: Sistem — RFM Scheduled Job (Background)

```
Trigger: Laravel Scheduler, setiap hari pukul 00:00


   → Ambil config: k_clusters, weight_r, weight_f, weight_m dari tabel app settings / .env
   → Tentukan period_start (misal: 12 bulan lalu) dan period_end (hari ini)

3. Untuk setiap source ('bengkel', 'online_shop', 'combined'):

   HITUNG R, F, M per customer:
   → Sumber 'bengkel': FROM invoices WHERE payment_status='paid' AND tipe != 'online'
   → Sumber 'online_shop': FROM orders WHERE payment_status='paid'
   → Sumber 'combined': UNION keduanya per customer

   Untuk setiap customer:
   → R = DATEDIFF(TODAY, MAX(tanggal transaksi))
   → F = COUNT(transaksi dalam periode)
   → M = SUM(grand_total dalam periode)

4. Scoring R, F, M → 1-5 via quintile:
   → Urutkan semua customer by nilai R → bagi jadi 5 kuintil → assign skor
   → CATATAN R: skor 5 = recency terkecil (paling baru), 1 = terlama
   → Repeat untuk F dan M (skor 5 = nilai tertinggi)

5. Hitung rfm_score = (r_score × weight_r) + (f_score × weight_f) + (m_score × weight_m)

6. Jalankan K-Means clustering (php-ml):
   → Input: array [r_score, f_score, m_score] per customer
   → K = k_clusters dari config (default 5)
   → IF jumlah customer < K → K = jumlah customer (edge case)
   → Output: cluster_id per customer

7. Map cluster_id ke label (berdasarkan centroid posisi relatif):
   → Cluster dengan centroid R&F&M tertinggi → 'Champion'
   → Cluster dengan F&M tinggi, R sedang → 'Loyal'
   → dst (berdasarkan cluster_definitions)

8. UPSERT customer_rfm:
   → IF record (customer_id, source) sudah ada → UPDATE
   → IF belum ada → INSERT

9. Cek rfm_history:
   → IF belum ada record year_month = current month untuk customer ini
     → INSERT rfm_history (append only, tidak pernah diupdate)

10. UPDATE cluster_definitions.centroid dengan centroid hasil K-Means terbaru

11. Log hasil job: jumlah customer diproses, waktu eksekusi, error jika ada
    → Bisa dilihat di Laravel log
```

---

*File ini adalah referensi utama selama development JHMPro. Update setiap kali ada keputusan arsitektur atau perubahan requirement.*

*Stack: Laravel 13 + Livewire 4 + Alpine.js + Tailwind CSS + PHP 8.3+*

## 13. ROADMAP PENGEMBANGAN

### Fase 1 — Fondasi
- [ ] Setup Laravel 13 + Livewire 4 + Tailwind CSS (PHP 8.3)
- [ ] Config guard `admin` (untuk internal) + guard `web` (untuk customer)
- [ ] Halaman login `/admin/login` (Blade + Livewire) untuk internal user
- [ ] Middleware `CheckRole` untuk proteksi route per role
- [ ] Layout Blade: `layouts/admin.blade.php`, `layouts/mekanik.blade.php`, `layouts/app.blade.php` (public)
- [ ] Sidebar admin dengan navigasi kondisional per role (super_admin vs admin)
- [ ] Database migrations semua tabel (schema bagian 5)
- [ ] Seeder: users default (super_admin, admin, mekanik)
- [ ] Pastikan route /register hanya buat akun role `customer` (hardcode di controller)
- [ ] Halaman Manajemen User: hanya super_admin yang bisa create/edit/deactivate
- [ ] CRUD Customer + Partner + Kendaraan (Livewire components)
- [ ] Auto-create `vehicle_engine_specs` saat kendaraan dibuat (Observer)
- [ ] Form spek mesin granular per kategori di detail kendaraan

### Fase 2 — Operasional Bengkel
- [ ] CRUD Services & Sparepart (dengan kategori hierarkis)
- [ ] Invoice CRUD dengan repeater items + auto-numbering
- [ ] Stock movement otomatis saat invoice tersimpan (Observer/Event)
- [ ] Alert stok minimum di dashboard
- [ ] Work Order: buat, assign mekanik, update status
- [ ] Modification log: auto-create saat spek mesin diupdate
- [ ] Mekanik Panel: list WO, detail, update status, catatan
- [ ] Laporan keuangan dasar

### Fase 3 — Booking Online
- [ ] Booking slots: generate otomatis via Scheduled Command
- [ ] Halaman booking di website publik (Blade + Tailwind, 3 step)
- [ ] Kalender admin dengan panel detail samping
- [ ] Konfirmasi/tolak booking + notifikasi
- [ ] Integrasi booking → invoice + work order

### Fase 4 — Online Shop & Payment
- [ ] Product Bundles CRUD
- [ ] Katalog & detail produk di website publik
- [ ] Keranjang belanja
- [ ] Integrasi Midtrans Snap (invoice + order)
- [ ] Webhook handler Midtrans
- [ ] Integrasi Shipbite (ongkir + create shipment)
- [ ] Webhook handler Shipbite
- [ ] Halaman tracking order di akun customer

### Fase 5 — RFM & Analitik
- [ ] Scheduled Job RFM (daily 00:00)
- [ ] Implementasi K-Means (`php-ml`)
- [ ] Dashboard segmentasi di admin panel
- [ ] Badge segmen di profil customer
- [ ] Export CSV per segmen
- [ ] Config bobot & K di pengaturan

### Fase 6 — SaaS & Polish
- [ ] Feature flag middleware + NavigationItem conditional
- [ ] Onboarding flow bengkel baru

- [ ] Notifikasi WhatsApp (via Fonnte atau WA Cloud API)

---

## 14. CATATAN IMPLEMENTASI LARAVEL 13 + LIVEWIRE 4

### Hal Penting tentang Laravel 13
- **PHP minimal 8.3** — manfaatkan typed class constants dan improved type system
- **PHP Attributes** — opsional untuk Route, Schedule, dll sebagai alternatif sintaks lama
- **Bug fix global scope di nested query** — query lebih aman dan akurat
- **`PreventRequestForgery` middleware** — CSRF protection lebih kuat, sudah built-in
- **`Cache::touch()`** — perpanjang TTL cache tanpa re-fetch

### Hal Penting tentang Livewire 4 (Standalone, tanpa Filament)
- **`wire:model` default = lazy** — tidak merespons setiap keystroke, perlu `.live` untuk real-time
- **`wire:model.live`** — untuk field yang butuh reaktif (search, filter) 
- **Event bubble dari child** — gunakan `$dispatch` dan `$on` untuk komunikasi antar komponen
- **`#[Validate]` attribute** — validasi langsung di property, lebih ringkas dari `rules()`
- **`#[Computed]` attribute** — cached computed property, efisien untuk query berulang
- **Lazy loading component** — `<livewire:component lazy />` untuk heavy component
- **`wire:loading`** — built-in loading state, manfaatkan untuk UX (disable tombol saat submit)
- **Pagination** — gunakan `WithPagination` trait, kompatibel dengan Tailwind

### Guard Configuration (`config/auth.php`)
```php
'guards' => [
    'web' => [
        'driver'   => 'session',
        'provider' => 'users',
    ],
    'admin' => [
        'driver'   => 'session',
        'provider' => 'users',
    ],
],
```

> Guard `admin` dan `web` menggunakan provider `users` yang sama (tabel `users`),
> tapi sesi mereka sepenuhnya terpisah karena cookie name dan session name berbeda.

### Middleware CheckRole
```php
// app/Http/Middleware/CheckRole.php
public function handle(Request $request, Closure $next, string ...$roles): Response
{
    $user = auth('admin')->user() ?? auth('web')->user();

    if (! $user || ! in_array($user->role, $roles)) {
        abort(403);
    }

    return $next($request);
}

// Daftarkan di bootstrap/app.php (Laravel 11+):
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['role' => CheckRole::class]);
})
```

### Route Groups Per Panel
```php
// routes/web.php

// ── CUSTOMER ──────────────────────────────────────
Route::middleware('guest:web')->group(function () {
    Route::get('/login', [CustomerAuthController::class, 'loginForm']);
    Route::post('/login', [CustomerAuthController::class, 'login']);
    Route::get('/register', [CustomerAuthController::class, 'registerForm']);
    Route::post('/register', [CustomerAuthController::class, 'register']);
});

Route::middleware('auth:web')->group(function () {
    Route::get('/dashboard', CustomerDashboardController::class);
    Route::get('/vehicles', VehicleController::class . '@index');
    // ... dst
});

// ── ADMIN ──────────────────────────────────────────
Route::prefix('admin')->group(function () {
    // Login (guest untuk admin)
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'loginForm']);
        Route::post('/login', [AdminAuthController::class, 'login']);
    });

    // Area admin+super_admin
    Route::middleware(['auth:admin', 'role:super_admin,admin'])->group(function () {
        Route::get('/', fn() => redirect('/admin/dashboard'));
        Route::get('/dashboard', AdminDashboardController::class);
        Route::get('/customers', CustomerListController::class);
        // ... dst
    });

    // Area super_admin only
    Route::middleware(['auth:admin', 'role:super_admin'])->group(function () {
        Route::get('/reports', ReportsController::class);
        Route::get('/settings', SettingsController::class);
    });
});

// ── MEKANIK ────────────────────────────────────────
Route::prefix('mekanik')
    ->middleware(['auth:admin', 'role:mekanik'])
    ->group(function () {
        Route::get('/', fn() => redirect('/mekanik/dashboard'));
        Route::get('/dashboard', MekanikDashboardController::class);
        Route::get('/work-orders', WorkOrderMekanikController::class . '@index');
        Route::get('/work-orders/{id}', WorkOrderMekanikController::class . '@show');
    });
```

### Role-based Sidebar (Blade)
```blade
{{-- resources/views/layouts/admin.blade.php --}}
<nav>
    <a href="/admin/dashboard">Dashboard</a>
    <a href="/admin/customers">Customer</a>
    <a href="/admin/invoices">Invoice</a>
    <a href="/admin/work-orders">Work Order</a>
    <a href="/admin/spareparts">Sparepart</a>
    <a href="/admin/rfm">Segmentasi RFM</a>

    @if(auth('admin')->user()->role === 'super_admin')
        <a href="/admin/reports">Laporan Keuangan</a>
        <a href="/admin/settings">Pengaturan</a>
    @endif
</nav>
```

### Manajemen User Internal (tanpa Filament Resource)
```php
// app/Http/Controllers/Admin/UserManagementController.php

// Hanya super_admin bisa akses (dilindungi middleware 'role:super_admin')
public function store(Request $request): RedirectResponse
{
    $request->validate([
        'name'  => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'role'  => 'required|in:admin,mekanik',
    ]);

    User::create([
        'name'     => $request->name,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
        'role'     => $request->role,  // hanya 'admin' atau 'mekanik'
    ]);

    return redirect('/admin/settings')->with('success', 'Akun berhasil dibuat.');
}

// Nonaktifkan akun — invalidate semua sesi aktif
public function deactivate(User $user): RedirectResponse
{
    if ($user->id === auth('admin')->id()) {
        return back()->withErrors(['Tidak bisa menonaktifkan akun sendiri.']);
    }

    $user->update(['is_active' => false]);
    DB::table('sessions')->where('user_id', $user->id)->delete();

    return redirect('/admin/settings')->with('success', 'Akun dinonaktifkan.');
}
```

### Mekanik Scope — Controller / Livewire
```php
// Setiap query di area mekanik WAJIB difilter by mekanik yang login
// app/Http/Controllers/Mekanik/WorkOrderController.php

public function index(): View
{
    $workOrders = WorkOrder::where('mekanik_id', auth('admin')->id())
        ->with(['vehicle.customer', 'invoice'])
        ->latest()
        ->paginate(15);

    return view('mekanik.work-orders.index', compact('workOrders'));
}

public function show(WorkOrder $workOrder): View
{
    // Pastikan WO ini milik mekanik yang login
    abort_if($workOrder->mekanik_id !== auth('admin')->id(), 404);

    return view('mekanik.work-orders.show', compact('workOrder'));
}
```

---

### Register Customer — Hardcode Role
```php
// app/Http/Controllers/Auth/RegisteredUserController.php
// Jangan pernah ambil role dari request — selalu hardcode 'customer'
public function store(Request $request)
{
    $request->validate([...]);

    $user = User::create([
        'name'     => $request->name,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
        'role'     => 'customer',  // hardcode — tidak diambil dari $request
    ]);

    Auth::login($user);
    return redirect('/dashboard');
}
```

### Super Admin — Buat Akun Internal
```php
// Hanya bisa dilakukan dari halaman /admin/settings oleh super_admin
// Dilindungi middleware 'role:super_admin'
// Tidak ada route publik untuk buat akun admin/mekanik

// Saat nonaktifkan akun — invalidate semua sesi aktif user tersebut
public function deactivate(User $user): void
{
    if ($user->id === auth('admin')->id()) {
        throw new \Exception('Tidak bisa menonaktifkan akun sendiri.');
    }
    $user->update(['is_active' => false]);
    // Hapus semua session aktif user ini
    DB::table('sessions')->where('user_id', $user->id)->delete();
}
```

### Mekanik Scope di Panel Mekanik
```php
// Setiap query di Mekanik Panel harus difilter by mekanik yang login
// app/Http/Controllers/Mekanik/WorkOrderController.php
public function index(): View
{
    $workOrders = WorkOrder::where('mekanik_id', auth('admin')->id())
        ->latest()->paginate(15);
    return view('mekanik.work-orders.index', compact('workOrders'));
}

// Atau di Livewire component:
#[Computed]
public function workOrders(): LengthAwarePaginator
{
    return WorkOrder::where('mekanik_id', auth('admin')->id())
        ->with(['vehicle.customer'])
        ->paginate(15);
}
```

### Auto-create Engine Specs (Observer)
```php
// app/Observers/VehicleObserver.php
public function created(Vehicle $vehicle): void
{
    $vehicle->engineSpecs()->create([]);  // semua field null by default
}

// Daftarkan di AppServiceProvider:
Vehicle::observe(VehicleObserver::class);
```

### Invoice Number Generator
```php
// Format: INV-{YEAR}-{NNNN}
// Contoh: INV-2025-0001, INV-2025-0042
$last = Invoice::whereYear('created_at', now()->year)
    ->orderByDesc('id')
    ->value('invoice_number');

$next = $last
    ? str_pad((int) substr($last, -4) + 1, 4, '0', STR_PAD_LEFT)
    : '0001';

$invoiceNumber = 'INV-' . now()->year . '-' . $next;
```

### Stock Movement saat Invoice Disimpan
```php
// Observer/Event setelah invoice_items dibuat:
foreach ($invoice->items as $item) {
    if ($item->type === 'sparepart') {
        $sparepart = $item->sparepart;
        StockMovement::create([
            'sparepart_id'   => $item->sparepart_id,
            'user_id'        => auth()->id(),
            'type'           => 'out',
            'qty'            => $item->qty,
            'stock_before'   => $sparepart->stock,
            'stock_after'    => $sparepart->stock - $item->qty,
            'reference_type' => 'invoice',
            'reference_id'   => $invoice->id,
        ]);
        $sparepart->decrement('stock', $item->qty);
    }
}
```

### Update Spek Mesin (DB Transaction)
```php
// Wajib pakai transaction — jangan update specs tanpa log berhasil dibuat
DB::transaction(function () use ($vehicle, $newSpecs, $invoiceId) {
    $snapshot = $vehicle->engineSpecs->toArray();

    $vehicle->engineSpecs->update($newSpecs);

    VehicleModificationLog::create([
        'vehicle_id'     => $vehicle->id,
        'invoice_id'     => $invoiceId,  // null jika log manual
        'user_id'        => auth()->id(),
        'judul'          => 'Update Spek - ' . now()->format('d M Y'),
        'specs_snapshot' => $snapshot,
    ]);
});
```

### Midtrans Webhook Handler
```php
// routes/web.php — exclude CSRF
Route::post('/webhook/midtrans', [MidtransWebhookController::class, 'handle'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

// Verifikasi signature:
$hash = hash('sha512',
    $request->order_id .
    $request->status_code .
    $request->gross_amount .
    config('services.midtrans.server_key')
);
abort_if($hash !== $request->signature_key, 403);
```

### Booking Race Condition (Slot Penuh)
```php
// Pakai DB transaction + lockForUpdate saat increment terisi
DB::transaction(function () use ($slotId, $bookingData) {
    $slot = BookingSlot::where('id', $slotId)->lockForUpdate()->first();

    if ($slot->terisi >= $slot->kapasitas) {
        throw new \Exception('Slot sudah penuh.');
    }

    $slot->increment('terisi');
    Booking::create($bookingData);
});
```

### Booking Slot Generator (Scheduled Command)
```php
// app/Console/Commands/GenerateBookingSlots.php
Schedule::command('booking:generate-slots')->daily();

// Logic: generate booking_slots untuk N hari ke depan
// Gunakan upsert agar tidak duplikasi jika dijalankan berulang
BookingSlot::upsert(
    $slotsToGenerate,
    ['tanggal', 'mekanik_id'],  // unique keys
    ['kapasitas']               // update jika sudah ada
);
```

### RFM Scheduled Job
```php
// app/Console/Commands/CalculateRfm.php
Schedule::command('rfm:calculate')->dailyAt('00:00');

// Logic per source (bengkel, online_shop, combined):
// 1. Hitung R, F, M per customer dari invoices/orders paid
// 2. Quintile scoring 1-5
// 3. rfm_score = (r × weight_r) + (f × weight_f) + (m × weight_m)
// 4. K-Means clustering dengan php-ml
//    - Input: [r_score, f_score, m_score]
//    - K = config (default 5), edge case: K = min(5, jumlah_customer)
// 5. UPSERT customer_rfm (unique: customer_id + source)
// 6. Append rfm_history jika year_month belum ada
// 7. UPDATE cluster_definitions.centroid
```

### Livewire Table Component (pengganti Filament Table)
```php
// app/Livewire/Admin/CustomerTable.php
class CustomerTable extends Component
{
    use WithPagination;

    public string $search = '';
    public string $filterSegmen = '';

    #[Computed]
    public function customers(): LengthAwarePaginator
    {
        return Customer::query()
            ->with('latestRfm')
            ->when($this->search, fn($q) => $q->where(function ($q) {
                $q->where('nama', 'like', "%{$this->search}%")
                  ->orWhere('no_hp', 'like', "%{$this->search}%");
            }))
            ->when($this->filterSegmen, fn($q) => $q->whereHas('latestRfm', fn($q) =>
                $q->where('cluster_label', $this->filterSegmen)
            ))
            ->paginate(20);
    }

    public function render(): View
    {
        return view('livewire.admin.customer-table');
    }
}
```


*File ini adalah referensi utama selama development JHMPro. Update setiap kali ada keputusan arsitektur atau perubahan requirement.*

*Stack: Laravel 13 + Livewire 4 + Alpine.js + Tailwind CSS + PHP 8.3+*
---

## 15. DESIGN SYSTEM & UI SPECIFICATION

> Dokumentasi ini diekstrak dari design reference JHMPro (6 screen: Login, Register, Dashboard, Pelanggan, Kendaraan, Invoice).
> Semua implementasi Blade + Tailwind harus mengacu ke section ini agar konsisten di seluruh panel.

---

### 15.1 Color Palette

```
PRIMARY
  Red (brand)         : #DC2626   → tombol utama, active nav, link, no. invoice, no. polisi
  Red hover           : #B91C1C   → hover state tombol merah
  Red light (bg)      : #FEF2F2   → background badge "Belum Lunas", subtle highlight

SIDEBAR
  Background          : #111827   → sidebar bg (near-black, dark navy)
  Active item bg      : #DC2626   → nav item aktif
  Active item text    : #FFFFFF
  Inactive item text  : #9CA3AF   → nav item tidak aktif
  Section label       : #6B7280   → label "MENU", "INVENTORY" (uppercase, small)

LAYOUT
  Page bg             : #F3F4F6   → background area konten utama
  Card bg             : #FFFFFF   → semua card / panel konten
  Border              : #E5E7EB   → border tabel, card, input

TYPOGRAPHY
  Text primary        : #111827   → heading, label kolom tabel, nilai
  Text secondary      : #6B7280   → subtitle, placeholder, info kecil
  Text muted          : #9CA3AF   → nilai kosong ("-"), timestamp sekunder

STATUS COLORS
  Lunas / Selesai     : #16A34A   → green dot + teks
  Sebagian / Menunggu : #F59E0B   → amber dot + teks
  Belum Lunas         : #DC2626   → red dot + teks
  Dikerjakan          : #3B82F6   → blue dot + teks
  Dibatalkan          : #EF4444   → red muda dot + teks
  Tipe Booking        : #6366F1   → indigo dot
  Tipe Walk In        : #16A34A   → green dot
  Tipe Partner        : #3B82F6   → blue dot
  Tipe Online         : #DC2626   → red dot

TOPBAR
  Background          : #FFFFFF
  Border bottom       : #E5E7EB
```

---

### 15.2 Typography

```
Font family   : Inter (atau "Inter, ui-sans-serif, system-ui")
Font scale:
  Page title  : text-2xl (24px), font-bold,      color #111827
  Section head: text-base (16px), font-semibold, color #111827
  Nav items   : text-sm (14px),  font-medium
  Body/tabel  : text-sm (14px),  font-normal
  Kolom header: text-xs (12px),  font-semibold, uppercase, tracking-wider, color #6B7280
  Small/muted : text-xs (12px),  color #9CA3AF
  Badge text  : text-xs (12px),  font-medium
```

---

### 15.3 Layout Structure — Admin Panel

```
┌────────────────────────────────────────────────────────────────┐
│  TOPBAR (h-16, bg-white, border-b, fixed top, z-30)           │
│  [☰] [Breadcrumb > Page Title]    [Search ⌘K] [🌙][🔔][👤]   │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                 │
│  SIDEBAR     │  CONTENT AREA                                   │
│  w-52 fixed  │  bg-[#F3F4F6], pt-16, p-6                      │
│  bg-[#111827]│                                                 │
│              │  ┌─ Content Card (bg-white, rounded-xl) ──┐    │
│              │  │  [Header + actions]                     │    │
│              │  │  [Table / Form / Chart]                 │    │
│              │  │  [Pagination]                           │    │
│              │  └─────────────────────────────────────────┘    │
└──────────────┴─────────────────────────────────────────────────┘

Sidebar width   : w-52 (208px), fixed
Content offset  : ml-52 (sidebar buka) / ml-0 (collapsed via hamburger toggle)
Topbar height   : h-16 (64px)
Card style      : bg-white rounded-xl shadow-sm p-6
```

---

### 15.4 Sidebar — Urutan Navigasi (Sesuai Design)

```
MENU
  Dashboard             → /admin/dashboard
  Pelanggan             → /admin/customers
  Kendaraan             → /admin/vehicles       ← menu utama, bukan hanya dari detail customer
  Invoice               → /admin/invoices
  Booking               → /admin/bookings
  Servis                → /admin/services
  Work Order            → /admin/work-orders
  Partner               → /admin/partners
  Paket Produk          → /admin/product-bundles
  Pengguna              → /admin/users          ← menu sendiri (bukan sub-Pengaturan)

INVENTORY
  Sparepart             → /admin/spareparts
  Kategori Sparepart    → /admin/sparepart-categories
  Pergerakan Stok       → /admin/stock-movements

HANYA super_admin (kondisional, muncul di bawah atau via Pengaturan):
  Orders                → /admin/orders
  Segmentasi RFM        → /admin/rfm
  Laporan Keuangan      → /admin/reports
  Pengaturan            → /admin/settings

AKSES VIA USER DROPDOWN (bukan sidebar):
  Buka Kasir POS        → /admin/pos        (admin + super_admin)
  Pengaturan            → /admin/settings   (tampil di dropdown untuk semua internal user)
  Keluar                → logout
```

> **Catatan perbedaan design vs plan awal:**
> - Design: "Pengguna" = menu sidebar sendiri → plan menyesuaikan (bukan sub-Pengaturan)
> - Design: "Kendaraan" = menu utama → plan menyesuaikan (ada route `/admin/vehicles` terpisah)
> - Design: "Servis" bukan "Services" — gunakan label Bahasa Indonesia di UI

**Blade sidebar nav item (aktif vs nonaktif):**
```blade
{{-- Aktif --}}
<a href="/admin/dashboard"
   class="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">
  <x-heroicon-o-home class="w-4 h-4" />
  Dashboard
</a>

{{-- Nonaktif --}}
<a href="/admin/customers"
   class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white text-sm">
  <x-heroicon-o-users class="w-4 h-4" />
  Pelanggan
</a>

{{-- Section label --}}
<p class="px-2 mt-4 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
  Inventory
</p>
```

---

### 15.5 Topbar Search — Global Search

```
Placeholder : "Cari booking, sparepart, pelanggan..."
Shortcut    : ⌘K (Mac) / Ctrl+K (Windows) — tampil sebagai badge di kanan input
Scope       : booking (no. booking, nama pemesan),
              sparepart (nama, SKU),
              pelanggan (nama, no HP)
Implementasi: Alpine.js modal overlay + Livewire search
```

---

### 15.6 Auth Pages — Login & Register

```
Layout      : Split card, kiri gelap + kanan putih
Kiri        : bg-[#111827], logo + tagline "Dari keluhan pertama, hingga nota terakhir."
              + 3 bullet: "Work order & booking servis", "Invoice & kasir terintegrasi",
                          "Stok sparepart real-time"
Kanan       : bg-white, form

Login fields:
  Email       → fokus: ring-red-500, border-red-500
  Password    → + toggle visibility (eye icon, kanan dalam input)
  Ingat saya  → checkbox kiri | Lupa password? → link merah, kanan
  Tombol      → "Masuk", full-width, bg-red-600 hover:bg-red-700, rounded-lg, py-3, font-semibold
  Footer      → "Belum punya akun? Daftar di sini" — link merah

Register fields:
  Nama lengkap, Nomor HP, Email, Password, Konfirmasi password
  Tombol: "Daftar Sekarang" — same style

Input base style:
  border border-gray-300 rounded-lg px-3 py-2.5 text-sm w-full
  focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none
```

---

### 15.7 Tabel Data — Pola Standar

```
Card header:
  [Title bold]  [Subtitle text-gray-500]     [🔍 Search...]  [Filter ▼]  [+ Tambah X]

Kolom header:
  text-xs font-semibold uppercase tracking-wider text-gray-500
  border-b border-gray-200 py-3

Row:
  border-b border-gray-100 py-4 text-sm
  hover:bg-gray-50 transition

Aksi per baris (ikon-only, float kanan):
  👁 view   → text-gray-400 hover:text-gray-700
  ✏️ edit   → text-gray-400 hover:text-blue-600
  🗑 hapus  → text-gray-400 hover:text-red-600

Footer tabel:
  "Menampilkan X–Y dari Z"  (text-sm text-gray-500)
  Pagination: [Sebelumnya] [1] [2] [3] [Selanjutnya]
    Aktif   : bg-red-600 text-white rounded
    Nonaktif: text-gray-700 hover:bg-gray-100 rounded border

Tombol "+ Tambah X":
  bg-red-600 hover:bg-red-700 text-white text-sm font-medium
  px-4 py-2 rounded-lg flex items-center gap-1.5

Tombol "Filter ▼":
  border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg
  hover:bg-gray-50 flex items-center gap-1.5
```

---

### 15.8 Avatar Inisial

```
Shape       : w-8 h-8 rounded-full (circle)
Content     : 2 huruf kapital inisial (FN + LN)
Color logic : generate konsisten dari nama via hash

Palet warna avatar (pilih via: hash(nama) % jumlah_warna):
  bg-red-100    text-red-700
  bg-blue-100   text-blue-700
  bg-green-100  text-green-700
  bg-purple-100 text-purple-700
  bg-orange-100 text-orange-700
  bg-pink-100   text-pink-700
  bg-teal-100   text-teal-700
  bg-amber-100  text-amber-700
```

---

### 15.9 Badge Komponen

**Status pembayaran (dot + teks):**
```blade
{{-- Lunas --}}  <span class="flex items-center gap-1.5 text-xs font-medium text-green-700"><span class="w-2 h-2 rounded-full bg-green-500"></span>Lunas</span>
{{-- Sebagian --}} <span class="... text-amber-700"><span class="... bg-amber-500"></span>Sebagian</span>
{{-- Belum Lunas --}} <span class="... text-red-700"><span class="... bg-red-600"></span>Belum Lunas</span>
```

**Tipe invoice (dot + teks):**
```
Booking  → indigo  : #6366F1
Walk In  → green   : #16A34A
Partner  → blue    : #3B82F6
Online   → red     : #DC2626
```

**No. Polisi (teks merah bold):**
```blade
<span class="text-red-600 font-semibold text-sm tracking-wide">D 1234 AAA</span>
```

**No. Invoice / No. Booking (link merah):**
```blade
<a href="/admin/invoices/{{ $invoice->id }}"
   class="text-red-600 font-semibold hover:underline text-sm">
  {{ $invoice->invoice_number }}
</a>
```

---

### 15.10 Stat Card (Dashboard)

```
4 card grid (grid-cols-4 gap-4):
  Pendapatan Bulan Ini  → icon uang,     sparkline merah,  +/- % hijau/merah
  Total Booking         → icon kalender, sparkline biru
  Work Order Selesai    → icon kunci,    sparkline hijau
  Pelanggan Baru        → icon user+,    sparkline ungu

Card style:
  bg-white rounded-xl shadow-sm p-5
  Icon container: w-10 h-10 rounded-lg bg-{color}-50 flex items-center justify-center
  Value: text-2xl font-bold text-gray-900
  Label: text-sm text-gray-500
  Delta: text-xs font-medium text-green-600 (positif) / text-red-600 (negatif)
  Sparkline: h-12, minimal (area chart SVG atau Chart.js)
```

---

### 15.11 Screen Inventory

| Screen | Route | Status Design |
|--------|-------|:---:|
| Login (customer) | `/login` | ✅ |
| Register (customer) | `/register` | ✅ |
| Login (admin) | `/admin/login` | ✅ (same layout) |
| Dashboard admin | `/admin/dashboard` | ✅ |
| List Pelanggan | `/admin/customers` | ✅ |
| List Kendaraan | `/admin/vehicles` | ✅ |
| List Invoice | `/admin/invoices` | ✅ |
| Detail Pelanggan | `/admin/customers/{id}` | ⬜ belum ada |
| Detail Kendaraan | `/admin/vehicles/{id}` | ⬜ belum ada |
| Buat / Edit Invoice | `/admin/invoices/create` | ⬜ belum ada |
| Detail Invoice | `/admin/invoices/{id}` | ⬜ belum ada |
| List Booking | `/admin/bookings` | ⬜ belum ada |
| Kalender Booking | `/admin/bookings/calendar` | ⬜ belum ada |
| List Work Order | `/admin/work-orders` | ⬜ belum ada |
| Detail Work Order | `/admin/work-orders/{id}` | ⬜ belum ada |
| List Sparepart | `/admin/spareparts` | ⬜ belum ada |
| Segmentasi RFM | `/admin/rfm` | ⬜ belum ada |
| Pengaturan | `/admin/settings` | ⬜ belum ada |
| Manajemen User | `/admin/users` | ⬜ belum ada |
| Panel Mekanik | `/mekanik/*` | ⬜ belum ada |
| Website Publik | `/`, `/booking`, `/shop` | ⬜ belum ada |

> Screen yang belum ada designnya → ikuti pola yang sudah established dari screen yang ada:
> same sidebar, same topbar, same card+table pattern, same color palette.

---

### 15.12 Kolom Tabel Per Screen (Batch 2)

#### Booking `/admin/bookings`
```
Subtitle    : "Semua jadwal servis masuk"
Button      : "+ Booking Baru"
Kolom       : NO. BOOKING | PELANGGAN | NO. HP | KENDARAAN | LAYANAN | JADWAL | MEKANIK | SUMBER | STATUS | [aksi]

NO. BOOKING  → red link, format "BK-YYYY-NNNN" (e.g. BK-2026-0342)
PELANGGAN    → avatar initials + nama
KENDARAAN    → ikon motor (heroicon/custom svg) + "Honda Vario 160"
JADWAL       → dua baris: "30 Mei 2026" (atas) + "09:00 WIB" (bawah, text-gray-400 text-xs)
MEKANIK      → nama singkat (e.g. "Rizky M.")
SUMBER badge:
  Website   → blue dot   (#3B82F6)
  WhatsApp  → green dot  (#16A34A)
  Walk In   → gray dot   (#9CA3AF)
STATUS badge:
  Menunggu    → amber dot  (#F59E0B)
  Dikonfirmasi→ teal dot   (#0D9488)
  Dikerjakan  → blue dot   (#3B82F6)
  Selesai     → green dot  (#16A34A)
  Dibatalkan  → red dot    (#DC2626)
```

> **⚠ Catatan skema — SUMBER:** Design memisahkan `WhatsApp` sebagai sumber tersendiri.
> Plan awal: `source enum('website','manual')` → perlu update menjadi `enum('website','whatsapp','walk_in')`.

> **⚠ Catatan skema — STATUS Booking:** Design menambahkan status `Dikerjakan` (saat WO sudah dibuat dan dikerjakan).
> Plan awal: `enum('pending','confirmed','cancelled','completed')` → perlu update menjadi
> `enum('pending','confirmed','in_progress','completed','cancelled')`.
> Label tampilan UI: pending→Menunggu, confirmed→Dikonfirmasi, in_progress→Dikerjakan, completed→Selesai, cancelled→Dibatalkan.

---

#### Servis `/admin/services`
```
Subtitle    : "Daftar jenis layanan bengkel"
Button      : "+ Tambah Servis"
Kolom       : ID | NAMA SERVIS | DESKRIPSI | HARGA DEFAULT | DURASI | AKTIF | BISA BOOKING | [aksi]

ID           → angka sekuensial biasa (1, 2, 3...), bukan link
NAMA SERVIS  → bold, tidak ada link
DESKRIPSI    → text truncated dengan "..." (max ~40 char tampil)
HARGA DEFAULT→ "Rp 50.000" (format Rupiah titik ribuan)
DURASI       → "30 mnt", "60 mnt", "90 mnt" (satuan menit, disingkat)
AKTIF badge  → green dot "Aktif" / red dot "Nonaktif"
BISA BOOKING → green dot "Ya" / gray dot "Tidak"
```

---

#### Work Order `/admin/work-orders`
```
Subtitle    : "Daftar pekerjaan mekanik"
Button      : "+ Buat Work Order"
Kolom       : WO# | INVOICE | KENDARAAN | MEKANIK | KELUHAN | MULAI | SELESAI | STATUS | [aksi]

WO#          → red link, format "WO-NNNN" (e.g. WO-0001) — sequential, TANPA tahun
INVOICE      → text abu "INV-2026-0051" (bukan link, hanya referensi)
KENDARAAN    → ikon motor + "Honda Beat - D 1234 AAA" (brand + model + no polisi)
MEKANIK      → nama lengkap (e.g. "Rizky Maulana")
KELUHAN      → teks singkat (e.g. "Mesin terasa kasar saat gas")
MULAI        → "2 Jun 2026 09:00" atau "-" (jika belum mulai)
SELESAI      → "2 Jun 2026 10:30" atau "-" (jika belum selesai)
STATUS badge:
  Antrian  → amber dot  (#F59E0B)
  Proses   → blue dot   (#3B82F6)
  Selesai  → green dot  (#16A34A)
```

> **⚠ Catatan skema — WO Number:** Design pakai format `WO-NNNN` (sequential tanpa tahun),
> berbeda dari invoice `INV-YYYY-NNNN`. Perlu kolom `wo_number` di tabel `work_orders` dengan
> auto-generate sequential (reset per tahun atau global — pilih global agar konsisten dengan design).

---

#### Partner `/admin/partners`
```
Subtitle    : "Daftar bengkel mitra"
Button      : "+ Tambah Partner"
Kolom       : ID | NAMA BENGKEL | CONTACT PERSON | NO. HP | ALAMAT | CATATAN | [aksi]

ID           → angka biasa
NAMA BENGKEL → ikon dokumen/bangunan (gray square icon) + nama bold, BUKAN link merah
CATATAN      → teks muted (jika ada) atau "-"
```

---

#### Paket Produk `/admin/product-bundles`
```
Subtitle    : "Paket layanan & produk untuk dijual"
Button      : "+ Tambah Paket"
Kolom       : NAMA PAKET | SLUG | DESKRIPSI | HARGA | AKTIF | ONLINE | BISA BOOKING | [aksi]

NAMA PAKET   → bold, tidak ada link
SLUG         → gray muted monospace-like (e.g. "paket-servis-rutin")
DESKRIPSI    → truncated "..."
HARGA        → "Rp 150.000"
AKTIF        → green "Aktif" / red "Nonaktif"
ONLINE       → green "Ya" / gray "Tidak"
BISA BOOKING → green "Ya" / gray "Tidak"
Tidak ada kolom ID terpisah
```

---

#### Pengguna `/admin/users`
```
Subtitle    : "Daftar staf & admin sistem"
Button      : "+ Tambah Pengguna"
Kolom       : NAMA | EMAIL | ROLE | STATUS | [aksi]

NAMA         → avatar initials + nama bold
EMAIL        → plain text (e.g. "admin@jhmpro.id")
ROLE badge (dot + teks, warna berbeda per role):
  Super Admin → red dot    (#DC2626)
  Admin       → amber dot  (#F59E0B)
  Mekanik     → blue dot   (#3B82F6)
STATUS badge:
  Aktif    → green dot  (#16A34A)
  Nonaktif → red dot    (#DC2626)
```

---

#### Sparepart `/admin/spareparts`
```
Subtitle    : "Kelola stok & harga sparepart"
Button      : "+ Tambah Sparepart"
Kolom       : SKU | NAMA ITEM | KATEGORI | MEREK | STOK | HARGA JUAL | HARGA BELI | HARGA ONLINE | AKTIF | ONLINE | [aksi]

SKU          → gray muted text (e.g. "OIL-MPX2-08"), monospace-like
NAMA ITEM    → ikon tag/diamond abu + nama bold
STOK         → angka dengan warna:
                 0           → text-red-600   (habis)
                 1 s/d 5     → text-orange-500 (menipis — atau threshold dari minimum_stock)
                 6+          → text-green-600  (aman)
HARGA JUAL   → "Rp 48.000"
HARGA BELI   → "Rp 33.000"
HARGA ONLINE → "Rp 52.000" (atau "-" jika tidak dijual online)
AKTIF        → green "Aktif" / red "Nonaktif"  [dot badge]
ONLINE       → green "Ya" / gray "Tidak"  [dot badge]
```

> **Stok coloring rule (dari design):** Bukan hanya 0=merah.
> `stok = 0` → red; `stok > 0 AND stok <= minimum_stock` → orange; `stok > minimum_stock` → green.
> Implementasi Blade: `@if($s->stock === 0) text-red-600 @elseif($s->stock <= $s->minimum_stock) text-orange-500 @else text-green-600 @endif`

---

#### Kategori Sparepart `/admin/sparepart-categories`
```
Subtitle    : "Kelola kategori & sub-kategori produk"
Button      : "+ Tambah Kategori"
Kolom       : ID | NAMA KATEGORI | SLUG | PARENT | DESKRIPSI | [aksi]

ID           → angka biasa
NAMA KATEGORI→ ikon tag abu + nama bold
SLUG         → gray muted (e.g. "oli-cairan")
PARENT       → nama parent category atau "-" (jika root)
DESKRIPSI    → teks deskripsi singkat
```

---

#### Pergerakan Stok `/admin/stock-movements`
```
Subtitle    : "Riwayat masuk, keluar & koreksi stok"
Button      : "+ Tambah Entri"
Kolom       : TANGGAL | SPAREPART | OLEH | TIPE | QTY | SEBELUM | SESUDAH | CATATAN | [aksi]

TANGGAL      → "01 Jun 2026" (format d M Y)
SPAREPART    → nama sparepart (bold)
OLEH         → nama user yang melakukan (e.g. "Admin Servis", "Rizky Maulana")
TIPE badge:
  In         → green dot   (#16A34A)  "In"
  Out        → red dot     (#DC2626)  "Out"
  Adjustment → amber dot   (#F59E0B)  "Adjustment"
QTY          → angka dengan warna + prefix:
  In         → green  "+24", "+10"  (prefix +)
  Out        → red    "2", "1"      (angka saja, tanpa prefix, bukan -N)
  Adjustment → amber  "-1"          (prefix - jika kurang)
SEBELUM      → angka stok sebelum
SESUDAH      → angka stok sesudah
CATATAN      → text muted; bisa berisi referensi WO ("WO INV-2026-0051") atau keterangan manual
```

---

### 15.13 Komponen & Pattern Baru (dari Batch 2)

#### Ikon Kendaraan Inline
```blade
{{-- Digunakan di: Booking list, Work Order list, Kendaraan list --}}
<span class="flex items-center gap-1.5 text-sm text-gray-700">
  <x-heroicon-o-wrench-screwdriver class="w-4 h-4 text-gray-400 flex-shrink-0" />
  {{-- atau ikon motor custom --}}
  Honda Vario 160
</span>

{{-- Di Work Order: brand + model + no polisi --}}
Honda Beat - D 1234 AAA
```

#### Jadwal Dua Baris (Booking)
```blade
<div class="flex flex-col">
  <span class="text-sm text-gray-700">30 Mei 2026</span>
  <span class="text-xs text-gray-400">09:00 WIB</span>
</div>
```

#### Stok Coloring (Sparepart)
```blade
@php
  $stockClass = match(true) {
    $sparepart->stock === 0                              => 'text-red-600 font-semibold',
    $sparepart->stock <= $sparepart->minimum_stock       => 'text-orange-500 font-semibold',
    default                                              => 'text-green-600 font-semibold',
  };
@endphp
<span class="{{ $stockClass }}">{{ $sparepart->stock }}</span>
```

#### QTY Pergerakan Stok
```blade
@php
  $qty = $movement->qty;
  [$label, $class] = match($movement->type) {
    'in'         => ["+{$qty}", 'text-green-600 font-semibold'],
    'out'        => [(string)$qty, 'text-red-600 font-semibold'],
    'adjustment' => [($qty >= 0 ? "+{$qty}" : (string)$qty), 'text-amber-600 font-semibold'],
  };
@endphp
<span class="{{ $class }}">{{ $label }}</span>
```

#### Ikon Placeholder (Partner & Kategori)
```blade
{{-- Digunakan di: Partner list, Kategori Sparepart list, Sparepart list --}}
<div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
  <x-heroicon-o-tag class="w-4 h-4 text-gray-400" />  {{-- kategori/sparepart --}}
  <x-heroicon-o-building-storefront class="w-4 h-4 text-gray-400" />  {{-- partner --}}
</div>
```

---

### 15.14 Update Screen Inventory

Screen yang sudah confirmed dari design (total 16 list screens):

| Screen | Route | Batch |
|--------|-------|:---:|
| Login | `/login` & `/admin/login` | 1 ✅ |
| Register | `/register` | 1 ✅ |
| Dashboard | `/admin/dashboard` | 1 ✅ |
| Pelanggan | `/admin/customers` | 1 ✅ |
| Kendaraan | `/admin/vehicles` | 1 ✅ |
| Invoice | `/admin/invoices` | 1 ✅ |
| Booking | `/admin/bookings` | 2 ✅ |
| Servis | `/admin/services` | 2 ✅ |
| Work Order | `/admin/work-orders` | 2 ✅ |
| Partner | `/admin/partners` | 2 ✅ |
| Paket Produk | `/admin/product-bundles` | 2 ✅ |
| Pengguna | `/admin/users` | 2 ✅ |
| Sparepart | `/admin/spareparts` | 2 ✅ |
| Kategori Sparepart | `/admin/sparepart-categories` | 2 ✅ |
| Pergerakan Stok | `/admin/stock-movements` | 2 ✅ |

Belum ada design reference:

| Screen | Route |
|--------|-------|
| Detail Pelanggan | `/admin/customers/{id}` |
| Detail Kendaraan | `/admin/vehicles/{id}` |
| Buat/Edit Invoice | `/admin/invoices/create` |
| Detail Invoice | `/admin/invoices/{id}` |
| Kalender Booking | `/admin/bookings/calendar` |
| Detail Work Order | `/admin/work-orders/{id}` |
| Segmentasi RFM | `/admin/rfm` |
| Pengaturan | `/admin/settings` |
| Panel Mekanik | `/mekanik/*` |
| Website Publik | `/`, `/booking`, `/shop` |

---

### 15.15 Perubahan Skema yang Diperlukan (dari Design)

Berdasarkan temuan di design batch 2, ada beberapa penyesuaian schema dari plan awal:

**1. `bookings.source` — tambah 'whatsapp'**
```sql
-- Sebelum (plan awal):
source enum('website','manual')

-- Sesudah (sesuai design):
source enum('website','whatsapp','walk_in')
-- 'website'  : booking dari halaman publik
-- 'whatsapp' : admin input manual sumber WA
-- 'walk_in'  : admin input manual walk-in langsung
```

**2. `bookings.status` — tambah 'in_progress'**
```sql
-- Sebelum (plan awal):
status enum('pending','confirmed','cancelled','completed')

-- Sesudah (sesuai design):
status enum('pending','confirmed','in_progress','completed','cancelled')

-- Label UI:
-- pending      → Menunggu    (amber)
-- confirmed    → Dikonfirmasi (teal)
-- in_progress  → Dikerjakan  (blue)  ← otomatis saat WO dibuat dari booking
-- completed    → Selesai     (green)
-- cancelled    → Dibatalkan  (red)
```

**3. `work_orders` — tambah kolom `wo_number`**
```sql
-- Format: WO-NNNN (sequential global, tanpa tahun)
-- Contoh: WO-0001, WO-0002, WO-0099, WO-0342
wo_number string unique  -- tambahkan ke schema work_orders
```

Generator:
```php
$last = WorkOrder::orderByDesc('id')->value('wo_number');
$next = $last
    ? str_pad((int) substr($last, 3) + 1, 4, '0', STR_PAD_LEFT)
    : '0001';
$woNumber = 'WO-' . $next;
```

---

## 16. HANDOFF KE CLAUDE CODE — DATABASE SAFETY PROTOCOL

> **WAJIB DIBACA SEBELUM MULAI IMPLEMENTASI**
> Plan ini akan dieksekusi oleh Claude Code. Database JHMPro sudah berjalan dengan beberapa data awal.
> Jangan langsung buat migration atau ubah schema tanpa menjalankan scan di bawah ini terlebih dahulu.

---

### 16.1 LANGKAH PERTAMA — Scan Database

Jalankan query berikut untuk mengetahui kondisi DB saat ini sebelum menyentuh apapun:

```sql
-- 1. Cek semua tabel yang sudah ada
SHOW TABLES;

-- 2. Cek jumlah baris per tabel (untuk tahu tabel mana yang sudah ada data)
SELECT
  table_name,
  table_rows AS estimated_rows
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY table_name;

-- 3. Cek struktur tabel yang sudah ada (jalankan per tabel)
-- Contoh untuk tabel yang kritis:
SHOW CREATE TABLE users;
SHOW CREATE TABLE customers;
SHOW CREATE TABLE vehicles;
SHOW CREATE TABLE invoices;
SHOW CREATE TABLE invoice_items;
SHOW CREATE TABLE bookings;
SHOW CREATE TABLE work_orders;
SHOW CREATE TABLE spareparts;

-- 4. Cek existing migrations yang sudah dijalankan
SELECT migration FROM migrations ORDER BY batch, migration;

-- 5. Cek enum values yang sudah ada (untuk tabel yang punya data)
-- Ganti 'bookings' dan 'source' sesuai tabel yang ditemukan
SELECT COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'bookings'
  AND COLUMN_NAME = 'source';
```

---

### 16.2 Klasifikasi Perubahan — Aman vs Berisiko

Setelah scan, kategorikan setiap perubahan schema yang diperlukan:

#### ✅ AMAN — Tidak berisiko walau ada data
```
- Buat tabel BARU yang belum ada                   → tidak menyentuh data lama
- Tambah kolom BARU dengan ->nullable()             → baris lama otomatis NULL
- Tambah kolom BARU dengan ->default(value)         → baris lama dapat nilai default
- Tambah nilai baru ke ENUM (tidak hapus yang lama) → data lama tetap valid
- Tambah index atau foreign key (jika data konsisten)
```

#### ⚠️ BERISIKO — Perlu cek data dulu
```
- Ubah/hapus nilai ENUM yang mungkin sudah dipakai di data → bisa corrupt
- Hapus kolom yang ada datanya                             → data hilang permanen
- Ubah tipe kolom (misal string → int)                     → konversi bisa gagal
- Tambah kolom NOT NULL tanpa default di tabel berisi data → migration error
- Rename kolom atau tabel                                  → query lama broken
```

---

### 16.3 Tiga Perubahan Kritis dari Design (Section 15.15)

Ini perubahan yang ditemukan dari design reference. Tangani dengan hati-hati:

---

**Perubahan 1: `bookings.source` — tambah 'whatsapp' dan 'walk_in'**

```sql
-- CEK DULU: apakah tabel bookings ada dan ada data dengan nilai 'manual'?
SELECT source, COUNT(*) as jumlah
FROM bookings
GROUP BY source;
```

```
SKENARIO A — Tabel bookings belum ada atau kosong:
  → Buat/definisikan langsung dengan enum baru
  → enum('website','whatsapp','walk_in')

SKENARIO B — Ada data dengan source = 'website' saja:
  → Aman, ALTER TABLE langsung tambah nilai baru ke enum

SKENARIO C — Ada data dengan source = 'manual':
  → Harus UPDATE dulu sebelum ALTER:
     UPDATE bookings SET source = 'walk_in' WHERE source = 'manual';
     -- atau 'whatsapp' jika konteksnya memang dari WA
  → Setelah data bersih, baru ALTER enum
```

Migration yang aman:
```php
public function up(): void
{
    // Step 1: migrate data lama jika ada
    DB::statement("UPDATE bookings SET source = 'walk_in' WHERE source = 'manual'");

    // Step 2: alter enum
    DB::statement("ALTER TABLE bookings MODIFY COLUMN source
        ENUM('website','whatsapp','walk_in') NOT NULL DEFAULT 'website'");
}

public function down(): void
{
    DB::statement("UPDATE bookings SET source = 'walk_in' WHERE source IN ('whatsapp','walk_in')");
    DB::statement("ALTER TABLE bookings MODIFY COLUMN source
        ENUM('website','manual') NOT NULL DEFAULT 'website'");
}
```

---

**Perubahan 2: `bookings.status` — tambah 'in_progress'**

```sql
-- CEK DULU: nilai status apa saja yang sudah ada?
SELECT status, COUNT(*) FROM bookings GROUP BY status;
```

```
Menambah nilai ke enum = SELALU AMAN jika tidak menghapus nilai lama.
Nilai lama (pending/confirmed/cancelled/completed) tetap valid.
```

Migration:
```php
DB::statement("ALTER TABLE bookings MODIFY COLUMN status
    ENUM('pending','confirmed','in_progress','completed','cancelled')
    NOT NULL DEFAULT 'pending'");
```

---

**Perubahan 3: `work_orders.wo_number` — kolom baru**

```sql
-- CEK DULU: apakah work_orders sudah ada dan ada data?
SELECT COUNT(*) FROM work_orders;
-- Cek apakah kolom wo_number sudah ada:
SHOW COLUMNS FROM work_orders LIKE 'wo_number';
```

```
SKENARIO A — Tabel work_orders kosong atau belum ada:
  → Tambah kolom langsung, boleh NOT NULL

SKENARIO B — Ada data tanpa wo_number:
  → Tambah sebagai nullable dulu, generate nilai untuk baris lama, lalu set NOT NULL
```

Migration:
```php
public function up(): void
{
    Schema::table('work_orders', function (Blueprint $table) {
        $table->string('wo_number')->nullable()->unique()->after('id');
    });

    // Generate wo_number untuk data lama yang sudah ada
    $workOrders = DB::table('work_orders')->orderBy('id')->get();
    foreach ($workOrders as $i => $wo) {
        $number = 'WO-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);
        DB::table('work_orders')->where('id', $wo->id)->update(['wo_number' => $number]);
    }

    // Setelah semua terisi, jadikan NOT NULL
    Schema::table('work_orders', function (Blueprint $table) {
        $table->string('wo_number')->nullable(false)->change();
    });
}
```

---

### 16.4 Aturan Umum untuk Claude Code

```
1. SCAN DULU, BARU MIGRATE
   Jalankan query di 16.1 sebelum membuat atau menjalankan migration apapun.

2. SATU MIGRATION PER PERUBAHAN KRITIS
   Jangan gabungkan banyak perubahan berisiko dalam satu migration file.
   Jika satu gagal, rollback lebih mudah.

3. SELALU BUAT MIGRATION, BUKAN RAW ALTER
   Jangan jalankan ALTER TABLE manual di terminal.
   Semua perubahan schema harus via file migration agar terlacak.

4. BACKUP SEBELUM MIGRATE (jika ada data penting)
   mysqldump jhmpro > jhmpro_backup_$(date +%Y%m%d).sql

5. TABEL BARU = BEBAS
   Jika tabel belum ada sama sekali, langsung buat via migration normal.
   Tidak perlu cek data.

6. KOLOM BARU = NULLABLE DULU
   Jika tabel sudah ada data, selalu tambah kolom baru sebagai ->nullable()
   atau ->default(value). Jangan pernah tambah NOT NULL tanpa default
   di tabel yang sudah berisi baris.

7. JANGAN DROP KOLOM TANPA KONFIRMASI
   Sebelum menjalankan Schema::dropColumn() atau DROP TABLE,
   tanyakan ke user apakah data di kolom tersebut boleh dihapus.

8. SETELAH SCAN, LAPORKAN DULU
   Setelah menjalankan scan di 16.1, buat laporan singkat:
   - Tabel apa saja yang sudah ada
   - Tabel mana yang sudah ada data (row count > 0)
   - Apakah ada konflik dengan schema di Section 5 plan ini
   Tunggu konfirmasi user sebelum mulai buat migration.
```

---

### 16.5 Aturan Git — Wajib Diikuti

#### Commit setiap perubahan

Setiap perubahan yang selesai dikerjakan **wajib langsung di-commit**. Jangan akumulasi banyak perubahan dalam satu commit besar.

```bash
# Contoh alur kerja yang benar:
# 1. Selesai buat migration → commit
# 2. Selesai buat model → commit
# 3. Selesai buat controller → commit
# 4. Selesai buat view → commit
```

#### Format Conventional Commit — Bahasa Indonesia

```
<tipe>(<scope>): <deskripsi singkat>

[isi opsional — penjelasan lebih lanjut jika perlu]
```

**Tipe yang digunakan:**

| Tipe | Kapan dipakai |
|------|--------------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan kode tanpa tambah fitur atau fix bug |
| `style` | Perubahan tampilan/CSS (bukan logic) |
| `migrate` | Membuat atau mengubah migration database |
| `chore` | Setup, konfigurasi, dependencies |
| `docs` | Perubahan dokumentasi |
| `test` | Menambah atau mengubah test |

**Contoh commit yang benar:**

```bash
# Migration
git commit -m "migrate(customers): tambah tabel customers dan relasi ke users"
git commit -m "migrate(bookings): ubah enum source tambah whatsapp dan walk_in"
git commit -m "migrate(work-orders): tambah kolom wo_number dengan format WO-NNNN"

# Model
git commit -m "feat(customer): tambah model Customer dengan relasi vehicles dan invoices"
git commit -m "feat(vehicle): tambah observer auto-create engine specs saat kendaraan dibuat"

# Controller / Livewire
git commit -m "feat(admin/invoice): buat halaman list invoice dengan filter dan pagination"
git commit -m "feat(pos): buat halaman kasir POS mode walk-in jual sparepart"
git commit -m "fix(booking): perbaiki kalkulasi slot kapasitas saat booking bersamaan"

# UI / Blade
git commit -m "style(sidebar): tambah navigasi kondisional berdasarkan role"
git commit -m "style(pos): buat layout fullscreen kasir tanpa sidebar"

# Auth
git commit -m "feat(auth): tambah guard admin dan middleware CheckRole"
git commit -m "feat(auth): buat halaman login admin di /admin/login"
```

#### Larangan dalam commit

```
DILARANG — Co-author Claude:
  Jangan pernah tambahkan baris berikut di commit message:
  "Co-authored-by: Claude <...>"
  "Generated by Claude"
  atau sejenisnya.

DILARANG — Commit message bahasa Inggris:
  Salah : "feat(customer): add customer list page with pagination"
  Benar : "feat(customer): tambah halaman list pelanggan dengan pagination"

DILARANG — Commit terlalu umum:
  Salah : "feat: update banyak file"
  Salah : "fix: berbagai perbaikan"
  Benar : satu commit = satu perubahan spesifik dengan scope jelas
```

---

### 16.6 Aturan UI — Dilarang Emoji sebagai Ikon

Seluruh ikon di aplikasi **wajib menggunakan Heroicons** (atau SVG custom), **bukan emoji**.

```
DILARANG di kode Blade / Livewire / Alpine:
  ❌  <span>🔴 Buka Kasir POS</span>
  ❌  <button>⚙️ Pengaturan</button>
  ❌  <a>🗑 Hapus</a>
  ❌  <p>✅ Aktif</p>

WAJIB menggunakan Heroicons atau SVG:
  ✅  <x-heroicon-o-calculator class="w-4 h-4" /> Buka Kasir POS
  ✅  <x-heroicon-o-cog-6-tooth class="w-4 h-4" /> Pengaturan
  ✅  <x-heroicon-o-trash class="w-4 h-4" />
  ✅  <span class="w-2 h-2 rounded-full bg-green-500"></span> Aktif
```

> Catatan: emoji yang muncul di dokumen plan.md ini hanya untuk keperluan
> dokumentasi dan ilustrasi — BUKAN untuk dipakai di kode produksi.

**Package Heroicons untuk Laravel:**
```bash
composer require blade-ui-kit/blade-heroicons
```

**Cara pakai:**
```blade
{{-- Outline (default untuk ikon UI) --}}
<x-heroicon-o-home class="w-5 h-5" />
<x-heroicon-o-users class="w-5 h-5" />
<x-heroicon-o-document-text class="w-5 h-5" />
<x-heroicon-o-wrench-screwdriver class="w-5 h-5" />

{{-- Solid (untuk ikon yang lebih tebal/bold) --}}
<x-heroicon-s-star class="w-5 h-5 text-yellow-400" />
```

**Status dot (pengganti emoji bulat berwarna):**
```blade
{{-- Jangan: 🟢 Aktif --}}
{{-- Harus: --}}
<span class="inline-flex items-center gap-1.5 text-sm text-green-700">
  <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
  Aktif
</span>
```

---

### 16.7 Urutan Implementasi yang Disarankan

```
FASE 0 (WAJIB) — Sebelum apapun:
  1. Jalankan scan database (Section 16.1)
  2. Bandingkan hasil scan dengan schema Section 5
  3. Identifikasi: tabel apa yang kurang, kolom apa yang berbeda
  4. Laporan ke user, tunggu konfirmasi

FASE 1 — Fondasi (jika belum ada):
  Buat migration untuk tabel yang BELUM ADA sama sekali
  (tabel baru = aman, tidak ada risiko data)

FASE 2 — Penyesuaian tabel yang sudah ada:
  Jalankan perubahan kritis (Section 16.3) satu per satu
  dengan cek kondisi data sebelum setiap migration

FASE 3 — Lanjut implementasi fitur:
  Setelah schema bersih dan sesuai dengan Section 5,
  baru mulai implementasi fitur per fase (Section 13 Roadmap)
```

---

## 17. MODUL KASIR POS (`/admin/pos`)

> Fitur ini terlihat dari design batch 3. POS adalah interface fullscreen terpisah dari admin panel,
> dapat diakses oleh **admin** dan **super_admin** (bukan mekanik).
> Diakses via tombol "Buka Kasir POS" di user dropdown topbar.

---

### 17.1 Akses & Routing

```
Route       : /admin/pos
Guard       : admin (auth:admin)
Middleware  : role:super_admin,admin   ← mekanik TIDAK bisa akses
Layout      : layouts/pos.blade.php   ← BUKAN layouts/admin.blade.php
              (fullscreen, tanpa sidebar, topbar minimal)
```

**User Dropdown (dari topbar avatar):**
```blade
{{-- Dropdown yang muncul saat klik avatar user --}}
<div class="dropdown-menu">
  {{-- Hanya tampil untuk admin & super_admin --}}
  @if(in_array(auth('admin')->user()->role, ['admin', 'super_admin']))
    <a href="/admin/pos" class="flex items-center gap-2 text-sm font-medium text-white bg-red-600 px-4 py-2 rounded">
      <x-heroicon-o-calculator class="w-4 h-4" />
      Buka Kasir POS
    </a>
  @endif

  <a href="/admin/settings" class="...">
    <x-heroicon-o-cog-6-tooth class="w-4 h-4" /> Pengaturan
  </a>

  <button wire:click="logout" class="...">
    <x-heroicon-o-arrow-right-on-rectangle class="w-4 h-4" /> Keluar
  </button>
</div>
```

> **Catatan:** "Pengaturan" juga ada di user dropdown (bukan hanya sidebar).
> Ini perlu dikonfirmasi: apakah Pengaturan di dropdown = Pengaturan super_admin saja,
> atau ada halaman profil user yang berbeda untuk admin biasa?

---

### 17.2 Layout POS (Fullscreen)

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR POS (minimal, bukan admin topbar)                            │
│  [Logo+JHMPro kecil]  Kasir POS / Minggu, 14 Juni 2026              │
│                    [Walk-In] [Dari Work Order]      [🌙] [← Dashboard]│
├──────────────────────────────────────┬───────────────────────────────┤
│                                      │                               │
│  PANEL KIRI (~60%)                   │  PANEL KANAN (~40%)           │
│  bg-white                            │  bg-white / bg-gray-50        │
│                                      │                               │
│  INFO TRANSAKSI / PILIH WO           │  RINGKASAN BELANJA            │
│  ─────────────────────              │  ─────────────────────        │
│  TAMBAH ITEM                         │  [item list / kosong]         │
│  ─────────────────────              │  Subtotal          Rp X       │
│  CATATAN (opsional)                  │  Diskon       [Rp input]      │
│                                      │  Grand Total       Rp X (red) │
│                                      │  ─────────────────────        │
│                                      │  METODE PEMBAYARAN            │
│                                      │  [Tunai] [Transfer]           │
│                                      │  [QRIS]  [Kredit]             │
│                                      │  JUMLAH BAYAR [Rp input]      │
│                                      │  Kembalian      Rp X / Lunas  │
│                                      │  ─────────────────────        │
│                                      │  [Buat Invoice] (gray/merah)  │
└──────────────────────────────────────┴───────────────────────────────┘

Topbar POS height: h-14 (lebih kecil dari admin topbar h-16)
Toggle mode: [Walk-In] [Dari Work Order] — merah = aktif, putih = nonaktif
Back button: "← Dashboard" → redirect ke /admin/dashboard
```

---

### 17.3 Mode Walk-In

Diaktifkan via toggle **"Walk-In"** di topbar POS.

#### Sub-tipe: Jual Sparepart (default)

```
TIPE TRANSAKSI toggle: [Jual Sparepart ●] [Servis Kendaraan]

PELANGGAN (opsional):
  Input search "Cari nama atau no. HP..."
  → Autocomplete dari tabel customers
  → Boleh kosong (transaksi anonim walk-in)

TAMBAH ITEM:
  Search: "Cari nama atau SKU..."
  → Live search ke spareparts WHERE is_active = true AND stock > 0
  → Setiap item tampil: [Nama] / [Stok info] [Harga jual] [+ button]
  → Stok info format:
      stock > minimum_stock  : tidak tampil
      stock ≤ minimum_stock  : "Stok: N ⚠ hampir habis" (text-orange-500)
      stock = 0              : "Stok habis" (text-red-600), tombol + disabled

CATATAN (opsional): textarea
```

#### Sub-tipe: Servis Kendaraan

```
TIPE TRANSAKSI toggle: [Jual Sparepart] [Servis Kendaraan ●]

PELANGGAN * (WAJIB):
  → asterisk merah, label "Wajib"
  → Tidak bisa buat invoice tanpa pilih pelanggan

KELUHAN CUSTOMER (WAJIB):
  Textarea "Deskripsikan keluhan atau masalah kendaraan..."
  → Border amber saat kosong + error "⚠ Keluhan belum diisi"
  → Diperlukan untuk membuat work order otomatis setelah invoice

TAMBAH ITEM:
  Sub-toggle: [Servis ●] | [Sparepart]
  
  Servis aktif:
    → List dari tabel services WHERE is_active = true
    → Format: [Nama Servis] / [XX mnt] [Rp harga] [+]
    
  Sparepart aktif:
    → List dari spareparts (sama dengan Jual Sparepart)
    → Format: [Nama] / [Stok info] [Rp harga] [+]
```

**Perbedaan output Walk-In Jual Sparepart vs Servis Kendaraan:**
```
Jual Sparepart   → invoice.tipe = 'walk_in', TANPA work order dibuat
Servis Kendaraan → invoice.tipe = 'walk_in', DENGAN work order dibuat otomatis
                   (karena ada keluhan customer = perlu mekanik kerjakan)
```

---

### 17.4 Mode Dari Work Order

Diaktifkan via toggle **"Dari Work Order"** di topbar POS.

```
PILIH WORK ORDER:
  Search: "Cari kendaraan / customer..."
  → Filter WO yang sudah selesai dikerjakan mekanik (status = 'selesai')
    dan belum dibuatkan invoice final
  
  Setiap WO card tampil:
  ┌──────────────────────────────────────────────────────────────┐
  │ WO-0001                              2 Jun 2026 10:30        │
  │ Honda Beat - D 1234 AAA                                      │
  │ Rizky Maulana — Mesin terasa kasar saat gas                  │
  └──────────────────────────────────────────────────────────────┘
  Format: [WO# merah] [tanggal & jam kanan]
          [Kendaraan brand + model - no polisi]
          [Nama Mekanik — Keluhan singkat]

  → Klik WO card → WO terpilih → TAMBAH ITEM muncul
  → Keluhan tidak perlu diinput ulang (sudah ada di WO)

TAMBAH ITEM (setelah WO dipilih):
  Sub-toggle: [Servis ●] | [Sparepart]
  → Sama dengan Servis Kendaraan di Walk-In
```

---

### 17.5 Panel Kanan — Ringkasan Belanja

```
RINGKASAN BELANJA
  (jika kosong) → "Keranjang kosong" (text-gray-400 centered)
  (jika ada item) → list item: nama, qty, harga × qty, tombol hapus

Subtotal      : auto-hitung dari sum item
Diskon        : input editable, "Rp [input angka]" — nominal, bukan persen
Grand Total   : Subtotal - Diskon, warna text-red-600, font-bold, text-xl

PEMBAYARAN
METODE PEMBAYARAN (2×2 toggle grid, satu aktif):
  [Tunai   ] [Transfer]
  [QRIS    ] [Kredit  ]
  → Aktif: bg-red-600 text-white border-red-600
  → Nonaktif: bg-white text-gray-700 border border-gray-300

JUMLAH BAYAR:
  Input "Rp [angka]"
  → Hanya relevan saat Tunai
  → Transfer/QRIS/Kredit: auto-filled = Grand Total (atau skip)

Kembalian: Grand Total − Jumlah Bayar
  → Positif: "Rp X" (text-green-600)
  → Nol: "Lunas" (text-green-600)
  → Negatif: "Kurang Rp X" (text-red-600)

BUAT INVOICE button:
  → Disabled (bg-gray-400) + "Keranjang masih kosong" keterangan bawah
     JIKA: tidak ada item di keranjang
  → Enabled (bg-red-600 hover:bg-red-700)
     JIKA: ada minimal 1 item
  → Klik → generate invoice, kurangi stok, buat WO jika perlu
```

---

### 17.6 Logic Setelah "Buat Invoice"

```
WALK-IN — JUAL SPAREPART:
  1. INSERT invoices (tipe='walk_in', customer_id nullable)
  2. INSERT invoice_items (semua item di keranjang)
  3. DECREMENT spareparts.stock per item
  4. INSERT stock_movements (type='out', reference=invoice)
  5. Redirect ke detail invoice / print preview

WALK-IN — SERVIS KENDARAAN:
  1. INSERT invoices (tipe='walk_in', customer_id REQUIRED)
  2. INSERT invoice_items (semua item)
  3. DECREMENT stok per sparepart item
  4. INSERT stock_movements
  5. INSERT work_orders (dari keluhan customer, assign mekanik nanti)
  6. Redirect ke detail invoice

DARI WORK ORDER:
  1. INSERT invoices (tipe='walk_in', link ke work_order via booking_id atau WO ref)
  2. INSERT invoice_items
  3. DECREMENT stok per sparepart
  4. INSERT stock_movements
  5. UPDATE work_orders.invoice_id = invoice baru
  6. Redirect ke detail invoice
```

---

### 17.7 Update Permission Matrix (Terkait POS)

```
Aksi                        | super_admin | admin | mekanik | customer
─────────────────────────── | :---------: | :---: | :-----: | :------:
Akses Kasir POS             |     ✅      |  ✅   |   ❌    |   ❌
Buka Kasir — Walk-In        |     ✅      |  ✅   |   ❌    |   ❌
Buka Kasir — Dari WO        |     ✅      |  ✅   |   ❌    |   ❌
Buat Invoice via POS        |     ✅      |  ✅   |   ❌    |   ❌
```

---

### 17.8 Update Screen Inventory (Batch 3)

| Screen | Route | Status |
|--------|-------|:------:|
| Dashboard dropdown (user menu) | topbar component | ✅ |
| Kasir POS — Walk-In (Jual Sparepart) | `/admin/pos` | ✅ |
| Kasir POS — Walk-In (Servis Kendaraan) | `/admin/pos` | ✅ |
| Kasir POS — Dari Work Order | `/admin/pos` | ✅ |

Total screen confirmed hingga batch 3: **19 screen** ✅
