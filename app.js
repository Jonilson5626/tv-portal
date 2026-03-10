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
    grid.innerHTML = "<p style='padding:20px;'>Carregando conteúdo...</p>";

    try {
        const response = await fetch(`./paises/${currentCountry}/${currentType}.json`);
        if (!response.ok) throw new Error("Arquivo não encontrado");
        const data = await response.json();
        renderGrid(data);
    } catch (error) {
        grid.innerHTML = `<p style='padding:20px; color:#ef4444;'>Erro ao carregar conteúdo.</p>`;
    }
}

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

// FUNÇÃO DO PLAYER - CORRIGIDA
function playChannel(url, name) {
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('playing-now').innerText = "Assistindo: " + name;
    
    // Força o vídeo a começar mudo (obrigatório para autoplay)
    video.muted = true;
    
    // SINCRONIZA O BOTÃO: Como o vídeo começa mudo, o botão deve dizer "ATIVAR SOM"
    const btn = document.getElementById('btn-audio');
    btn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
    btn.className = "nav-btn btn-danger"; // Mantém vermelho para chamar atenção

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

// ALTERNAR MUDO - CORRIGIDA
window.toggleMute = () => {
    video.muted = !video.muted;
    const btn = document.getElementById('btn-audio');
    
    if (video.muted) {
        // Se ficou mudo
        btn.innerHTML = '<i class="fas fa-volume-up"></i> ATIVAR SOM';
        btn.className = "nav-btn btn-danger";
    } else {
        // Se ativou o som
        btn.innerHTML = '<i class="fas fa-volume-mute"></i> MUDO';
        btn.className = "nav-btn"; // Muda para a cor padrão (cinza)
    }
};

window.toggleFullScreen = () => {
    if (video.requestFullscreen) { video.requestFullscreen(); }
    else if (video.webkitRequestFullscreen) { video.webkitRequestFullscreen(); }
    else if (video.msRequestFullscreen) { video.msRequestFullscreen(); }
};

window.closePlayer = () => {
    document.getElementById('player-section').style.display = 'none';
    video.pause();
    video.src = "";
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
