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

// Configuração dos países conforme as tuas pastas
const countries = [
    { name: "Brasil", path: "brazil", code: "br", emoji: "🇧🇷" },
    { name: "USA", path: "united_states", code: "us", emoji: "🇺🇸" },
    { name: "Espanha", path: "spain", code: "es", emoji: "🇪🇸" },
    { name: "Japão", path: "japan", code: "jp", emoji: "🇯🇵" },
    { name: "China", path: "china", code: "cn", emoji: "🇨🇳" },
    { name: "Colômbia", path: "colombia", code: "co", emoji: "🇨🇴" }
];

// Relógio Digital
setInterval(() => {
    const timeEl = document.getElementById('time');
    if(timeEl) timeEl.innerText = new Date().toLocaleTimeString('pt-BR', { hour: 'numeric', minute: '2-digit' });
}, 1000);

// Busca/Filtro de Países
window.filterCountries = () => {
    const term = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "block" : "none";
    });
};

// Verificador de sinal Online/Offline
async function checkStatus(url) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        await fetch(url, { method: 'GET', mode: 'no-cors', signal: controller.signal });
        return true;
    } catch (e) { return false; }
}

// Inicializar Sidebar
function init() {
    countryList.innerHTML = '';
    countries.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name} ${c.emoji}</button>`;
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

// Carregar dados do JSON do país
async function loadData() {
    const meta = countries.find(c => c.path === currentCountryPath);
    listHeader.innerHTML = `<h2>${meta.emoji} ${meta.name}</h2>`;
    channelList.innerHTML = '<p style="grid-column:1/-1; text-align:center;">A verificar canais...</p>';

    try {
        const response = await fetch(`./paises/${currentCountryPath}/${currentType}.json`);
        const data = await response.json();
        renderList(data);
    } catch (e) {
        channelList.innerHTML = "Erro ao carregar ficheiro JSON.";
    }
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

// PLAYER: PLAY
window.playStream = (url, name) => {
    playingNowText.innerText = name;
    playerSection.style.display = 'block';
    video.muted = true; // Inicia mudo para garantir o autoplay
    unmuteOverlay.style.display = 'flex';
    
    // Reset do botão de áudio na barra
    const audioBtn = document.getElementById('btn-audio-nav');
    if(audioBtn) {
        audioBtn.style.background = "#e11d48";
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
    }

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

// PLAYER: UNMUTE
window.unmuteVideo = () => {
    video.muted = false;
    unmuteOverlay.style.display = 'none';
    const audioBtn = document.getElementById('btn-audio-nav');
    if(audioBtn) {
        audioBtn.style.background = "#334155";
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i> SOM ATIVO';
    }
};

// PLAYER: VOLTAR
window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
    document.getElementById('welcome-screen').style.display = 'flex';
};

// PLAYER: FULLSCREEN
window.toggleFullScreen = () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

init();
