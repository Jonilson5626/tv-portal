const countryList = document.getElementById('country-list');
const channelGrid = document.getElementById('channel-grid');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
let hls = new Hls();

// Iniciar o site carregando o JSON
async function init() {
    try {
        const response = await fetch('./data/channels.json');
        const data = await response.json();
        
        // Renderizar Sidebar
        countryList.innerHTML = '';
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

        // Abrir Brasil por padrão
        const defaultCountry = Object.keys(data).find(c => c.includes("Brasil")) || Object.keys(data)[0];
        if(defaultCountry) {
            renderChannels(data[defaultCountry]);
            // Marcar como ativo na sidebar
            Array.from(countryList.children).forEach(li => {
                if(li.innerText === defaultCountry) li.classList.add('active');
            });
        }

    } catch (err) {
        channelGrid.innerHTML = `<p style="color:red">Erro ao carregar banco de dados JSON.</p>`;
    }
}

function renderChannels(channels) {
    channelGrid.innerHTML = '';
    channels.forEach(chan => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <div class="badge-live">AO VIVO</div>
            <img src="${chan.logo}" class="channel-logo" onerror="this.src='https://via.placeholder.com/80?text=TV'">
            <p style="margin-bottom:15px"><strong>${chan.name}</strong></p>
            <button class="btn-play" onclick="playStream('${chan.url}')">ASSISTIR AGORA</button>
        `;
        channelGrid.appendChild(card);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
    // Scroll suave para o topo para ver o player
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (Hls.isSupported()) {
        hls.destroy(); // Limpa player anterior
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
        video.src = url;
        video.play();
    }
};

window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    video.src = ""; // Para o download do vídeo
    if(hls) hls.destroy();
};

init();
