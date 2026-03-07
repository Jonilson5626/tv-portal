const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');
let hls = new Hls();

let tvData = {};
let radioData = {};
let currentType = 'tv'; 
let currentCountry = "";

// Configuração de Emojis e Bandeiras
const countryMeta = {
    "Brazil": { emoji: "🇧🇷", code: "br" },
    "Portugal": { emoji: "🇵🇹", code: "pt" },
    "USA": { emoji: "🇺🇸", code: "us" },
    "Spain": { emoji: "🇪🇸", code: "es" }
};

// Relógio 1:16 AM style
function updateClock() {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

async function init() {
    try {
        // Carrega os dois arquivos
        const [resTv, resRadio] = await Promise.all([
            fetch('./data/channels.json'),
            fetch('./data/radios.json')
        ]);
        
        tvData = await resTv.json();
        radioData = await resRadio.json();
        
        // Cria a lista de países (usando as chaves do arquivo de TV como base)
        const countries = Object.keys(tvData).sort();
        countries.forEach(country => {
            const meta = countryMeta[country] || { emoji: "🏳️", code: "un" };
            const li = document.createElement('li');
            li.className = 'country-item';
            li.innerHTML = `<button>${meta.emoji} ${country}</button>`;
            li.onclick = () => {
                currentCountry = country;
                document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderList();
            };
            countryList.appendChild(li);
        });

        currentCountry = countries[0];
        renderList();
    } catch (e) { console.error("Erro ao carregar arquivos JSON"); }
}

function switchType(type) {
    currentType = type;
    document.getElementById('btn-tv').classList.toggle('active', type === 'tv');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radio');
    
    // Se for rádio, podemos esconder o botão de tela cheia, já que não tem vídeo
    document.getElementById('fs-btn').style.display = type === 'radio' ? 'none' : 'block';
    
    renderList();
}

function renderList() {
    const meta = countryMeta[currentCountry] || { emoji: "🏳️", code: "un" };
    const source = currentType === 'tv' ? tvData : radioData;
    const items = source[currentCountry] || [];

    listHeader.innerHTML = `
        <img src="https://flagcdn.com/w160/${meta.code}.png" class="country-icon" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2144/2144830.png'">
        <p class="heading">${meta.emoji} ${currentCountry}</p>
    `;

    channelList.innerHTML = '';
    
    if(items.length === 0) {
        channelList.innerHTML = `<p style="color:#999; text-align:center; padding:30px;">Nenhuma ${currentType === 'tv' ? 'TV' : 'Rádio'} disponível para este país.</p>`;
        return;
    }

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'channel-row';
        row.onclick = () => playStream(item.url);
        row.innerHTML = `
            <div class="channel-info">
                <img src="${item.logo}" class="logo-mini" onerror="this.src='https://via.placeholder.com/45'">
                <div>
                    <p class="chan-name">${item.name}</p>
                    <p class="chan-artist">${currentType === 'tv' ? 'Canal de TV' : 'Estação de Rádio'} • HD</p>
                </div>
            </div>
            <div class="play-btn-ui"></div>
        `;
        channelList.appendChild(row);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
    video.muted = true;
    unmuteOverlay.style.display = 'block';

    if (Hls.isSupported()) {
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

window.unmuteVideo = () => { video.muted = false; unmuteOverlay.style.display = 'none'; };
window.closePlayer = () => { playerSection.style.display = 'none'; video.pause(); hls.destroy(); };
window.toggleFullScreen = () => { 
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

init();
