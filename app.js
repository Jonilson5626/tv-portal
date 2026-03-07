// Usamos um proxy para evitar o erro de bloqueio (CORS) do navegador
const PROXY = "https://api.allorigins.win/raw?url=";
const M3U_URL = "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8";

const video = document.getElementById('tv-player');
const grid = document.getElementById('channel-grid');
const statusText = document.getElementById('loading-status');
let hls = new Hls();
let allChannels = [];

// Função principal que puxa os canais
async function loadIPTV() {
    try {
        statusText.innerText = "Baixando lista global... (isso pode demorar 10s)";
        
        // Tentativa de buscar a lista via Proxy
        const response = await fetch(PROXY + encodeURIComponent(M3U_URL));
        if (!response.ok) throw new Error("Erro na rede");
        
        const data = await response.text();
        const lines = data.split('\n');
        
        let current = {};
        allChannels = []; // Limpa a lista antes de encher

        lines.forEach(line => {
            if (line.startsWith('#EXTINF:')) {
                // Extrai nome e logo
                const name = line.split(',')[1] || "Canal Desconhecido";
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                current = {
                    name: name.trim(),
                    logo: logoMatch ? logoMatch[1] : 'https://via.placeholder.com/150/1e293b/ffffff?text=TV'
                };
            } else if (line.startsWith('http')) {
                current.url = line.trim();
                if (current.name) allChannels.push(current);
                current = {};
            }
        });

        if (allChannels.length > 0) {
            statusText.innerText = `${allChannels.length} Canais Disponíveis`;
            render(allChannels.slice(0, 50)); // Mostra os primeiros 50 para ser rápido
        } else {
            statusText.innerText = "Lista vazia ou formato inválido.";
        }

    } catch (e) {
        console.error(e);
        statusText.innerText = "Erro de conexão. Tente recarregar a página.";
    }
}

function render(list) {
    grid.innerHTML = '';
    list.forEach(ch => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.onclick = () => play(ch.url, ch.name);
        div.innerHTML = `
            <img src="${ch.logo}" loading="lazy">
            <p>${ch.name}</p>
        `;
        grid.appendChild(div);
    });
}

function play(url, name) {
    const playerSection = document.getElementById('player-section');
    const playingNow = document.getElementById('playing-now');
    
    playerSection.style.display = 'block';
    playingNow.innerText = "Ao Vivo: " + name;
    
    // Configuração do vídeo
    video.muted = true;
    if (Hls.isSupported() && (url.includes('m3u8') || url.includes('stream'))) {
        hls.destroy(); 
        hls = new Hls();
        hls.loadSource(url); 
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = url;
        video.play();
    }
    // Rola a tela para o player no celular
    window.scrollTo({top: 0, behavior: 'smooth'});
}

window.toggleMute = () => {
    video.muted = !video.muted;
    const btn = document.getElementById('btn-audio');
    btn.innerHTML = video.muted ? '<i class="fas fa-volume-up"></i> ATIVAR SOM' : '<i class="fas fa-volume-mute"></i> MUDO';
    btn.style.background = video.muted ? "#e11d48" : "#334155";
};

window.closePlayer = () => {
    document.getElementById('player-section').style.display = 'none';
    video.pause();
    hls.destroy();
};

window.filterChannels = () => {
    const val = document.getElementById('search').value.toLowerCase();
    const filtered = allChannels.filter(c => c.name.toLowerCase().includes(val));
    render(filtered.slice(0, 50));
};

// Inicia a carga
loadIPTV();
