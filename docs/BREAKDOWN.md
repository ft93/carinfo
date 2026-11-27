# Breakdown – Aplikasi Bengkel Body & Cat (Rekanan Asuransi)

> Dokumen desain utama. Status: **draft, masih didiskusikan** (terakhir diperbarui 27 Nov 2026).
> Riwayat diskusi lengkap: [DISKUSI.md](DISKUSI.md)
> Prototype alur (klik-klik, data contoh): `public/prototype/index.html`, online di https://ft93.github.io/carinfo/prototype/

---

## 1. Konteks bengkel

- Bengkel **body & cat**, sebagian besar mobil **asuransi**, sebagian **umum** (bayar sendiri).
- Pekerjaan per mobil: **ganti sparepart**, **ketok & las**, **cat**.
- Belanja part baru dilakukan **setelah klaim disetujui asuransi**; supplier berbeda-beda.
- Banyak asuransi memakai **Merimen** (platform pihak ketiga penghubung bengkel–asuransi).
- Bengkel sudah **PKP** (memungut PPN).
- Pembukuan saat ini masih di **Excel**.

## 2. Posisi aplikasi terhadap Merimen

Aplikasi ini **tidak menggantikan Merimen**. Merimen = jalur komunikasi dengan asuransi; aplikasi ini = sistem internal bengkel.

```
        ┌──────────── MERIMEN (urusan dengan asuransi) ────────────┐
        │  ajukan estimasi + foto → survei/approval → klaim tambahan │
        └──────────────▲─────────────────────────┬──────────────────┘
                       │ diketik / upload         │ hasil approval dicatat
┌──────────────────────┴─────────────────────────▼──────────────────────────┐
│                  APLIKASI BENGKEL (sistem internal)                         │
│  Penerimaan & SPK → Belanja part → Pengerjaan → Stok & upah →               │
│  Tagihan & piutang → Akuntansi & laba per mobil                             │
└────────────────────────────────────────────────────────────────────────────┘
```

| Urusan | Merimen | Aplikasi bengkel |
|---|---|---|
| Ajukan estimasi & dapat approval asuransi | ✅ | catat hasilnya |
| Tanda terima mobil, SPK kerja untuk tukang | ❌ | ✅ |
| PO supplier, barang masuk, stok bahan | ❌ | ✅ |
| Progress pengerjaan, upah tukang | ❌ | ✅ |
| Piutang asuransi, utang supplier, PPN/PPh | ❌ | ✅ |
| Laba per mobil, laporan keuangan | ❌ | ✅ |
| Mobil umum & asuransi non-Merimen | ❌ | ✅ (estimasi dibuat di aplikasi) |

**Agar tidak ketik dua kali:**
1. Surveyor bengkel menulis SPK di aplikasi (panel + jenis pekerjaan + foto).
2. Estimator memasukkan estimasi ke Merimen.
3. Setelah approval, admin klaim mencatat **harga yang disetujui** per item di aplikasi + upload PDF approval Merimen sebagai bukti.
4. Jika Merimen bisa ekspor estimasi/approval (PDF/Excel), langkah 3 bisa dibuat import otomatis — *belum dicek*.

## 3. Alur kerja (workflow)

```
1. PENERIMAAN MOBIL        (surveyor bengkel)
   data mobil & pemilik, jenis ASURANSI/UMUM, asuransi, no. polis, no. klaim,
   dokumen (STNK, SIM, form klaim, laporan kejadian), foto kerusakan, tanda terima mobil
        ↓
2. SPK / ESTIMASI          (surveyor → estimator)
   item per panel: Ketok/Las, Cat, Ganti part, Bongkar pasang, Spot repair
   harga jasa dari daftar harga per asuransi
        ↓
3. PERSETUJUAN
   Asuransi (Merimen/lainnya): survei → disetujui / ditolak / harga dikoreksi → SPK asuransi + Own Risk (OR)
   Umum: customer setuju (bisa DP)
        ↓
4. BELANJA PART            (purchasing)
   hanya part yang disetujui; otomatis dikelompokkan per supplier → PO → barang diterima → masuk biaya SPK
        ↓
5. PENGERJAAN              (kepala bengkel)
   Bongkar → Ketok/Las → Dempul → Cat → Poles → Pasang → QC
   pemakaian bahan gudang, upah tukang, KLAIM TAMBAHAN (kembali ke tahap 3)
        ↓
6. SELESAI & TAGIH         (admin klaim / kasir)
   invoice ke asuransi (total − OR) + PPN, OR ke customer + PPN, faktur pajak, serah terima mobil
        ↓
7. PEMBAYARAN              (keuangan)
   asuransi bayar (dipotong PPh 23), bayar supplier, bayar upah
```

