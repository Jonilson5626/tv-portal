// Liste seus países e as pastas correspondentes aqui
const countries = [
    { name: "Brasil", path: "brazil" },
    { name: "Portugal", path: "portugal" },
    { name: "Espanha", path: "spain" },
    { name: "USA", path: "united_states" }
];

let currentCountryPath = "";
let currentType = "canais"; // canais ou radios
const video = document.getElementById('tv-player');
let hls = new Hls();

// Inicia a lista de países
function init() {
    const list = document.getElementById('country-list');
    list.innerHTML = "";
    countries.forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name}</button>`;
        li.onclick = () => {
            currentCountryPath = c.path;
            document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            loadContent();
        };
        list.appendChild(li);
    });
}

// Carrega o JSON da pasta do país
async function loadContent() {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('list-container').style.display = 'block';
    const grid = document.getElementById('channel-grid');
    grid.innerHTML = "<p>Carregando conteúdo...</p>";

    try {
        const url = `./paises/${currentCountryPath}/${currentType}.json`;
        const response = await fetch(url);
        const data = await response.json();
        renderGrid(data);
    } catch (error) {
        grid.innerHTML = "<p>Erro ao encontrar arquivos na pasta do país.</p>";
    }
}

// Cria os quadradinhos (cards)
function renderGrid(data) {
    const grid = document.getElementById('channel-grid');
    grid.innerHTML = '';
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => playStream(item.url, item.name);
        card.innerHTML = `
            <img src="${item.logo}" onerror="this.src='https://via.placeholder.com/60?text=TV'">
            <p>${item.name}</p>
        `;
        grid.appendChild(card);
    });
}

// Função do Player
function playStream(url, name) {
    document.getElementById('player-section').style.display = 'block';
    document.getElementById('playing-now').innerText = name;
    video.muted = true;

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
    window.scrollTo({top: 0, behavior: 'smooth'});
}

window.toggleMute = () => {
    video.muted = !video.muted;
    const btn = document.getElementById('btn-audio');
    btn.innerHTML = video.muted ? '<i class="fas fa-volume-up"></i> ATIVAR SOM' : '<i class="fas fa-volume-mute"></i> MUDO';
    btn.classList.toggle('btn-danger', video.muted);
};

window.switchType = (type) => {
    currentType = type;
    document.getElementById('btn-tv').classList.toggle('active', type === 'canais');
    document.getElementById('btn-radio').classList.toggle('active', type === 'radios');
    loadContent();
};

window.closePlayer = () => {
    document.getElementById('player-section').style.display = 'none';
    video.pause();
    hls.destroy();
};

window.filterCountries = () => {
    const val = document.getElementById('country-search').value.toLowerCase();
    document.querySelectorAll('.country-item').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(val) ? "" : "none";
    });
};

init();
