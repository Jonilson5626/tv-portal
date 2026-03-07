const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');
let hls = new Hls();
let currentData = null;
let currentCountry = "";
let currentType = "tv"; // Padrão é TV

const countryMeta = {
    "Brazil": { emoji: "🇧🇷", code: "br" },
    "Portugal": { emoji: "🇵🇹", code: "pt" },
    "USA": { emoji: "🇺🇸", code: "us" }
};

// Relógio em Tempo Real
setInterval(() => {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}, 1000);

async function init() {
    try {
        const res = await fetch('./data/channels.json');
        currentData = await res.json();
        
        Object.keys(currentData).sort().forEach(country => {
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

        currentCountry = Object.keys(currentData).sort()[0];
        renderList();
    } catch (e) { console.error("Erro ao iniciar"); }
}

function switchType(type) {
    currentType = type;
    document.getElementById('btn-tv').classList.toggle('active', type === 'tv');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radio');
    renderList();
}

function renderList() {
    const meta = countryMeta[currentCountry] || { emoji: "🏳️", code: "un" };
    listHeader.innerHTML = `
        <img src="https://flagcdn.com/w160/${meta.code}.png" class="country-icon">
        <p class="heading">${meta.emoji} ${currentCountry}</p>
    `;

    channelList.innerHTML = '';
    // Filtra os canais pelo tipo selecionado (TV ou Radio)
    const items = currentData[currentCountry].filter(item => item.type === currentType);

    if(items.length === 0) {
        channelList.innerHTML = `<p style="color:black; text-align:center; padding:20px;">Nenhum item encontrado.</p>`;
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
                    <p class="chan-artist">${currentType === 'tv' ? 'TV Online' : 'Rádio Online'} HD</p>
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
        hls.destroy(); hls = new Hls();
        hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else { video.src = url; video.play(); }
};

window.unmuteVideo = () => { video.muted = false; unmuteOverlay.style.display = 'none'; };
window.closePlayer = () => { playerSection.style.display = 'none'; video.pause(); };
window.toggleFullScreen = () => { video.requestFullscreen?.() || video.webkitRequestFullscreen?.(); };

init();
