const M3U_URL = "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";
const video = document.getElementById('tv-player');
const grid = document.getElementById('channel-grid');
let hls = new Hls();
let allChannels = [];

async function loadIPTV() {
    try {
        const response = await fetch(M3U_URL);
        const data = await response.text();
        const lines = data.split('\n');
        
        let current = {};
        lines.forEach(line => {
            if (line.startsWith('#EXTINF:')) {
                current.name = line.split(',')[1] || "Canal";
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                current.logo = logoMatch ? logoMatch[1] : 'https://via.placeholder.com/60';
            } else if (line.startsWith('http')) {
                current.url = line.trim();
                allChannels.push(current);
                current = {};
            }
        });
        render(allChannels.slice(0, 100)); // Mostra os primeiros 100
        document.getElementById('loading-status').innerText = "Canais carregados com sucesso!";
    } catch (e) {
        document.getElementById('loading-status').innerText = "Erro ao conectar com a fonte.";
    }
}

function render(list) {
    grid.innerHTML = '';
    list.forEach(ch => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.onclick = () => play(ch.url, ch.name);
        div.innerHTML = `<img src="${ch.logo}"><p>${ch.name}</p>`;
        grid.appendChild(div);
    });
}

function play(url, name) {
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('playing-now').innerText = name;
    video.muted = true;
    if (Hls.isSupported() && url.includes('m3u8')) {
        hls.destroy(); hls = new Hls();
        hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else { video.src = url; video.play(); }
}

window.toggleMute = () => {
    video.muted = !video.muted;
    document.getElementById('btn-audio').classList.toggle('btn-danger', video.muted);
    document.getElementById('btn-audio').innerHTML = video.muted ? '<i class="fas fa-volume-up"></i> ATIVAR SOM' : '<i class="fas fa-volume-mute"></i> MUDO';
};

window.filterChannels = () => {
    const val = document.getElementById('search').value.toLowerCase();
    const filtered = allChannels.filter(c => c.name.toLowerCase().includes(val));
    render(filtered.slice(0, 100));
};

window.closePlayer = () => { document.getElementById('player-section').style.display = 'none'; video.pause(); };

loadIPTV();
