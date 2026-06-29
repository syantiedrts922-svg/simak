# SIMAK — Sistem Informasi Penerimaan Mahasiswa Baru 🎓

Website pendaftaran mahasiswa baru Universitas Harapan Bangsa, terintegrasi dengan Google Workspace dan GitHub.

## Fitur Integrasi Cloud

| Layanan | Fungsi |
|---|---|
| **Google Form** | Formulir pendaftaran utama, validasi input, upload file |
| **Google Drive** | Penyimpanan dokumen pendaftar, folder otomatis per orang |
| **Google Sheets** | Database real-time, monitoring admin, status tracking |
| **GitHub Pages** | Hosting website gratis, pengumuman hasil seleksi |
| **GitHub Actions** | CI/CD otomatis deploy setiap push ke branch main |

## Struktur Proyek

```
simak/
├── index.html              # Halaman utama
├── css/
│   └── style.css           # Stylesheet global
├── js/
│   └── main.js             # JavaScript (form, status, countdown)
├── pages/
│   ├── daftar.html         # Formulir pendaftaran (multi-step)
│   ├── status.html         # Cek status pendaftaran
│   └── panduan.html        # Panduan & FAQ
├── apps-script/
│   └── Code.gs             # Google Apps Script backend
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions CI/CD
```

## Cara Setup (Langkah demi Langkah)

### 1. Fork & Clone Repo
```bash
git clone https://github.com/USERNAME/simak.git
cd simak
```

### 2. Setup Google Sheets
1. Buat Google Spreadsheet baru
2. Catat **Spreadsheet ID** dari URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 3. Setup Google Drive
1. Buat folder baru di Google Drive: `SIMAK - Dokumen Pendaftar 2025`
2. Catat **Folder ID** dari URL: `https://drive.google.com/drive/folders/FOLDER_ID`

### 4. Deploy Google Apps Script
1. Buka [script.google.com](https://script.google.com) → **New Project**
2. Paste isi file `apps-script/Code.gs`
3. Edit konfigurasi di bagian `CONFIG`:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: 'ISI_ID_SPREADSHEET_KAMU',
     FOLDER_DRIVE_ID: 'ISI_ID_FOLDER_DRIVE_KAMU',
     EMAIL_PENGIRIM:  'email-panitia@kampus.ac.id',
     NAMA_UNIVERSITAS: 'Nama Universitas Kamu',
   };
   ```
4. Klik **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin **URL Web App** yang dihasilkan

### 5. Hubungkan Website ke Apps Script
Edit `js/main.js`, ganti:
```javascript
const APPS_SCRIPT_URL = 'PASTE_URL_APPS_SCRIPT_KAMU_DI_SINI';
```

### 6. Deploy ke GitHub Pages
1. Push ke GitHub:
   ```bash
   git add .
   git commit -m "Initial commit SIMAK PMB 2025"
   git push origin main
   ```
2. Di GitHub repo → **Settings → Pages**
3. Source: **GitHub Actions**
4. GitHub Actions akan otomatis deploy, website live di:
   `https://USERNAME.github.io/simak/`

## Teknologi

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Sheets
- **Storage**: Google Drive
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions

## Lisensi

MIT License — bebas digunakan dan dimodifikasi untuk keperluan pendidikan.

---
Dibuat untuk tugas Cloud Computing · Universitas Surakarta
