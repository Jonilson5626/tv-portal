const countryList = document.getElementById('country-list');
const channelGrid = document.getElementById('channel-grid');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');
let hls = new Hls();

async function init() {
    try {
        // Altere o caminho abaixo se sua pasta tiver outro nome (ex: './channels.json')
        const res = await fetch('./data/channels.json'); 
        if (!res.ok) throw new Error("Arquivo não encontrado");
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

        const first = Object.keys(data)[0];
        if(first) renderChannels(data[first]);

    } catch (err) {
        console.error("ERRO CRÍTICO:", err);
        channelGrid.innerHTML = `<p style="color:white;text-align:center;">Erro ao carregar lista de canais.</p>`;
    }
}

function renderChannels(channels) {
    channelGrid.innerHTML = '';
    channels.forEach(chan => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${chan.logo}" class="channel-logo" onerror="this.src='https://via.placeholder.com/60'">
            <p style="color:white;font-size:0.8rem;margin-bottom:10px;">${chan.name}</p>
            <button class="btn-play" onclick="playStream('${chan.url}')">ASSISTIR</button>
        `;
        channelGrid.appendChild(card);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
    if(window.innerWidth < 768) channelGrid.style.display = 'none';
    window.scrollTo({top: 0, behavior: 'smooth'});

    video.muted = true;
    unmuteOverlay.style.display = 'block';

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

window.unmuteVideo = () => {
    video.muted = false;
    unmuteOverlay.style.display = 'none';
};

window.closePlayer = () => {
    playerSection.style.display = 'none';
    channelGrid.style.display = 'grid';
    video.pause();
    unmuteOverlay.style.display = 'none';
    if(hls) hls.destroy();
};

window.toggleFullScreen = () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
};

init();
