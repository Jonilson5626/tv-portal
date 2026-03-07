const video = document.getElementById('tv-player');
const playerSection = document.getElementById('player-section');
const channelList = document.getElementById('channel-list');
const playingNowText = document.getElementById('playing-now');

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

function init() {
    const list = document.getElementById('country-list');
    list.innerHTML = '';
    countries.forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name}</button>`;
        li.onclick = () => {
            currentCountryPath = c.path;
            document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('list-container').style.display = 'block';
            loadData();
        };
        list.appendChild(li);
    });
}

async function loadData() {
    const meta = countries.find(c => c.path === currentCountryPath);
    document.getElementById('list-header').innerHTML = `<h2 style="margin-bottom:15px"> ${meta.name}</h2>`;
    channelList.innerHTML = '<p>Carregando canais...</p>';
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
        card.innerHTML = `<img src="${item.logo}" onerror="this.src='https://via.placeholder.com/50'"><p>${item.name}</p>`;
        channelList.appendChild(card);
    });
}

window.playStream = (url, name) => {
    playingNowText.innerText = name;
    playerSection.style.display = 'block';
    video.muted = true;
    const btn = document.getElementById('btn-audio-toggle');
    btn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
    btn.classList.add('btn-danger');

    if (Hls.isSupported() && url.includes('m3u8')) {
        hls.destroy(); hls = new Hls();
        hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else { video.src = url; video.play(); }
};

window.toggleMute = () => {
    const btn = document.getElementById('btn-audio-toggle');
    if (video.muted) {
        video.muted = false;
        btn.innerHTML = '<i class="fas fa-volume-mute"></i> DESATIVAR';
        btn.classList.remove('btn-danger');
    } else {
        video.muted = true;
        btn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
        btn.classList.add('btn-danger');
    }
};

window.switchType = (type) => {
    currentType = type === 'tv' ? 'canais' : 'radios';
    document.getElementById('btn-tv').classList.toggle('active', type === 'tv');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radio');
    loadData();
};

window.closePlayer = () => { playerSection.style.display = 'none'; video.pause(); hls.destroy(); };
window.toggleFullScreen = () => { if (video.requestFullscreen) video.requestFullscreen(); else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen(); };
window.filterCountries = () => {
    const term = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(i => i.style.display = i.innerText.toLowerCase().includes(term) ? "" : "none");
};
setInterval(() => { document.getElementById('time').innerText = new Date().toLocaleTimeString(); }, 1000);
init();
