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

const defaultUsers = [{ user: "9¹", pass: "91" }, { user: "admin", pass: "admin123" }];
for (let i = 1; i <= 25; i++) { defaultUsers.push({ user: "user" + i, pass: "pass" + i }); }

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const uInput = document.getElementById('username').value.trim();
    const pInput = document.getElementById('password').value.trim();

    const snapCustom = await database.ref('users_custom/' + uInput).once('value');
    const customData = snapCustom.val();
    const isDefault = defaultUsers.find(u => u.user === uInput && u.pass === pInput);
    const isCustom = customData && customData.pass === pInput;

    if (isDefault || isCustom) {
        const snapBan = await database.ref('status_user/' + uInput).once('value');
        if (snapBan.val() === "banned") return alert("AKSES DIBLOKIR!");

        const cekOnline = await database.ref('log_online/' + uInput).once('value');
        if (uInput !== "admin" && cekOnline.exists()) {
            if (Date.now() - (cekOnline.val().last_seen || 0) < 20000) return alert("Akun sedang aktif!");
        }

        localStorage.setItem('savedUser', uInput);
        database.ref('log_online/' + uInput).set({
            username: uInput, last_seen: firebase.database.ServerValue.TIMESTAMP, jam: new Date().toLocaleTimeString('id-ID')
        });
        database.ref('log_online/' + uInput).onDisconnect().remove();

        if (uInput === "admin") { tampilkanLogAdmin(); }
        else { window.location.href = "page91.html"; }
    } else { alert('User/Pass Salah!'); }
});

// FITUR KELOLA ROLE ADMIN CHAT
window.setRole = function(role) {
    const user = document.getElementById('adminUser').value.trim();
    if(!user) return alert("Isi nama usernya dulu!");
    database.ref('roles/' + user).set(role).then(() => {
        alert("Status " + user + " berhasil diubah jadi " + role);
        document.getElementById('adminUser').value = "";
    });
};

window.tambahUserCustom = function() {
    const u = document.getElementById('customUser').value.trim();
    const p = document.getElementById('customPass').value.trim();
    if(!u || !p) return alert("Isi dulu Bos!");
    database.ref('users_custom/' + u).set({ user: u, pass: p })
    .then(() => { alert("User " + u + " tersimpan!"); document.getElementById('customUser').value=""; document.getElementById('customPass').value=""; });
};

function tampilkanLogAdmin() {
    document.getElementById('adminPanel').style.display = 'block';
    
    database.ref('log_online').on('value', snap => {
        const list = document.getElementById('onlineList');
        list.innerHTML = "";
        snap.forEach(c => {
            const nama = c.val().username || c.key;
            list.innerHTML += `<li class="list-item"><span>🟢 ${nama}</span><button type="button" onclick="banUser('${nama}')" style="background:red;color:#fff;border:none;font-size:10px;padding:2px 5px;border-radius:3px;">BAN</button></li>`;
        });
    });

    database.ref('status_user').on('value', snap => {
        const bList = document.getElementById('bannedList');
        bList.innerHTML = "";
        snap.forEach(c => {
            if(c.val() === "banned") {
                bList.innerHTML += `<li class="list-item"><span>🚫 ${c.key}</span><button type="button" onclick="unbanUser('${c.key}')" style="background:green;color:#fff;border:none;font-size:10px;padding:2px 5px;border-radius:3px;">UNBAN</button></li>`;
            }
        });
    });
}

window.banUser = function(t) {
    if (t === "admin" || t === "9¹") return;
    if (confirm("Ban " + t + "?")) { database.ref('status_user/' + t).set("banned"); database.ref('log_online/' + t).remove(); }
};

window.unbanUser = function(t) {
    if (confirm("Unban " + t + "?")) database.ref('status_user/' + t).remove();
};

window.updateWebSekarang = function() {
    const t = document.getElementById('inputTeks').value;
    const d = parseInt(document.getElementById('timerUpdate').value);
    const exp = d > 0 ? Date.now() + (d * 3600000) : null;
    database.ref('konten_web').set({ pesan: t, waktu: new Date().toLocaleString(), exp: exp }).then(() => alert("Pesan Terupdate!"));
};

window.updateJadwalSistem = function() {
    const j = document.getElementById('pilihJenisJadwal').value;
    const h = document.getElementById('pilihHari').value;
    const i = document.getElementById('isiJadwalBaru').value;
    database.ref('data_kelas/' + j + '/' + h).set(i).then(() => alert("Jadwal Berhasil!"));
};

window.hapusLogServer = function() {
    if(confirm("Bersihkan log?")) database.ref('log_online').remove();
};

setInterval(() => {
    const skrg = Date.now();
    database.ref('log_online').once('value', s => {
        s.forEach(c => { if (skrg - (c.val().last_seen || 0) > 20000) c.ref.remove(); });
    });
}, 10000);
