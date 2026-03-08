// Lista completa dos países baseada nas suas pastas do GitHub
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

// Inicia a lista lateral
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

// Carrega os canais do arquivo JSON do país
async function loadJSON() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('list-container').style.display = 'block';
    const grid = document.getElementById('channel-grid');
    grid.innerHTML = "<p style='padding:20px;'>Carregando...</p>";

    try {
        const response = await fetch(`./paises/${currentCountry}/${currentType}.json`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        renderGrid(data);
    } catch (error) {
        grid.innerHTML = `<p style='padding:20px; color:#ef4444;'>Erro: JSON não encontrado em /paises/${currentCountry}/</p>`;
    }
}

// Desenha os quadradinhos (cards) dos canais
function renderGrid(data) {
    const grid = document.getElementById('channel-grid');
    grid.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => playChannel(item.url, item.name);
        card.innerHTML = `
            <img src="${item.logo}" onerror="this.src='https://via.placeholder.com/80?text=TV'">
            <p>${item.name}</p>
        `;
        grid.appendChild(card);
    });
}

// Inicia a transmissão
function playChannel(url, name) {
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('playing-now').innerText = "Assistindo: " + name;
    video.muted = true;

    if (Hls.isSupported() && url.includes('.m3u8')) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = url;
        video.play();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FUNÇÃO DE TELA CHEIA
window.toggleFullScreen = () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
};

window.toggleMute = () => {
    video.muted = !video.muted;
    const btn = document.getElementById('btn-audio');
    btn.innerHTML = video.muted ? '<i class="fas fa-volume-up"></i> ATIVAR SOM' : '<i class="fas fa-volume-mute"></i> MUDO';
};

window.closePlayer = () => {
    document.getElementById('player-section').style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
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
