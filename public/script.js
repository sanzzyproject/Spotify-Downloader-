document.getElementById('downloadBtn').addEventListener('click', async () => {
    const input = document.getElementById('spotifyUrl');
    const url = input.value;
    const btn = document.getElementById('downloadBtn');
    
    // UI Elements
    const resultArea = document.getElementById('resultArea');
    const img = document.getElementById('albumArt');
    const title = document.getElementById('trackTitle');
    const artist = document.getElementById('artistName');
    const dlLink = document.getElementById('dlLink');

    if (!url) {
        alert("Please enter a URL");
        return;
    }

    // Loading State
    btn.innerText = "...";
    btn.disabled = true;

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();

        if (response.ok) {
            // Update UI with Data
            img.src = data.cover;
            title.innerText = data.title;
            artist.innerText = data.artist;
            dlLink.href = data.download_url;
            
            // Show Result
            resultArea.classList.remove('hidden');
        } else {
            alert("Error: " + data.error);
        }

    } catch (err) {
        alert("Something went wrong.");
        console.error(err);
    } finally {
        // Reset State
        btn.innerText = "GO";
        btn.disabled = false;
    }
});

// Allow Enter key
document.getElementById('spotifyUrl').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('downloadBtn').click();
    }
});
