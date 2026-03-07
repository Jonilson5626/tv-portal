// Seleção de elementos
const video = document.getElementById('tv-player');
const playerSection = document.getElementById('player-section');
const playingNowText = document.getElementById('playing-now');
const channelList = document.getElementById('channel-list');

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

// --- CONTROLES DE ÁUDIO E VÍDEO ---

window.toggleMute = () => {
    const btn = document.getElementById('btn-audio-toggle');
    if (video.muted) {
        video.muted = false;
        btn.innerHTML = '<i class="fas fa-volume-mute"></i> DESATIVAR SOM';
        btn.style.backgroundColor = "#334155"; // Cinza quando ligado
    } else {
        video.muted = true;
        btn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
        btn.style.backgroundColor = "#e11d48"; // Vermelho quando mudo
    }
};

window.toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        if (playerSection.requestFullscreen) playerSection.requestFullscreen();
        else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    } else {
        document.exitFullscreen();
    }
};

window.playStream = (url, name) => {
    playingNowText.innerText = name;
    playerSection.style.display = 'block';
    document.getElementById('welcome-screen').style.display = 'none';

    // Reset do áudio (Sempre inicia mudo para o navegador permitir o play)
    video.muted = true;
    const btn = document.getElementById('btn-audio-toggle');
    btn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
    btn.style.backgroundColor = "#e11d48";

    if (Hls.isSupported() && url.includes('m3u8')) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = url;
        video.play();
    }
};

window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    hls.destroy();
    document.getElementById('welcome-screen').style.display = 'flex';
};

// --- LÓGICA DE INTERFACE ---

function init() {
    const list = document.getElementById('country-list');
    countries.forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name} <sup>${c.code.toUpperCase()}</sup></button>`;
        li.onclick = () => {
            currentCountryPath = c.path;
            document.getElementById('content-wrapper').style.display = 'block';
            loadData();
        };
        list.appendChild(li);
    });
}

async function loadData() {
    channelList.innerHTML = '<p>Carregando...</p>';
    try {
        const resp = await fetch(`./paises/${currentCountryPath}/${currentType}.json`);
        const data = await resp.json();
        renderList(data);
    } catch (e) { channelList.innerHTML = "Erro ao carregar lista."; }
}

function renderList(data) {
    channelList.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => playStream(item.url, item.name);
        card.innerHTML = `<img src="${item.logo}" class="item-logo"><p>${item.name}</p>`;
        channelList.appendChild(card);
    });
}

// Relógio e Busca
setInterval(() => { document.getElementById('time').innerText = new Date().toLocaleTimeString(); }, 1000);
window.filterCountries = () => {
    const term = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(i => i.style.display = i.innerText.toLowerCase().includes(term) ? "" : "none");
};

init();
