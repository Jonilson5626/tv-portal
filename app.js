// Proxy necessário para evitar bloqueio de segurança (CORS)
const PROXY = "https://api.allorigins.win/raw?url=";
const M3U_URL = "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";

const video = document.getElementById('tv-player');
const grid = document.getElementById('channel-grid');
const statusText = document.getElementById('loading-status');
let hls = new Hls();
let allChannels = [];

async function initIPTV() {
    try {
        statusText.innerText = "Conectando ao GitHub (Free-TV)...";
        
        const response = await fetch(PROXY + encodeURIComponent(M3U_URL));
        const data = await response.text();
        const lines = data.split('\n');
        
        allChannels = [];
        let current = {};

        lines.forEach(line => {
            if (line.startsWith('#EXTINF:')) {
                const namePart = line.split(',')[1] || "Canal";
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                const groupMatch = line.match(/group-title="([^"]+)"/);
                
                current = {
                    name: namePart.trim(),
                    logo: logoMatch ? logoMatch[1] : 'https://via.placeholder.com/80?text=TV',
                    group: groupMatch ? groupMatch[1] : 'Geral'
                };
            } else if (line.startsWith('http')) {
                current.url = line.trim();
                // Filtra canais inválidos conforme a política do projeto
                if (current.name && !current.group.toLowerCase().includes('invalid')) {
                    allChannels.push(current);
                }
                current = {};
            }
        });

        statusText.innerText = `${allChannels.length} Canais Globais`;
        render(allChannels.slice(0, 60)); // Mostra os primeiros 60 para carregar rápido

    } catch (e) {
        statusText.innerText = "Erro ao baixar playlist.";
        console.error(e);
    }
}

function render(list) {
    grid.innerHTML = '';
    list.forEach(ch => {
        const div = document.createElement('div');
        div.className = 'item-card';
        
        // Identifica marcadores especiais
        let badges = "";
        if (ch.name.includes('Ⓖ')) badges += '<span class="badge geo">GEO</span>';
        if (ch.name.includes('Ⓨ')) badges += '<span class="badge yt">YT</span>';
        if (ch.name.includes('Ⓢ')) badges += '<span class="badge sd">SD</span>';

        div.onclick = () => play(ch.url, ch.name);
        div.innerHTML = `
            <img src="${ch.logo}" loading="lazy" onerror="this.src='https://via.placeholder.com/80?text=TV'">
            <p>${ch.name}</p>
            <div class="tags">${badges}</div>
            <span class="group-tag">${ch.group}</span>
        `;
        grid.appendChild(div);
    });
}

function play(url, name) {
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('playing-now').innerText = name;
    
    video.muted = true; // Necessário para autoplay funcionar
    if (Hls.isSupported()) {
        hls.destroy(); hls = new Hls();
        hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(()=>{}));
    } else {
        video.src = url; video.play().catch(()=>{});
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
}

window.toggleMute = () => {
    video.muted = !video.muted;
    const btn = document.getElementById('btn-audio');
    btn.innerHTML = video.muted ? '<i class="fas fa-volume-up"></i> ATIVAR SOM' : '<i class="fas fa-volume-mute"></i> MUDO';
    btn.classList.toggle('btn-danger', video.muted);
};

window.filterChannels = () => {
    const val = document.getElementById('search').value.toLowerCase();
    const filtered = allChannels.filter(c => 
        c.name.toLowerCase().includes(val) || c.group.toLowerCase().includes(val)
    );
    render(filtered.slice(0, 60));
};

window.closePlayer = () => {
    document.getElementById('player-section').style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
};

initIPTV();
