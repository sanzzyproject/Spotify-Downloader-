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
    link: document.getElementById('dlLink')
};

// Fungsi Ganti Tampilan (Mencegah UI Rusak/Bertumpuk)
function showView(viewName) {
    // Sembunyikan SEMUA dulu
    ui.inputView.classList.add('hidden');
    ui.loadingView.classList.add('hidden');
    ui.resultView.classList.add('hidden');

    // Munculkan yang dipilih
    if (viewName === 'input') ui.inputView.classList.remove('hidden');
    if (viewName === 'loading') ui.loadingView.classList.remove('hidden');
    if (viewName === 'result') ui.resultView.classList.remove('hidden');
}

// Handler Tombol Download
ui.downloadBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    if (!url) {
        alert("Please paste a Spotify URL first!");
        return;
    }

    showView('loading');

    try {
        // --- FETCH KE BACKEND (TETAP SAMA) ---
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();

        if (response.ok) {
            // --- UPDATE DATA KE UI ---
            
            // Fix: Cek apakah cover ada, jika kosong pakai placeholder
            if (data.cover) {
                ui.img.src = data.cover;
                ui.img.style.display = 'block';
            } else {
                ui.img.style.display = 'none'; // Sembunyikan jika tidak ada gambar
            }

            ui.title.innerText = data.title || "Unknown Title";
            ui.artist.innerText = data.artist || "Unknown Artist";
            
            // Handle Badges Data (Fallback jika backend mengirim N/A)
            ui.duration.innerText = data.duration || "MP3";
            ui.size.innerText = data.size || "High Q";
            
            ui.link.href = data.download_url;

            showView('result');
        } else {
            throw new Error(data.error || "Failed to process");
        }
    } catch (error) {
        alert("Error: " + error.message);
        showView('input'); // Kembali ke awal jika error
    }
});

// Handler Tombol Reset (Download Another)
ui.resetBtn.addEventListener('click', () => {
    ui.urlInput.value = '';
    showView('input');
});

// Enter Key Support
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ui.downloadBtn.click();
});

// Inisialisasi awal
showView('input');
