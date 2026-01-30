// Referensi UI Elements
const ui = {
    inputView: document.getElementById('view-input'),
    loadingView: document.getElementById('view-loading'),
    resultView: document.getElementById('view-result'),
    
    urlInput: document.getElementById('spotifyUrl'),
    searchBtn: document.getElementById('searchBtn'),
    finalDownloadBtn: document.getElementById('finalDownloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Result Elements
    img: document.getElementById('albumArt'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('artistName'),
    duration: document.getElementById('durationTxt'),
    size: document.getElementById('sizeTxt')
};

// Variabel Global
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

// 1. EVENT: SEARCH BUTTON
ui.searchBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    if (!url) {
        alert("Please paste a Spotify URL first!");
        return;
    }

    showView('loading');

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const rawData = await response.json();

        if (response.ok) {
            // --- LOGIKA CERDAS MENCARI DATA (PERBAIKAN) ---
            
            // 1. Normalisasi: Kadang API membungkus data dalam 'data', 'result', atau 'metadata'
            let data = rawData;
            if (rawData.data) data = rawData.data;
            else if (rawData.result) data = rawData.result;
            else if (rawData.metadata) data = rawData.metadata;

            console.log("Track Data:", data); // Debug di console jika masih error

            // 2. Ambil URL Cover (Cek berbagai kemungkinan nama key)
            const coverUrl = data.cover || data.image || data.thumbnail || data.album_art || "";
            
            if (coverUrl) {
                ui.img.src = coverUrl;
                ui.img.style.display = 'block';
            } else {
                ui.img.src = "https://via.placeholder.com/180?text=No+Cover";
            }

            // 3. Ambil Judul & Artis (Cek berbagai kemungkinan nama key)
            ui.title.innerText = data.title || data.name || data.song || "Unknown Title";
            ui.artist.innerText = data.artist || data.author || "Unknown Artist";
            
            // 4. Ambil Meta info
            ui.duration.innerText = data.duration || "03:00";
            ui.size.innerText = data.size || "High Q";

            // 5. Siapkan Link Download (Direct)
            currentDownloadUrl = data.download_url || data.link || data.url;
            
            // Buat nama file bersih
            const safeTitle = (data.title || "audio").replace(/[^a-z0-9]/gi, '_');
            currentFileName = `${safeTitle}.mp3`;

            showView('result');

        } else {
            throw new Error(rawData.error || "Failed to fetch data");
        }
    } catch (error) {
        alert("Error: " + error.message);
        showView('input');
    }
});

// 2. EVENT: DOWNLOAD BUTTON (Direct Download Logic)
ui.finalDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!currentDownloadUrl) {
        alert("Download link not ready yet.");
        return;
    }

    // Teknik Direct Download tanpa Redirect
    const link = document.createElement('a');
    link.href = currentDownloadUrl;
    link.setAttribute('download', currentFileName);
    link.style.display = 'none';
    link.target = "_self"; // Memaksa tetap di halaman yang sama

    document.body.appendChild(link);
    link.click();
    
    // Bersihkan elemen link setelah klik
    setTimeout(() => {
        document.body.removeChild(link);
    }, 100);
});

// Handler Reset
ui.resetBtn.addEventListener('click', () => {
    ui.urlInput.value = '';
    ui.img.src = '';
    showView('input');
});

// Enter Key
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ui.searchBtn.click();
});

// Init
showView('input');
