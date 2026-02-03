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
window.onload = createRain;

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

// 4. LOGIKA LOGIN
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

        currentUserSession = user;
        const waktu = new Date().toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' });
        database.ref('log_online/' + user).set({ username: user, jam: waktu });

        if (user === "admin") {
            alert('Mode Owner Aktif!');
            tampilkanLogAdmin();
        } else {
            alert('Login Berhasil!');
            window.location.href = "page91.html";
        }
    } else {
        alert('Username atau Password salah!');
    }
});

// 5. FUNGSI HAPUS RIWAYAT (PERBAIKAN)
// Fungsi ini harus ada di lingkup global agar bisa dipanggil onclick dari HTML
window.hapusLogServer = function() {
    if(confirm("Hapus semua riwayat login di server?")) {
        database.ref('log_online').remove()
        .then(() => {
            alert("Log Berhasil Dibersihkan!");
            const list = document.getElementById('onlineList');
            if (list) list.innerHTML = "<li>Riwayat kosong.</li>";
        })
        .catch((error) => {
            alert("Gagal menghapus: " + error.message);
        });
    }
};

// 6. FITUR BAN & UNBAN
window.banUser = function(target) {
    if (target === "admin" || target === "9¹") return alert("Bos tidak bisa diban!");
    if (confirm("Ban " + target + "?")) {
        database.ref('status_user/' + target).set("banned");
        database.ref('log_online/' + target).remove();
        alert(target + " berhasil diban!");
    }
};

window.bukaBlokir = function(target) {
    database.ref('status_user/' + target).remove();
    alert("Akses " + target + " dipulihkan.");
};

// 7. TAMPILAN LOG ADMIN
function tampilkanLogAdmin() {
    const list = document.getElementById('onlineList');
    const panel = document.getElementById('adminPanel');
    if (panel) panel.style.display = 'block';

    database.ref('log_online').on('value', (snapshot) => {
        const logs = snapshot.val();
        if (list) {
            list.innerHTML = ""; 
            if (logs) {
                Object.values(logs).reverse().forEach(data => {
                    const li = document.createElement('li');
                    li.style.cssText = "padding:10px 0; border-bottom:1px solid #333; font-size:12px;";
                    li.innerHTML = `
                        🟢 <b>${data.username}</b> <span style="color:#888;">(${data.jam})</span>
                        <div style="margin-top:5px;">
                            <button onclick="banUser('${data.username}')" style="background:red; color:white; border:none; padding:2px 5px; border-radius:3px; cursor:pointer;">BAN</button>
                            <button onclick="bukaBlokir('${data.username}')" style="background:green; color:white; border:none; padding:2px 5px; border-radius:3px; cursor:pointer; margin-left:5px;">UNBAN</button>
                        </div>
                    `;
                    list.appendChild(li);
                });
            } else {
                list.innerHTML = "<li>Tidak ada user online.</li>";
            }
        }
    });
}

// 8. AUTO CLEANUP SAAT KELUAR
window.addEventListener('beforeunload', () => {
    if (currentUserSession && currentUserSession !== "admin") {
        database.ref('log_online/' + currentUserSession).remove();
    }
});