Hasil akhir per mobil: **pendapatan − (part + bahan + upah) = laba per SPK**.

## 4. Dokumen yang dihasilkan aplikasi

| Dokumen | Untuk | Isi |
|---|---|---|
| Tanda terima mobil | Customer | Kondisi mobil, barang di dalam mobil, tanda tangan |
| Estimasi / penawaran | Asuransi non-Merimen / customer umum | Item + harga (PDF) |
| SPK kerja (internal) | Tukang body & cat | Item pekerjaan **tanpa harga**, kolom paraf per tahap |
| PO | Supplier | Daftar part per supplier |
| Invoice + faktur pajak | Asuransi & customer (OR) | Tagihan + PPN |

Revisi SPK (koreksi surveyor asuransi, klaim tambahan) disimpan sebagai **riwayat revisi**.

## 5. Role & hak akses (usulan)

| Role | Boleh apa | Lihat harga / keuangan |
|---|---|---|
| **Surveyor bengkel** | Buat SPK (panel + jenis pekerjaan), tanda terima mobil, foto | ❌ |
| **Admin klaim / estimator** | Catat approval Merimen, klaim tambahan, invoice | harga jual |
| **Admin gudang / purchasing** | PO, terima barang, stok bahan | harga beli |
| **Kepala bengkel / foreman** | Update tahap pengerjaan, tugaskan tukang, catat bahan | ❌ |
| **Keuangan / kasir** | Pembayaran, piutang, utang, upah, laporan | ✅ |
| **Owner** | Semua + pengaturan + laba per mobil | ✅ |

- Satu orang boleh merangkap beberapa role.
- Tukang tidak perlu login (progress diupdate kepala bengkel).
- **Sudah dikonfirmasi:** surveyor bengkel hanya membuat SPK dan tanda terima mobil saat masuk.

## 6. Barang: dua jenis

| Jenis | Contoh | Perlakuan |
|---|---|---|
| **Part per SPK** | lampu, bumper, grill, kaca | Dibeli khusus setelah approval → langsung biaya SPK (tidak lewat stok gudang) |
| **Bahan / stok gudang** | cat, clear, thinner, dempul, amplas | Dibeli rutin, disimpan; pemakaian dicatat ke SPK, nilai = rata-rata tertimbang |

## 7. Akuntansi (jurnal otomatis)

User tidak menginput jurnal; setiap aksi di aplikasi membuat jurnal double-entry.

| Kejadian | Debit | Kredit |
|---|---|---|
| Beli bahan stok | Persediaan Bahan (+ PPN Masukan) | Kas / Utang Supplier |
| Part untuk SPK diterima | Pekerjaan Dalam Proses (+ PPN Masukan) | Kas / Utang Supplier |
| Pakai bahan ke SPK | Pekerjaan Dalam Proses | Persediaan Bahan |
| Upah tukang SPK | Pekerjaan Dalam Proses | Utang Upah |
| Invoice terbit | Piutang Asuransi + Piutang Customer (OR) | Pendapatan Jasa + Pendapatan Part + PPN Keluaran |
| | HPP | Pekerjaan Dalam Proses |
| Asuransi bayar | Kas/Bank + PPh 23 Dibayar Dimuka | Piutang Asuransi |
| Customer bayar OR | Kas | Piutang Customer |
| Bayar supplier / upah | Utang Supplier / Utang Upah | Kas/Bank |
| Biaya operasional | Beban … | Kas |

