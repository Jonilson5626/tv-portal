const M3U_URL = "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";
const PROXY = "https://api.allorigins.win/raw?url=";

const video = document.getElementById('tv-player');
const grid = document.getElementById('channel-grid');
const statusText = document.getElementById('loading-status');
let hls = new Hls();
let allChannels = [];

async function loadIPTV() {
    try {
        statusText.innerText = "Sincronizando com a rede Free-TV...";
        
        const response = await fetch(PROXY + encodeURIComponent(M3U_URL));
        const data = await response.text();
        const lines = data.split('\n');
        
        allChannels = [];
        let current = {};

        lines.forEach(line => {
            if (line.startsWith('#EXTINF:')) {
                // Captura o nome e os metadados (Logo e Grupo)
                const namePart = line.split(',')[1] || "Canal";
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                const groupMatch = line.match(/group-title="([^"]+)"/);
                
                current = {
                    name: namePart.trim(),
                    logo: logoMatch ? logoMatch[1] : 'https://via.placeholder.com/150/1e293b/ffffff?text=TV',
                    group: groupMatch ? groupMatch[1] : 'Geral'
                };
            } else if (line.startsWith('http')) {
                current.url = line.trim();
                // Apenas canais que não estão na categoria 'Invalid' do repositório
                if (current.name && !current.group.toLowerCase().includes('invalid')) {
                    allChannels.push(current);
                }
                current = {};
            }
        });

        statusText.innerText = `${allChannels.length} canais HD/SD verificados`;
        render(allChannels.slice(0, 50)); 

    } catch (e) {
        statusText.innerText = "Erro ao conectar com a fonte M3U8.";
    }
}

function render(list) {
    grid.innerHTML = '';
    list.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'item-card';
        
        // Identifica os ícones especiais da fonte
        let infoBadge = "";
        if (ch.name.includes('Ⓖ')) infoBadge += '<span class="badge geo">GEO</span>';
        if (ch.name.includes('Ⓨ')) infoBadge += '<span class="badge yt">YT</span>';
        if (ch.name.includes('Ⓢ')) infoBadge += '<span class="badge sd">SD</span>';

        card.onclick = () => play(ch.url, ch.name);
        card.innerHTML = `
            <div class="img-container">
                <img src="${ch.logo}" loading="lazy" onerror="this.src='https://via.placeholder.com/80?text=IPTV'">
            </div>
            <p>${ch.name}</p>
            <div class="tags">${infoBadge} <small>${ch.group}</small></div>
        `;
        grid.appendChild(card);
    });
}

function play(url, name) {
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('playing-now').innerText = name;
    
    video.muted = true;
    if (Hls.isSupported()) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(()=>{}));
    } else {
        video.src = url;
        video.play().catch(()=>{});
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
}

window.filterChannels = () => {
    const val = document.getElementById('search').value.toLowerCase();
    const filtered = allChannels.filter(c => 
        c.name.toLowerCase().includes(val) || 
        c.group.toLowerCase().includes(val)
    );
    render(filtered.slice(0, 50));
};

loadIPTV();
