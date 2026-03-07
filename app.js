const countryList = document.getElementById('country-list');
const channelGrid = document.getElementById('channel-grid');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
let hls = new Hls();

async function init() {
    try {
        const res = await fetch('./data/channels.json');
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
        channelGrid.innerHTML = "Erro ao carregar canais.";
    }
}

function renderChannels(channels) {
    channelGrid.innerHTML = '';
    channels.forEach(chan => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${chan.logo}" class="channel-logo" onerror="this.src='https://via.placeholder.com/60?text=TV'">
            <p style="font-size:0.85rem; margin-bottom:12px; height: 32px; overflow: hidden;"><strong>${chan.name}</strong></p>
            <button class="btn-play" onclick="playStream('${chan.url}')">ASSISTIR</button>
        `;
        channelGrid.appendChild(card);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
    channelGrid.style.display = 'none'; 
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (Hls.isSupported()) {
        hls.destroy();
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
    channelGrid.style.display = 'grid';
    video.pause();
    video.src = "";
    if(hls) hls.destroy();
};

// Função de Tela Cheia
window.toggleFullScreen = () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) { /* Safari */
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE11 */
        video.msRequestFullscreen();
    }
};

init();
