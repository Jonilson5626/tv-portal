const countryList = document.getElementById('country-list');
const channelGrid = document.getElementById('channel-grid');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
let hls = new Hls();

async function init() {
    try {
        // Certifique-se que o caminho do JSON está correto
        const res = await fetch('./data/channels.json');
        if (!res.ok) throw new Error("Erro ao carregar JSON");
        const data = await res.json();
        
        Object.keys(data).sort().forEach(country => {
            const li = document.createElement('li');
            li.className = 'country-item';
            li.innerHTML = `<button>${country}</button>`;
            li.onclick = () => {
                document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderChannels(data[country]);
            };
            countryList.appendChild(li);
        });

        // Tenta carregar Brasil primeiro
        const br = Object.keys(data).find(k => k.toLowerCase().includes('brasil'));
        if(br) renderChannels(data[br]);

    } catch (err) {
        console.error(err);
        channelGrid.innerHTML = `<p style="color:white; padding:20px;">Erro: Verifique se o arquivo data/channels.json existe.</p>`;
    }
}

function renderChannels(channels) {
    channelGrid.innerHTML = '';
    channels.forEach(chan => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${chan.logo}" class="channel-logo" onerror="this.src='https://via.placeholder.com/60?text=TV'">
            <p style="font-size:0.85rem; margin-bottom:12px; font-weight:bold;">${chan.name}</p>
            <button class="btn-play" onclick="playStream('${chan.url}')">ASSISTIR AGORA</button>
        `;
        channelGrid.appendChild(card);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
    // No mobile, esconde a lista para focar no player
    if (window.innerWidth < 768) channelGrid.style.display = 'none';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Resetar o player para evitar travamentos
    video.pause();
    video.src = "";
    video.muted = true; // Ajuda o navegador a permitir o Play automático

    if (Hls.isSupported()) {
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {
                console.log("O Play automático foi bloqueado. O usuário precisa clicar no play.");
                video.controls = true;
            });
        });
        
        // Se o link falhar, avisa o usuário
        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.error("Erro fatal no link do canal");
                alert("Este canal está offline no momento.");
            }
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Suporte nativo para Safari/iOS
        video.src = url;
        video.play();
    }
};

window.closePlayer = () => {
    playerSection.style.display = 'none';
    channelGrid.style.display = 'grid';
    video.pause();
    video.src = "";
    if(hls) hls.destroy();
};

window.toggleFullScreen = () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

init();
