// Referensi UI
const ui = {
    inputView: document.getElementById('view-input'),
    loadingView: document.getElementById('view-loading'),
    resultView: document.getElementById('view-result'),
    
    urlInput: document.getElementById('spotifyUrl'),
    downloadBtn: document.getElementById('downloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Result Elements
    img: document.getElementById('albumArt'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('artistName'),
    duration: document.getElementById('durationTxt'),
    size: document.getElementById('sizeTxt'),
    linkBtn: document.getElementById('dlLink') // Menggunakan button ID
};

// Global variable untuk menyimpan URL download
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

// FUNGSI UTAMA: Download Otomatis tanpa redirect
async function triggerDownload(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        // Fallback jika terjadi CORS error pada fetch langsung
        window.location.href = url;
    }
}

// Handler Tombol Download Utama
ui.downloadBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    if (!url) {
        alert("Please paste a Spotify URL first!");
        return;
    }

    showView('loading');

    try {
        // --- FETCH KE BACKEND ---
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();

        if (response.ok) {
            // --- UPDATE DATA KE UI SESUAI GAMBAR ---
            
            // 1. Tampilkan Foto/Album Art
            if (data.cover) {
                ui.img.src = data.cover;
                ui.img.style.display = 'block';
            } else {
                ui.img.style.display = 'none';
            }

            // 2. Tampilkan Nama Artis & Judul
            ui.title.innerText = data.title || "Unknown Title";
            ui.artist.innerText = data.artist || "Unknown Artist";
            
            // 3. Tampilkan Metadata (Durasi & Size)
            ui.duration.innerText = data.duration || "N/A";
            ui.size.innerText = data.size || "5.05 MB"; // Data size muncul disini
            
            // Simpan URL dan Nama File untuk tombol download konfirmasi
            currentDownloadUrl = data.download_url;
            currentFileName = `${data.title || 'music'}.mp3`;

            showView('result');
        } else {
            throw new Error(data.error || "Failed to process");
        }
    } catch (error) {
        alert("Error: " + error.message);
        showView('input');
    }
});

// Handler Tombol Konfirmasi Download (Memicu Download Langsung)
ui.linkBtn.addEventListener('click', () => {
    if(currentDownloadUrl) {
        triggerDownload(currentDownloadUrl, currentFileName);
    }
});

// Handler Tombol Reset
ui.resetBtn.addEventListener('click', () => {
    ui.urlInput.value = '';
    currentDownloadUrl = "";
    showView('input');
});

// Enter Key Support
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ui.downloadBtn.click();
});

showView('input');
