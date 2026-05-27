const express = require('express');
const app = express();

// Middleware untuk mem-parsing JSON dari webhook Saweria
app.use(express.json());

// Array memori untuk menyimpan donasi sementara
let donationQueue = [];

// ============================================
// ENDPOINT 1: Menerima Webhook dari Saweria
// (Path ini sekarang persis dengan map lamamu)
// ============================================
app.post('/api/saweria', (req, res) => {
    const data = req.body;

    // Mapping data dari format Saweria ke format script Luau
    const newDonation = {
        nama: data.donator_name || "Anonim",
        amount: parseInt(data.amount_raw) || 0,
        message: data.message || "",
        timestamp: Math.floor(Date.now() / 1000),
        email: data.donator_email || "-",
        id: data.id || `DON-${Math.floor(Math.random() * 999999)}`
    };

    // Masukkan ke antrean
    donationQueue.push(newDonation);
    console.log(`Donasi masuk: ${newDonation.nama} - Rp ${newDonation.amount}`);

    // Balas ke Saweria bahwa webhook sukses diterima
    res.status(200).send("Webhook OK");
});

// ============================================
// ENDPOINT 2: Di-tarik (GET) oleh Script Roblox
// ============================================
app.get('/api/saweria/get-donations', (req, res) => {
    // Kopi data antrean untuk dikirim ke Roblox
    const donationsToSend = [...donationQueue];
    
    // KOSONGKAN antrean agar Roblox tidak membaca donasi yang sama 2x
    donationQueue = [];

    // Format JSON persis seperti yang diharapkan script Luau kamu
    res.json({
        success: true,
        donations: donationsToSend
    });
});

// ============================================
// EXPORT UNTUK VERCEL (Wajib, jangan dihapus)
// ============================================
module.exports = app;
