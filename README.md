# Sparepart Bengkel

PWA untuk tracking inventory sparepart bengkel: **Beli → Pakai (pekerjaan & mobil) → Valuasi stok**.

Lihat breakdown lengkap: [docs/BREAKDOWN.md](docs/BREAKDOWN.md)

## Menjalankan
```bash
npm install
npm run dev      # buka http://localhost:5173 (juga bisa dari HP di jaringan yang sama)
npm test         # unit test valuasi stok
npm run build    # hasil di dist/, siap di-deploy ke hosting statis
```

## Deploy & install di HP
1. `npm run build`, lalu upload folder `dist/` ke hosting statis HTTPS (Netlify, Vercel, Cloudflare Pages, GitHub Pages).
2. Buka URL-nya di HP:
   - **Android (Chrome):** menu ⋮ → *Install app / Add to Home screen*
   - **iPhone (Safari):** tombol Share → *Add to Home Screen*

## Deploy otomatis (GitHub Pages)
Setiap push, GitHub Actions menjalankan test, build, lalu publish ke branch `gh-pages`.
Sekali saja: **Settings → Pages → Source: Deploy from a branch → `gh-pages` / `(root)`**.
URL aplikasi: https://ft93.github.io/carinfo/
