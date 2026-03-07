// Seleção de elementos do DOM
const countryList = document.getElementById('country-list');
const channelGrid = document.getElementById('channel-grid');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
let hls = new Hls();

/**
 * Inicializa a aplicação carregando o JSON de canais
 */
async function init() {
    try {
        // Busca o arquivo de dados. Certifique-se que o caminho está correto no seu GitHub
        const res = await fetch('./data/channels.json');
        if (!res.ok) throw new Error("Não foi possível carregar o arquivo JSON.");
        const data = await res.json();
        
        // Cria os botões de países na sidebar
        Object.keys(data).sort().forEach(country => {
            const li = document.createElement('li');
            li.className = 'country-item';
            li.innerHTML = `<button>${country}</button>`;
            li.onclick = () => {
                // Remove classe ativa de outros e adiciona no selecionado
                document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderChannels(data[country]);
                
                // No celular, após escolher o país, rola para os canais
                if (window.innerWidth < 768) {
                    channelGrid.scrollIntoView({ behavior: 'smooth' });
                }
            };
            countryList.appendChild(li);
        });

        // Carrega por padrão o Brasil ou o primeiro país da lista
        const defaultCountry = Object.keys(data).find(k => k.toLowerCase().includes('brasil')) || Object.keys(data)[0];
        if (defaultCountry) renderChannels(data[defaultCountry]);

    } catch (err) {
        console.error("Erro na inicialização:", err);
        channelGrid.innerHTML = `<p style="color:white; padding:20px;">Erro ao carregar canais. Verifique o console.</p>`;
    }
}

/**
 * Renderiza os cards de canais na grade
 */
function renderChannels(channels) {
    channelGrid.innerHTML = '';
    channels.forEach(chan => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${chan.logo}" class="channel-logo" onerror="this.src='https://via.placeholder.com/80?text=TV'">
            <p style="font-size:0.85rem; margin-bottom:12px; font-weight:bold; color:white;">${chan.name}</p>
            <button class="btn-play" onclick="playStream('${chan.url}')">ASSISTIR AGORA</button>
        `;
        channelGrid.appendChild(card);
    });
}

/**
 * Inicia a reprodução do canal selecionado
 */
window.playStream = (url) => {
    // Exibe a seção do player
    playerSection.style.display = 'block';
    
    // No celular, esconde a grade para o player (720x720) ter destaque total
    if (window.innerWidth < 768) {
        channelGrid.style.display = 'none';
    }
    
    // Rola para o topo para ver o vídeo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Configurações básicas para evitar bloqueio de autoplay e tela preta
    video.muted = true; // Essencial para o navegador permitir o início do vídeo
    video.pause();
    video.src = "";

    // Lógica para HLS (.m3u8)
    if (Hls.isSupported()) {
        hls.destroy(); // Limpa instâncias anteriores
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.log("Play automático bloqueado: ", e));
        });
        
        // Tratamento de erro de link
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) alert("Erro: Este canal está offline no momento.");
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Suporte nativo (Safari / iOS)
        video.src = url;
        video.play();
    }
};

/**
 * Fecha o player e volta para a lista
 */
window.closePlayer = () => {
    playerSection.style.display = 'none';
    channelGrid.style.display = 'grid'; // Reexibe a grade de canais
    video.pause();
    video.src = "";
    if (hls) hls.destroy();
};

/**
 * Ativa o modo Tela Cheia
 */
window.toggleFullScreen = () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen(); // Safari
    else if (video.msRequestFullscreen) video.msRequestFullscreen(); // IE
};

// Inicia o app
init();
