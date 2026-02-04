const firebaseConfig = {
    apiKey: "AIzaSyDlucMVwMUbw7Ab3t2AVzI13EOHUrqDNZw",
    authDomain: "web-kelas-5b83a.firebaseapp.com",
    databaseURL: "https://web-kelas-5b83a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "web-kelas-5b83a",
    storageBucket: "web-kelas-5b83a.firebasestorage.app",
    messagingSenderId: "711947014423",
    appId: "1:711947014423:web:d8cb787c503d7d7538e752",
    measurementId: "G-RYNNLZCGY5"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. DATABASE USER (LENGKAP 25 USER)
const dataUsers = [
    { user: "9¹", pass: "91" }, { user: "admin", pass: "admin123" },
    ...Array.from({length: 25}, (_, i) => ({ user: `user${i+1}`, pass: `pass${i+1}` }))
];

// 4. LOGIKA LOGIN (FIX ANTI-NYANGKUT)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const valid = dataUsers.find(u => u.user === user && u.pass === pass);

    if (valid) {
        const snapBan = await database.ref('status_user/' + user).once('value');
        if (snapBan.val() === "banned") return alert("Akses dilarang! Anda di-BAN.");

        const cekOnline = await database.ref('log_online/' + user).once('value');
        if (user !== "admin" && cekOnline.exists()) {
            const selisih = Date.now() - cekOnline.val().last_seen;
            if (selisih < 20000) return alert("Akun '" + user + "' masih aktif di perangkat lain!");
        }

        localStorage.setItem('savedUser', user);
        database.ref('log_online/' + user).set({
            username: user, last_seen: firebase.database.ServerValue.TIMESTAMP, jam: new Date().toLocaleTimeString()
        });
        database.ref('log_online/' + user).onDisconnect().remove();

        if (user === "admin") { 
            tampilkanLogAdmin(); 
            mulaiPembersihOtomatis(); 
            alert("Mode Owner Aktif!");
        } else { 
            window.location.href = "page91.html"; 
        }
    } else { alert("User/Pass Salah!"); }
});

// FUNGSI ADMIN: UPDATE PESAN
window.updateWebSekarang = function() {
    const t = document.getElementById('inputTeks').value;
    const d = parseInt(document.getElementById('timerUpdate').value);
    const exp = d > 0 ? Date.now() + (d * 3600000) : null;
    database.ref('konten_web').set({ pesan: t, waktu: new Date().toLocaleString(), exp: exp }).then(() => alert("Pesan Ter-Update!"));
};

// FUNGSI ADMIN: UPDATE JADWAL
window.updateJadwalSistem = function() {
    const jenis = document.getElementById('pilihJenisJadwal').value;
    const hari = document.getElementById('pilihHari').value;
    const isi = document.getElementById('isiJadwalBaru').value;
    database.ref('data_kelas/' + jenis + '/' + hari).set(isi).then(() => alert("Jadwal " + hari + " Berhasil!"));
};

// MONITORING ADMIN
function tampilkanLogAdmin() {
    document.getElementById('adminPanel').style.display = 'block';
    database.ref('log_online').on('value', snap => {
        const list = document.getElementById('onlineList');
        list.innerHTML = "";
        snap.forEach(c => {
            list.innerHTML += `<li style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>🟢 ${c.val().username}</span>
                <button type="button" onclick="banUser('${c.val().username}')" style="background:red; color:white; border:none; padding:2px 5px; border-radius:3px;">BAN</button>
            </li>`;
        });
    });
}

window.banUser = function(t) {
    if(confirm("Ban "+t+"?")) { database.ref('status_user/'+t).set("banned"); database.ref('log_online/'+t).remove(); }
};

window.hapusLogServer = function() {
    if(confirm("Bersihkan riwayat?")) database.ref('log_online').remove();
};

function mulaiPembersihOtomatis() {
    setInterval(() => {
        const skrg = Date.now();
        database.ref('log_online').once('value', s => {
            s.forEach(c => { if(skrg - c.val().last_seen > 20000) c.ref.remove(); });
        });
        database.ref('konten_web').once('value', s => {
            if(s.val()?.exp && skrg > s.val().exp) database.ref('konten_web').remove();
        });
    }, 10000);
}
