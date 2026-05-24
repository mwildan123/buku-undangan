# 📖 Buku Catatan Undangan

Aplikasi mobile untuk mencatat tamu undangan pernikahan/hajatan.

## Fitur
- ✅ Tambah tamu (nama, beras, uang, alamat)
- ✅ Edit data tamu
- ✅ Hapus data tamu (dengan konfirmasi)
- ✅ Pencarian real-time berdasarkan nama / alamat
- ✅ Statistik otomatis (total tamu, beras, uang)
- ✅ Gesture swipe kiri/kanan untuk edit/hapus
- ✅ Data tersimpan di localStorage

## Cara Menjalankan

### Prasyarat
- Node.js 18+
- npm

### Install & Jalankan

```bash
npm install
npx ng serve
```
Buka browser: http://localhost:4200

### Build Production
```bash
npx ng build
```

### Jalankan di HP (Android/iOS)
```bash
npm install -g @ionic/cli @capacitor/cli
npx cap add android
npx ng build
npx cap copy android
npx cap open android
```
Kemudian build di Android Studio.

## Struktur Project

```
src/app/
├── services/
│   └── tamu.service.ts     # Service data (CRUD + localStorage)
├── home/
│   ├── home.page.ts        # Halaman utama (list + search + stats)
│   ├── home.page.html
│   └── home.page.scss
├── form/
│   ├── form.page.ts        # Form tambah & edit tamu
│   ├── form.page.html
│   └── form.page.scss
├── app.routes.ts
├── app.config.ts
└── app.ts
```

## Tech Stack
- **Ionic Angular 8** — UI Components
- **Angular 21** — Framework
- **localStorage** — Penyimpanan data lokal
