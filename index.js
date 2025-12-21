/**
 * Fungsi utama package yang di-export.
 * @param {object} dbConfig - Konfigurasi koneksi database dari aplikasi pengguna.
 * @param {object} options - Opsi tambahan (misalnya, nama folder views pengguna).
 * @returns {express.Router} Router Express yang sudah terkonfigurasi.
 */


const express = require('express');
const session = require('express-session');
const initModels = require('./models'); 
const initServices = require('./services'); 
const setupRoutes = require('./routes');
const mergeConfig = require('./config');

/**
 * Fungsi utama package yang di-export.
 * @param {object} dbConfig - Konfigurasi koneksi database dari aplikasi pengguna.
 * @param {object} userOptions - Opsi tambahan (misalnya, autoMigrate) dari pengguna.
 * @returns {express.Router} Router Express yang sudah terkonfigurasi.
 */

module.exports = async (dbConfig, userOptions = {}) => {
    
    if (!dbConfig || !dbConfig.database) {
        throw new Error('News module requires database configuration (dbConfig).');
    }
    
    const finalConfig = mergeConfig({
        ...userOptions,
        db: dbConfig 
    });

    const db = initModels(finalConfig.db); 
    
    if (finalConfig.autoMigrate !== false) {
        try {
            console.log('News module: Synchronizing database tables...');
            await db.syncTables({ alter: true }); 
            console.log('News module: Synchronization complete.');
        } catch (error) {
            console.error('ERROR: News module failed to synchronize database tables.', error);
            throw error; 
        }
    }
    

    const services = initServices(db);

    const router = express.Router();
    
    router.use(express.json());
    router.use(express.urlencoded({ extended: true }));
    router.use(session({
        secret: userOptions.sessionSecret || 'news_module_default_secret',
        resave: false,
        saveUninitialized: true,
        cookie: { 
            maxAge: 24 * 60 * 60 * 1000,
            secure: false // Set true jika aplikasi Anda menggunakan HTTPS
        }
    }));

    setupRoutes(router, services, finalConfig);

    return router;
};