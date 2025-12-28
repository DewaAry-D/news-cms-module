# News CMS Module

Modul Content Management System (CMS) Berita yang siap pakai untuk aplikasi Express.js. Modul ini menangani manajemen database (Sequelize), logika bisnis, hingga tampilan antarmuka (EJS) secara otomatis.

## Fitur
- **Auto-Sync Database**: Membuat tabel `news`, `content_news`, dan `visitor_logs` secara otomatis.
- **Tracking Pengunjung**: Sistem pelacakan unik pengunjung per berita dalam 24 jam.
- **Trending News**: Menampilkan 10 berita paling populer berdasarkan jumlah pengunjung 24 jam terakhir.
- **CMS Admin**: Dashboard manajemen berita dengan prefix yang dapat diatur.
- **Static Assets**: CSS internal yang sudah terintegrasi.

## Instalasi

Jalankan perintah berikut pada terminal proyek Anda:

```bash
npm install news-cms-module ejs express-session mysql2
```

## Panduan Penggunaan (app.js)

```javascript
const express = require('express');
const path = require('path');
const newsModule = require('news-cms-module');

const app = express();

const dbConfig = {
    database: 'dummy_news',// bisa disesuaikan lagi
    username: 'root',
    password: 'your_password',
    host: 'localhost',};

const PORT = 3000;

async function startServer() {
    // 1. Middleware Global & View Engine
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Public asset untuk akses gambar berita
    app.use(express.static('public'))
    
    // WAJIB: Atur EJS agar tampilan modul dapat dirender
    app.set('view engine', 'ejs');

    // 2. Inisialisasi Modul News
    // Package dijalankan secara ASYNC karena sinkronisasi database
    const newsRouter = await newsModule(dbConfig, { 
        adminRoutePrefix: '/cms-admin',
        sessionSecret: 'news_cms_secret_key'});

    // 3. Pasang Router ke Prefix URL Host
    app.use('/berita', newsRouter);

    // 4. Jalankan Server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`User Interface: http://localhost:${PORT}/berita/list`);
        console.log(`Admin Dashboard: http://localhost:${PORT}/berita/cms-admin/dashboard`);
    });
}

startServer();
```

pastikan untuk menyesuaikan bagian authAdminMiddleware pada module  di bagian middlewares. Sesuaikan dengan preferensi tabel user masing-masing.