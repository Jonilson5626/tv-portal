const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');
const welcomeScreen = document.getElementById('welcome-screen');
const contentWrapper = document.getElementById('content-wrapper');

let hls = new Hls();
let tvData = {};
let radioData = {};
let currentType = 'tv'; 
let currentCountry = "";

// Mapeamento para Emojis e Bandeiras (FlagCDN)
const countryMeta = {
    "Brazil": { emoji: "🇧🇷", code: "br" },
    "Portugal": { emoji: "🇵🇹", code: "pt" },
    "USA": { emoji: "🇺🇸", code: "us" },
    "Spain": { emoji: "🇪🇸", code: "es" },
    "Argentina": { emoji: "🇦🇷", code: "ar" }
};

// Relógio Digital
function updateClock() {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

async function init() {
    try {
        // Carregamento paralelo dos arquivos JSON
        const [resTv, resRadio] = await Promise.all([
            fetch('./data/channels.json'),
            fetch('./data/radios.json')
        ]);
        
        tvData = await resTv.json();
        radioData = await resRadio.json();
        
        const countries = Object.keys(tvData).sort();
        
        countryList.innerHTML = ''; 
        countries.forEach(country => {
            const meta = countryMeta[country] || { emoji: "🏳️", code: "un" };
            const li = document.createElement('li');
            li.className = 'country-item';
            li.innerHTML = `<button>${meta.emoji} ${country}</button>`;
            
            li.onclick = () => {
                currentCountry = country;
                
                // Interface: Esconde boas-vindas e mostra lista
                welcomeScreen.style.display = 'none';
                contentWrapper.style.display = 'block';
                
                // Reseta estilo dos botões na sidebar
                document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                
                // Força começar em TV ao trocar de país
                currentType = 'tv';
                document.getElementById('btn-tv').classList.add('active');
                document.getElementById('btn-radio').classList.remove('active');
                
                renderList();
            };
            countryList.appendChild(li);
        });

    } catch (e) {
        console.error("Falha ao carregar canais:", e);
        channelList.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar dados dos arquivos JSON.</p>`;
    }
}

function switchType(type) {
    currentType = type;
    document.getElementById('btn-tv').classList.toggle('active', type === 'tv');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radio');
    
    // Esconde tela cheia se for rádio (opcional)
    document.getElementById('fs-btn').style.display = type === 'radio' ? 'none' : 'block';
    
    renderList();
}

function renderList() {
    if (!currentCountry) return;
    
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
                <img src="${item.logo}" class="logo-mini" onerror="this.src='https://via.placeholder.com/48?text=TV'">
                <div>
                    <p class="chan-name">${item.name}</p>
                    <p class="chan-artist">${currentType === 'tv' ? 'Canal de TV' : 'Rádio Online'} • HD</p>
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
    
    if (Hls.isSupported() && url.includes('.m3u8')) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        // Fallback para MP4, MP3 ou navegadores com HLS nativo (Safari)
        hls.destroy();
        video.src = url;
        video.play();
    }
    // Scroll suave para o player no mobile
    window.scrollTo({top: 0, behavior: 'smooth'});
};

window.unmuteVideo = () => {
    video.muted = false;
    unmuteOverlay.style.display = 'none';
};

window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
};

window.toggleFullScreen = () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if (video.msRequestFullscreen) video.msRequestFullscreen();
};

init();
