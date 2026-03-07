const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const playingNowText = document.getElementById('playing-now');
const video = document.getElementById('tv-player');

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

// --- CONTROLES DO PLAYER ---

// Alternar Áudio (Liga/Desliga)
window.toggleMute = () => {
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (video.muted) {
        video.muted = false;
        audioBtn.style.background = "#334155"; // Cor normal
        audioBtn.innerHTML = '<i class="fas fa-volume-mute"></i> DESATIVAR SOM';
    } else {
        video.muted = true;
        audioBtn.style.background = "#e11d48"; // Cor de destaque (vermelho)
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
    }
};

// Alternar Tela Cheia
window.toggleFullScreen = () => {
    const fsBtn = document.getElementById('btn-fs-toggle');
    if (!document.fullscreenElement) {
        if (video.requestFullscreen) video.requestFullscreen();
        else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-compress"></i> SAIR TELA';
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
        fsBtn.innerHTML = '<i class="fas fa-expand"></i> TELA CHEIA';
    }
};

// Função para dar Play
window.playStream = (url, name) => {
    playingNowText.innerText = name;
    playerSection.style.display = 'block';
    document.getElementById('welcome-screen').style.display = 'none';
    
    // Sempre inicia mudo por causa das regras do navegador
    video.muted = true;
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

// Fechar Player
window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
    document.getElementById('welcome-screen').style.display = 'flex';
};

// --- FUNÇÕES DE INTERFACE ---

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
    countries.forEach(c => {
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
