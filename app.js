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

// LISTA DE PAÍSES (Ajustada aos nomes das suas pastas)
const countries = [
    { name: "Brasil", path: "brazil", code: "br", emoji: "🇧🇷" },
    { name: "USA", path: "united_states", code: "us", emoji: "🇺🇸" },
    { name: "Espanha", path: "spain", code: "es", emoji: "🇪🇸" },
    { name: "Japão", path: "japan", code: "jp", emoji: "🇯🇵" },
    { name: "China", path: "china", code: "cn", emoji: "🇨🇳" },
    { name: "Colômbia", path: "colombia", code: "co", emoji: "🇨🇴" }
];

// Relógio
setInterval(() => {
    const timeDisplay = document.getElementById('time');
    if(timeDisplay) {
        timeDisplay.innerText = new Date().toLocaleTimeString('pt-BR', { hour: 'numeric', minute: '2-digit' });
    }
}, 1000);

// Filtro de Busca
window.filterCountries = () => {
    const term = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(term) ? "block" : "none";
    });
};

// Verificador de Status
async function checkStatus(url) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
        return true;
    } catch (e) { return false; }
}

// Inicializar Sidebar
function init() {
    countryList.innerHTML = '';
    countries.forEach(c => {
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

// Carregar JSON do País
async function loadData() {
    const meta = countries.find(c => c.path === currentCountryPath);
    listHeader.innerHTML = `
        <div class="header-info">
            <img src="https://flagcdn.com/w80/${meta.code}.png" class="flag-img">
            <h2>${meta.name} ${meta.emoji}</h2>
        </div>
    `;
    
    channelList.innerHTML = '<p class="loading-msg">Sincronizando sinais...</p>';

    try {
        const response = await fetch(`./paises/${currentCountryPath}/${currentType}.json`);
        const data = await response.json();
        renderList(data);
    } catch (e) {
        channelList.innerHTML = `<p class="error-msg">Erro ao carregar ./paises/${currentCountryPath}/${currentType}.json</p>`;
    }
}

function switchType(type) {
    currentType = type === 'tv' ? 'canais' : 'radios';
    document.getElementById('btn-tv').classList.toggle('active', type === 'tv');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radio');
    if(currentCountryPath) loadData();
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
            <img src="${item.logo}" class="item-logo" onerror="this.src='https://via.placeholder.com/60?text=TV'">
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <span class="status ${isOnline ? 'on' : 'off'}">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        `;
        channelList.appendChild(card);
    });
}

// Play
window.playStream = (url, name) => {
    playingNowText.innerText = name;
    playerSection.style.display = 'block';
    video.muted = true;
    unmuteOverlay.style.display = 'flex';

    if (Hls.isSupported() && url.includes('m3u8')) {
        hls.destroy(); hls = new Hls();
        hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        hls.destroy(); video.src = url; video.play();
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
};

window.unmuteVideo = () => { video.muted = false; unmuteOverlay.style.display = 'none'; };
window.closePlayer = () => { playerSection.style.display = 'none'; video.pause(); hls.destroy(); };
window.toggleFullScreen = () => { if(video.requestFullscreen) video.requestFullscreen(); };

init();
