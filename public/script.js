/**
 * ==========================================
 * DOKUMENTASI PENGGUNAAN SPOTIFY DOWNLOADER
 * ==========================================
 * * 1.  **Masukkan URL:** Pengguna menempelkan link lagu Spotify ke dalam kolom input.
 * 2.  **Klik Download:** Tombol "Download Music" atau tombol Enter ditekan.
 * 3.  **Proses:**
 * - Tampilan input disembunyikan.
 * - Tampilan loading ditampilkan untuk memberi umpan balik visual.
 * - Permintaan fetch dikirim ke endpoint backend `/api` dengan URL.
 * 4.  **Hasil:**
 * - **Sukses:** Backend mengembalikan data JSON berisi info lagu dan URL unduhan.
 * - Tampilan loading disembunyikan.
 * - Elemen HTML pada tampilan hasil diperbarui dengan data yang diterima.
 * - Tampilan hasil ditampilkan.
 * - **Gagal:** Backend mengembalikan pesan error.
 * - Tampilan loading disembunyikan.
 * - Tampilan input ditampilkan kembali.
 * - Pesan alert muncul menjelaskan error.
 * 5.  **Download Another:** Klik "Download another" untuk kembali ke tampilan awal dan memulai ulang.
 * * **PENTING:** Logika fetch API dan penanganan data JSON di bawah ini SAMA PERSIS
 * dengan versi sebelumnya untuk memastikan kompatibilitas dengan backend.
 */

// --- Referensi Elemen DOM ---
const views = {
    input: document.getElementById('inputView'),
    loading: document.getElementById('loadingView'),
    result: document.getElementById('resultView')
};

const elements = {
    urlInput: document.getElementById('spotifyUrl'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    albumArt: document.getElementById('albumArt'),
    trackTitle: document.getElementById('trackTitle'),
    artistName: document.getElementById('artistName'),
    durationTxt: document.getElementById('durationTxt'),
    sizeTxt: document.getElementById('sizeTxt'),
    dlLink: document.getElementById('dlLink')
};

// --- Fungsi Helper untuk Mengganti Tampilan ---
function switchView(viewName) {
    Object.values(views).forEach(view => view.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
}

// --- Event Listener Utama ---
elements.downloadBtn.addEventListener('click', async () => {
    const url = elements.urlInput.value.trim();

    if (!url) {
        alert("Please paste a valid Spotify link first.");
        return;
    }

    // Tampilkan Loading View
    switchView('loading');

    try {
        // --- LOGIKA BACKEND FETCH (TIDAK DIUBAH) ---
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();
        // -------------------------------------------

        if (response.ok) {
            // Update Tampilan Hasil dengan Data
            elements.albumArt.src = data.cover;
            elements.trackTitle.innerText = data.title;
            elements.artistName.innerText = data.artist;
            // Menggunakan data dummy dari backend jika API tidak menyediakan
            elements.durationTxt.innerText = data.duration || "N/A";
            elements.sizeTxt.innerText = data.size || "N/A";
            elements.dlLink.href = data.download_url;

            // Tampilkan Result View
            switchView('result');
        } else {
            throw new Error(data.error || "Failed to fetch data.");
        }

    } catch (err) {
        alert("Error: " + err.message);
        // Kembali ke Input View jika gagal
        switchView('input');
    }
});

// Event Listener untuk Tombol Reset
elements.resetBtn.addEventListener('click', () => {
    elements.urlInput.value = ''; // Kosongkan input
    switchView('input'); // Kembali ke tampilan awal
});

// Event Listener untuk Tombol Enter di Input
elements.urlInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        elements.downloadBtn.click();
    }
});

// Set tampilan awal
switchView('input');
