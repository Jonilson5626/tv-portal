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

const countries = [
    { name: "Brasil", path: "brazil", code: "br", emoji: "🇧🇷" },
    { name: "USA", path: "united_states", code: "us", emoji: "🇺🇸" },
    { name: "Espanha", path: "spain", code: "es", emoji: "🇪🇸" },
    { name: "Japão", path: "japan", code: "jp", emoji: "🇯🇵" },
    { name: "China", path: "china", code: "cn", emoji: "🇨🇳" },
    { name: "Colômbia", path: "colombia", code: "co", emoji: "🇨🇴" }
];

// 1. FUNÇÃO PARA REPRODUZIR (CORRIGIDA)
window.playStream = (url, name) => {
    console.log("Tentando reproduzir:", url);
    playingNowText.innerText = name;
    
    // Mostra o player e esconde a mensagem de boas-vindas
    playerSection.style.display = 'block';
    document.getElementById('welcome-screen').style.display = 'none';
    
    // Configuração inicial do áudio (MUDO para permitir autoplay)
    video.muted = true;
    unmuteOverlay.style.display = 'flex';

    // Limpa instâncias anteriores do HLS para evitar travamentos
    if (hls) {
        hls.destroy();
    }

    if (Hls.isSupported() && url.includes('m3u8')) {
        hls = new Hls({
            // Configurações para links difíceis como JMVStream
            xhrSetup: function(xhr, url) { xhr.withCredentials = false; }
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.log("Erro no autoplay:", e));
        });
        
        // Se houver erro de rede, tenta recuperar uma vez
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
                    case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
                }
            }
        });
    } else {
        // Para navegadores com suporte nativo (Safari) ou links MP4/MP3
        video.src = url;
        video.play().catch(e => console.log("Erro no play nativo:", e));
    }
    
    // Rola a tela para o topo para ver o player no celular
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// 2. BOTÃO VOLTAR
window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    if (hls) hls.destroy();
    video.src = "";
    document.getElementById('welcome-screen').style.display = 'flex';
};

// 3. BOTÃO ATIVAR ÁUDIO
window.unmuteVideo = () => {
    video.muted = false;
    unmuteOverlay.style.display = 'none';
};

// 4. BOTÃO TELA CHEIA
window.toggleFullScreen = () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) { /* Safari */
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE11 */
        video.msRequestFullscreen();
    }
};

// --- Funções de interface (Mantidas) ---

async function checkStatus(url) {
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 2000);
        await fetch(url, { method: 'GET', mode: 'no-cors', signal: controller.signal });
        return true;
    } catch (e) { return false; }
}

function init() {
    countryList.innerHTML = '';
    countries.forEach(c => {
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `<button><i class="fas fa-flag"></i> ${c.name}</button>`;
        li.onclick = () => {
            currentCountryPath = c.path;
            document.getElementById('content-wrapper').style.display = 'block';
            document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            loadData();
        };
        countryList.appendChild(li);
    });
}

async function loadData() {
    const meta = countries.find(c => c.path === currentCountryPath);
    listHeader.innerHTML = `<h2>${meta.emoji} ${meta.name}</h2>`;
    try {
        const response = await fetch(`./paises/${currentCountryPath}/${currentType}.json`);
        const data = await response.json();
        renderList(data);
    } catch (e) { channelList.innerHTML = "Erro ao carregar lista."; }
}

async function renderList(data) {
    channelList.innerHTML = '';
    for (const item of data) {
        const isOnline = await checkStatus(item.url);
        const card = document.createElement('div');
        card.className = 'item-card';
        // Passamos o URL e o Nome para a função playStream
        card.onclick = () => playStream(item.url, item.name);
        card.innerHTML = `
            <img src="${item.logo}" class="item-logo">
            <div class="item-details">
                <p class="item-name">${item.name}</p>
                <span class="status ${isOnline ? 'on' : 'off'}">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        `;
        channelList.appendChild(card);
    }
}

init();
