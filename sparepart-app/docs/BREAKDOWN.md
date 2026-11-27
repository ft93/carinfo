# Breakdown – Aplikasi Inventory Sparepart Bengkel

## 1. Tujuan
Mencatat sparepart **masuk (beli)** dan **keluar (pakai)**, tahu **dipakai untuk pekerjaan apa** dan **di mobil mana**, serta menghitung **valuasi stok** (nilai rupiah sparepart di gudang) secara otomatis.

## 2. Workflow

```
 [Master Sparepart]   [Master Mobil]
         │                  │
         ▼                  │
   1. BELI (stok masuk)     │
   tgl, sparepart, qty,     │
   harga/unit, supplier     │
         │                  │
         ▼                  ▼
   2. PAKAI (stok keluar) ──► ke mobil mana (no. polisi)
   tgl, sparepart, qty,      untuk pekerjaan apa (ganti oli, rem, ...)
   mekanik                   mekanik siapa
         │
         ▼
   3. VALUASI STOK (otomatis)
   stok = total beli − total pakai
   nilai = stok × harga rata-rata tertimbang
   HPP pemakaian per mobil
```

## 3. Data (entitas)

| Entitas | Field utama | Keterangan |
|---|---|---|
| **Sparepart** | SKU, nama, satuan, stok minimum | Master barang. Stok minimum → peringatan restock |
| **Mobil** | No. polisi, merek, tipe, tahun, pemilik | Master kendaraan customer |
| **Pembelian** | tanggal, sparepart, qty, harga/unit, supplier, catatan/no. nota | Menambah stok & nilai |
| **Pemakaian** | tanggal, sparepart, qty, mobil, pekerjaan, mekanik | Mengurangi stok, menghasilkan HPP |

Stok **tidak disimpan** sebagai angka manual. Stok selalu dihitung dari riwayat transaksi, jadi tidak bisa "selisih".

## 4. Metode valuasi: Rata-rata Tertimbang Bergerak (Moving Average)
- Saat **beli**: `harga rata2 baru = (nilai stok lama + qty beli × harga beli) / (qty lama + qty beli)`
- Saat **pakai**: `HPP = qty pakai × harga rata2 saat itu`
- `Nilai stok = sisa qty × harga rata2`

Contoh: beli 10 oli @50.000, lalu 10 @60.000 → rata2 55.000. Pakai 4 → HPP 220.000, sisa 16 × 55.000 = **Rp 880.000**.

Kenapa moving average? Paling umum untuk bengkel, mudah dicek manual, dan diterima untuk pembukuan di Indonesia. FIFO bisa ditambahkan nanti bila perlu.

## 5. Fitur Fase 1 (MVP, sudah dibuat)
- [x] Master sparepart (SKU unik, satuan, stok minimum)
- [x] Master mobil (no. polisi unik)
- [x] Catat pembelian + riwayat
- [x] Catat pemakaian ke mobil + pekerjaan + mekanik (validasi stok cukup)
- [x] Dashboard: nilai stok, pemakaian bulan ini, stok menipis
- [x] Riwayat pemakaian & total biaya sparepart per mobil
- [x] Laporan valuasi stok + export CSV (buka di Excel)
- [x] Backup / restore data (file JSON)
- [x] PWA: bisa di-install di Android, iOS, dan dibuka di browser (desktop); jalan offline

## 6. Roadmap berikutnya
**Fase 2 – Multi-user & cloud**
- Login (owner, admin, mekanik) dan sinkronisasi antar HP (mis. Supabase/Firebase atau backend Rails yang ada di repo ini)
- Hak akses: mekanik hanya boleh catat pemakaian

**Fase 3 – Operasional bengkel**
- Work Order / SPK: satu SPK = satu mobil, banyak sparepart + jasa
- Harga jual sparepart & invoice ke customer → laba per SPK
- Data supplier, PO (purchase order), retur pembelian
- Stock opname (penyesuaian stok fisik) dengan alasan
- Scan barcode sparepart pakai kamera HP

**Fase 4 – Laporan**
- Kartu stok per sparepart (mutasi masuk/keluar)
- Laporan per periode, per mekanik, per jenis pekerjaan
- Fast/slow moving, rekomendasi restock

## 7. Teknologi
- React + TypeScript + Vite
- IndexedDB (Dexie) – data tersimpan di perangkat, bisa offline
- vite-plugin-pwa – installable di Android/iOS
- Vitest – unit test untuk perhitungan valuasi

> Catatan: di Fase 1 data tersimpan **per perangkat**. Lakukan backup rutin dari menu Laporan. Sinkronisasi antar perangkat masuk Fase 2.
