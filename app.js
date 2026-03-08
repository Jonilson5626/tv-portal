const countries = [
    { name: "Brasil", path: "brazil" },
    { name: "China", path: "china" },
    { name: "Colômbia", path: "colombia" },
    { name: "Japão", path: "japan" },
    { name: "Espanha", path: "spain" },
    { name: "Estados Unidos", path: "united_states" }
];

let currentCountry = "";
let currentType = "canais"; 
const video = document.getElementById('tv-player');
let hls = new Hls();

function init() {
    const list = document.getElementById('country-list');
    list.innerHTML = "";
    countries.forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name}</button>`;
        li.onclick = () => {
            currentCountry = c.path;
            document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            loadJSON();
        };
        list.appendChild(li);
    });
}

async function loadJSON() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('list-container').style.display = 'block';
    const grid = document.getElementById('channel-grid');
    grid.innerHTML = "<p style='padding:20px; text-align:center;'>Buscando lista...</p>";

    try {
        const response = await fetch(`./paises/${currentCountry}/${currentType}.json?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        renderGrid(data);
    } catch (error) {
        grid.innerHTML = `<p style='padding:20px; color:#ef4444; text-align:center;'>⚠️ Erro ao carregar /paises/${currentCountry}/</p>`;
    }
}

function renderGrid(data) {
    const grid = document.getElementById('channel-grid');
    grid.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => playMedia(item);
        card.innerHTML = `<img src="${item.logo}" onerror="this.src='https://via.placeholder.com/150?text=RADIO'"><p>${item.name}</p>`;
        grid.appendChild(card);
    });
}

function playMedia(item) {
    const radioBtn = document.getElementById('BTN-PLAY');
    const radioStatus = document.getElementById('radio-song');

    // RESET TOTAL DO PLAYER (Para evitar travamentos)
    video.pause();
    video.removeAttribute('src'); 
    video.load();

    if (currentType === "canais") {
        document.getElementById('player-section').style.display = 'block';
        document.getElementById('radio-player-section').style.display = 'none';
        document.getElementById('playing-now').innerText = "Assistindo: " + item.name;
        
        if (Hls.isSupported() && item.url.includes('.m3u8')) {
            hls.destroy(); hls = new Hls();
            hls.loadSource(item.url); hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        } else { 
            video.src = item.url; 
            video.play(); 
        }
    } else {
        // MODO RÁDIO
        document.getElementById('radio-player-section').style.display = 'block';
        document.getElementById('player-section').style.display = 'none';
        document.getElementById('radio-logo').src = item.logo;
        document.getElementById('radio-playing-name').innerText = item.name;
        
        radioStatus.innerHTML = '<span class="spinner"></span> Conectando...';
        radioBtn.classList.remove('playing');

        // Configura o novo link
        video.src = item.url;
        video.crossOrigin = "anonymous"; // Tenta evitar erros de CORS

        // Tenta tocar com delay para dar tempo ao buffer
        setTimeout(() => {
            video.play().then(() => {
                radioStatus.innerHTML = '<span class="live-indicator"></span> AO VIVO';
                radioBtn.classList.add('playing');
            }).catch(err => {
                console.error("Erro no Play:", err);
                radioStatus.innerHTML = '⚠️ Erro ou Link HTTP Bloqueado';
                radioBtn.classList.remove('playing');
            });
        }, 500);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.handleRadioPlay = () => {
    const btn = document.getElementById('BTN-PLAY');
    const status = document.getElementById('radio-song');
    if (video.paused) {
        status.innerHTML = '<span class="spinner"></span> Reconectando...';
        video.play().then(() => {
            btn.classList.add('playing');
            status.innerHTML = '<span class="live-indicator"></span> AO VIVO';
        }).catch(() => status.innerHTML = '⚠️ Erro ao tocar');
    } else {
        video.pause();
        btn.classList.remove('playing');
        status.innerHTML = 'Pausado';
    }
};

window.changeRadioVolume = (val) => { video.volume = val; };
window.toggleFullScreen = () => { if (video.requestFullscreen) video.requestFullscreen(); };
window.toggleMute = () => { video.muted = !video.muted; };
window.closePlayer = () => {
    document.getElementById('player-section').style.display = 'none';
    document.getElementById('radio-player-section').style.display = 'none';
    video.pause();
    video.src = "";
};

window.switchType = (type) => {
    currentType = type;
    document.getElementById('btn-tv').classList.toggle('active', type === 'canais');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radios');
    if (currentCountry) loadJSON();
};

window.filterCountries = () => {
    const term = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(li => {
        li.style.display = li.innerText.toLowerCase().includes(term) ? "" : "none";
    });
};

init();
