const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const playingNowText = document.getElementById('playing-now');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');

let hls = new Hls();
let currentType = 'canais'; 
let currentCountryPath = ""; 

const countries = [
    { name: "Brasil", path: "brazil", code: "br", emoji: "🇧🇷" },
    { name: "USA", path: "united_states", code: "us", emoji: "🇺🇸" },
    { name: "Espanha", path: "spain", code: "es", emoji: "🇪🇸" },
    { name: "Japão", path: "japan", code: "jp", emoji: "🇯🇵" },
    { name: "China", path: "china", code: "cn", emoji: "🇨🇳" },
    { name: "Colômbia", path: "colombia", code: "co", emoji: "🇨🇴" }
];

// --- FUNÇÕES DO PLAYER (TOGGLE) ---

// 1. Alternar Som (Ativar/Desativar)
window.toggleMute = () => {
    const audioBtn = document.getElementById('btn-audio-toggle');
    
    if (video.muted) {
        video.muted = false;
        unmuteOverlay.style.display = 'none';
        audioBtn.classList.remove('btn-active');
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i> DESATIVAR SOM';
        audioBtn.style.background = "#334155"; 
    } else {
        video.muted = true;
        unmuteOverlay.style.display = 'flex';
        audioBtn.classList.add('btn-active');
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
        audioBtn.style.background = "#e11d48";
    }
};

// 2. Alternar Tela Cheia (Entrar/Sair)
window.toggleFullScreen = () => {
    const fsBtn = document.getElementById('btn-fs-toggle');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Entrar em Tela Cheia
        if (video.requestFullscreen) video.requestFullscreen();
        else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-compress"></i> SAIR TELA CHEIA';
    } else {
        // Sair da Tela Cheia
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-expand"></i> TELA CHEIA';
    }
};

// 3. Reproduzir Canal
window.playStream = (url, name) => {
    playingNowText.innerText = name;
    playerSection.style.display = 'block';
    document.getElementById('welcome-screen').style.display = 'none';
    
    // Inicia sempre Mudo (Padrão de Autoplay)
    video.muted = true;
    unmuteOverlay.style.display = 'flex';
    const audioBtn = document.getElementById('btn-audio-toggle');
    audioBtn.style.background = "#e11d48";
    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';

    if (hls) hls.destroy();

    if (Hls.isSupported() && url.includes('m3u8')) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = url;
        video.play();
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// 4. Voltar / Fechar Player
window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
    document.getElementById('welcome-screen').style.display = 'flex';
};

// --- RESTANTE DA LÓGICA (BUSCA E LISTAGEM) ---

setInterval(() => {
    const timeEl = document.getElementById('time');
    if(timeEl) timeEl.innerText = new Date().toLocaleTimeString('pt-BR', { hour: 'numeric', minute: '2-digit' });
}, 1000);

window.filterCountries = () => {
    const term = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "block" : "none";
    });
};

async function checkStatus(url) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        await fetch(url, { method: 'GET', mode: 'no-cors', signal: controller.signal });
        return true;
    } catch (e) { return false; }
}

function init() {
    countryList.innerHTML = '';
    countries.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name}</button>`;
        li.onclick = () => {
            currentCountryPath = c.path;
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('content-wrapper').style.display = 'block';
            document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            loadData();
        };
        countryList.appendChild(li);
    });
}

async function loadData() {
    const meta = countries.find(c => c.path === currentCountryPath);
    listHeader.innerHTML = `<h2>${meta.emoji} ${meta.name}</h2>`;
    channelList.innerHTML = '<p style="grid-column:1/-1; text-align:center;">A verificar canais...</p>';
    try {
        const response = await fetch(`./paises/${currentCountryPath}/${currentType}.json`);
        const data = await response.json();
        renderList(data);
    } catch (e) { channelList.innerHTML = "Erro ao carregar ficheiro."; }
}

async function renderList(data) {
    channelList.innerHTML = '';
    const statusPromises = data.map(item => checkStatus(item.url));
    const statuses = await Promise.all(statusPromises);
    data.forEach((item, index) => {
        const isOnline = statuses[index];
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => playStream(item.url, item.name);
        card.innerHTML = `
            <img src="${item.logo}" class="item-logo" onerror="this.src='https://via.placeholder.com/60'">
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <span class="status ${isOnline ? 'on' : 'off'}">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        `;
        channelList.appendChild(card);
    });
}

function switchType(type) {
    currentType = type === 'tv' ? 'canais' : 'radios';
    document.getElementById('btn-tv').classList.toggle('active', type === 'tv');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radio');
    if(currentCountryPath) loadData();
}

init();
