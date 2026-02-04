// 1. KONFIGURASI FIREBASE (PASTIKAN TETAP SEPERTI INI)
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
let currentUserSession = null;

// 2. FUNGSI HUJAN
function createRain() {
    const container = document.querySelector('.background-container');
    if (!container) return;
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.classList.add('drop');
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDuration = Math.random() * 2 + 1 + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(drop);
    }
}

// 3. DATABASE USER
const dataUsers = [
    { user: "9¹", pass: "91" }, { user: "admin", pass: "admin123" },
    { user: "user1", pass: "pass1" }, { user: "user2", pass: "pass2" },
    { user: "user3", pass: "pass3" }, { user: "user4", pass: "pass4" },
    { user: "user5", pass: "pass5" }, { user: "user6", pass: "pass6" },
    { user: "user7", pass: "pass7" }, { user: "user8", pass: "pass8" },
    { user: "user9", pass: "pass9" }, { user: "user10", pass: "pass10" },
    { user: "user11", pass: "pass11" }, { user: "user12", pass: "pass12" },
    { user: "user13", pass: "pass13" }, { user: "user14", pass: "pass14" },
    { user: "user15", pass: "pass15" }, { user: "user16", pass: "pass16" },
    { user: "user17", pass: "pass17" }, { user: "user18", pass: "pass18" },
    { user: "user19", pass: "pass19" }, { user: "user20", pass: "pass20" },
    { user: "user21", pass: "pass21" }, { user: "user22", pass: "pass22" },
    { user: "user23", pass: "pass23" }, { user: "user24", pass: "pass24" },
    { user: "user25", pass: "pass25" }
];

// 4. LOGIKA LOGIN (ANTI-NYANGKUT + 1 USER 1 HP)
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const validUser = dataUsers.find(u => u.user === user && u.pass === pass);

    if (validUser) {
        const snapshot = await database.ref('status_user/' + user).once('value');
        if (snapshot.exists() && snapshot.val() === "banned") {
            alert("MAAF! Anda telah diban dari sistem.");
            return;
        }

        // BUAT KUNCI SESI UNIK
        const uniqueSession = "SESSION_" + Date.now();
        currentUserSession = user;
        const waktu = new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        localStorage.setItem('savedUser', user);
        localStorage.setItem('sessionID', uniqueSession); // Simpan kunci di HP ini
        
        const userLogRef = database.ref('log_online/' + user);
        
        // Simpan data ke server (Termasuk sessionID)
        userLogRef.set({ 
            username: user, 
            jam: waktu,
            sessionID: uniqueSession,
            last_seen: firebase.database.ServerValue.TIMESTAMP 
        });

        userLogRef.onDisconnect().remove();

        if (user === "admin") {
            alert('Mode Owner Aktif!');
            tampilkanLogAdmin(); 
            mulaiPembersihOtomatis();
        } else {
            alert('Login Berhasil!');
            window.location.href = "page91.html";
        }
    } else {
        alert('Username atau Password salah!');
    }
});

// 5. FUNGSI HAPUS RIWAYAT
window.hapusLogServer = function() {
    if(confirm("Hapus semua riwayat login di server?")) {
        database.ref('log_online').remove().then(() => alert("Log Bersih!"));
    }
};

// 6. FITUR BAN & UNBAN
window.banUser = function(target) {
    if (target === "admin" || target === "9¹") return alert("Bos tidak bisa diban!");
    if (confirm("Ban " + target + "?")) {
        database.ref('status_user/' + target).set("banned");
        database.ref('log_online/' + target).remove();
    }
};

window.bukaBlokir = function(target) {
    database.ref('status_user/' + target).remove();
    alert("Akses dipulihkan.");
};

// 7. TAMPILAN LOG ADMIN (REALTIME + SAPU OTOMATIS)
function tampilkanLogAdmin() {
    const list = document.getElementById('onlineList');
    const panel = document.getElementById('adminPanel');
    if (panel) panel.style.display = 'block';

    database.ref().on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const onlineLogs = data.log_online || {};
        const bannedUsers = data.status_user || {};
        
        if (list) {
            list.innerHTML = ""; 

            Object.keys(bannedUsers).forEach(username => {
                const li = document.createElement('li');
                li.style.cssText = "padding:10px 0; border-bottom:1px solid #ff4d4d; font-size:12px; color: #ff4d4d;";
                li.innerHTML = `🚫 <b>${username}</b> [BAN] <button onclick="bukaBlokir('${username}')" style="float:right; background:green; color:white; border:none; border-radius:3px;">UNBAN</button>`;
                list.appendChild(li);
            });

            Object.values(onlineLogs).reverse().forEach(user => {
                if (bannedUsers[user.username]) return;
                const li = document.createElement('li');
                li.style.cssText = "padding:10px 0; border-bottom:1px solid #333; font-size:12px;";
                li.innerHTML = `🟢 <b>${user.username}</b> <span style="color:#888;">(${user.jam})</span> <button onclick="banUser('${user.username}')" style="float:right; background:red; color:white; border:none; border-radius:3px;">BAN</button>`;
                list.appendChild(li);
            });

            if (list.innerHTML === "") list.innerHTML = "<li>Belum ada aktivitas...</li>";
        }
    });
}

// FUNGSI SAPU OTOMATIS
function mulaiPembersihOtomatis() {
    setInterval(() => {
        const sekarang = Date.now();
        database.ref('log_online').once('value', (snapshot) => {
            snapshot.forEach((child) => {
                const val = child.val();
                if (val.last_seen && sekarang - val.last_seen > 10000) {
                    child.ref.remove();
                }
            });
        });
    }, 5000);
}

// 8. AUTO-RUN
window.onload = function() {
    createRain();
    if (currentUserSession === "admin") tampilkanLogAdmin();
};

// 9. FUNGSI RIWAYAT KLIK TEKS 91
window.bukaLogPribadi = function() {
    const userKita = currentUserSession || localStorage.getItem('savedUser');
    if (!userKita) return alert("Login dulu!");
    database.ref('riwayat_pribadi/' + userKita).limitToLast(5).once('value', (snapshot) => {
        let text = `📜 Riwayat Login (${userKita}):\n\n`;
        if (snapshot.exists()) {
            snapshot.forEach(child => { text += `• ${child.val().waktu}\n`; });
            alert(text);
        } else { alert("Belum ada riwayat."); }
    });
};