**Pekerjaan Dalam Proses (WIP)** menahan biaya sampai invoice terbit, supaya laba per bulan tidak naik-turun karena part dibeli bulan ini tapi ditagih bulan depan.

Laporan: laba rugi, neraca, arus kas, buku besar, laba per SPK / per asuransi, umur piutang asuransi, utang supplier jatuh tempo. Ekspor ke Excel untuk akuntan.

**Pajak (perlu konfirmasi konsultan pajak):** PPN (prototype memakai 11%), PPh 23 2% atas jasa yang dipotong asuransi, perlakuan PPN atas Own Risk. Tarif dibuat bisa diatur.

## 8. Urutan pembangunan (usulan)

| Tahap | Isi |
|---|---|
| ✅ **Fase 1 (selesai)** | PWA inventory sederhana: sparepart, mobil, beli, pakai, valuasi stok, backup. Live di https://ft93.github.io/carinfo/ |
| ✅ **Prototype alur** | Prototype klik alur asuransi + jurnal otomatis (data contoh) |
| **A. Inti** | Login & role, data tersinkron di semua HP, penerimaan + tanda terima, SPK per panel, catat approval (Merimen), status SPK, PO per supplier terhubung SPK, pemakaian bahan ke SPK |
| **B. Keuangan** | Invoice + PPN, piutang asuransi & customer, utang supplier, jurnal otomatis, laba per SPK, laporan keuangan |
| **C. Operasional** | Upah tukang, progress per tahap, klaim tambahan, upload foto & dokumen, cetak SPK kerja / tanda terima |
| **D. Laporan & integrasi** | Laporan per asuransi/supplier, lama pengerjaan, import Merimen (jika memungkinkan) |

## 9. Pertanyaan terbuka

**Workflow**
1. Berapa asuransi rekanan? Harga jasa cat per panel beda tiap asuransi?
2. Ada part yang disediakan asuransi (bukan dibeli bengkel)?
3. Belanja ke supplier biasanya tempo? Perlu catat utang?
4. Tukang dibayar borongan per panel/mobil atau gaji harian/bulanan?
5. Estimasi sekarang dibuat di mana? (contoh file/foto akan membantu)
6. Persentase mobil umum vs asuransi?
7. **30% workflow lainnya** — owner sedang menyusun daftar fitur tambahan.

**Merimen**
8. Berapa persen mobil asuransi yang lewat Merimen? Asuransi lain pakai apa (portal, email, WA)?
9. Invoice ke asuransi dikirim lewat Merimen juga atau terpisah?
10. Apakah estimasi/approval di Merimen bisa di-download (PDF/Excel)?

**Organisasi**
11. Posisi mana di daftar role yang benar-benar ada, siapa merangkap apa?

**SPK**
12. "SPK" yang dimaksud: SPK kerja untuk tukang, estimasi untuk asuransi, atau keduanya?

**Akuntansi & pajak**
13. Konfirmasi tarif/perlakuan PPN, PPh 23, dan PPN atas OR dengan konsultan pajak.
14. Ada akuntan yang akan membaca laporannya? Format yang diinginkan?

**Model bisnis**
15. Apakah aplikasi akan dijual ke bengkel lain? (jika ya: multi-tenant wajib sejak Tahap A; usulan model: langganan bulanan bertingkat per jumlah SPK + user — lihat DISKUSI §13)
16. Target pembeli: bengkel body & cat rekanan asuransi saja, atau bengkel umum juga?

## 10. Teknologi

- Saat ini: React + TypeScript + Vite, PWA (install di Android/iOS), data lokal IndexedDB, deploy otomatis GitHub Pages.
- Fase A: perlu backend + database cloud (login, role, sinkron antar HP). Pilihan dibahas saat Fase A dimulai.
