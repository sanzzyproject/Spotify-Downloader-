// Referensi UI Elements
const ui = {
    inputView: document.getElementById('view-input'),
    loadingView: document.getElementById('view-loading'),
    resultView: document.getElementById('view-result'),
    
    urlInput: document.getElementById('spotifyUrl'),
    searchBtn: document.getElementById('searchBtn'), // Tombol Cari
    finalDownloadBtn: document.getElementById('finalDownloadBtn'), // Tombol Download Akhir
    resetBtn: document.getElementById('resetBtn'),
    
    // Result Elements
    img: document.getElementById('albumArt'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('artistName'),
    duration: document.getElementById('durationTxt'),
    size: document.getElementById('sizeTxt')
};

// Variabel untuk menyimpan URL download sementara
let currentDownloadUrl = "";
let currentFileName = "music.mp3";

// Fungsi Ganti Tampilan
function showView(viewName) {
    ui.inputView.classList.add('hidden');
    ui.loadingView.classList.add('hidden');
    ui.resultView.classList.add('hidden');

    if (viewName === 'input') ui.inputView.classList.remove('hidden');
    if (viewName === 'loading') ui.loadingView.classList.remove('hidden');
    if (viewName === 'result') ui.resultView.classList.remove('hidden');
}

// 1. EVENT: Saat Tombol "Download Music" (Search) Ditekan
ui.searchBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    if (!url) {
        alert("Please paste a Spotify URL first!");
        return;
    }

    showView('loading');

    try {
        // --- FETCH KE BACKEND (JANGAN DIUBAH) ---
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();

        if (response.ok) {
            // --- UPDATE DATA KE UI (WAJIB MUNCUL SESUAI GAMBAR) ---
            
            // 1. Update Gambar Album
            if (data.cover) {
                ui.img.src = data.cover;
                ui.img.style.display = 'block';
            } else {
                // Fallback image jika tidak ada cover
                ui.img.src = "https://via.placeholder.com/180?text=No+Cover"; 
            }

            // 2. Update Teks (Judul, Artis, dll)
            ui.title.innerText = data.title || "Unknown Title";
            ui.artist.innerText = data.artist || "Unknown Artist";
            ui.duration.innerText = data.duration || "03:00";
            ui.size.innerText = data.size || "5.0 MB";

            // 3. Simpan Link Download ke Variabel Global
            currentDownloadUrl = data.download_url;
            // Buat nama file aman untuk didownload
            currentFileName = `${data.artist} - ${data.title}.mp3`.replace(/[^a-z0-9 \.-]/gi, '');

            // 4. Tampilkan Hasil
            showView('result');

        } else {
            throw new Error(data.error || "Failed to process track");
        }
    } catch (error) {
        alert("Error: " + error.message);
        showView('input');
    }
});

// 2. EVENT: Saat Tombol "Download MP3" Ditekan (DIRECT DOWNLOAD)
ui.finalDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah perilaku default

    if (!currentDownloadUrl) {
        alert("Download link not found!");
        return;
    }

    // --- LOGIKA DIRECT DOWNLOAD TANPA REDIRECT ---
    // Cara kerja: Membuat elemen <a> tersembunyi, set atribut download, lalu klik otomatis
    const link = document.createElement('a');
    link.href = currentDownloadUrl;
    link.setAttribute('download', currentFileName); // Memaksa browser mendownload file
    link.style.display = 'none';
    
    // Fallback: Jika atribut 'download' diblokir browser (cross-origin), 
    // gunakan target="_self" untuk memaksa download di frame yang sama
    link.target = "_self"; 

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Handler Tombol Reset (Download Another)
ui.resetBtn.addEventListener('click', () => {
    ui.urlInput.value = '';
    ui.img.src = ''; // Clear image
    showView('input');
});

// Enter Key Support
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ui.searchBtn.click();
});

// Inisialisasi awal
showView('input');
