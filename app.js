const countryList = document.getElementById('country-list');
const channelGrid = document.getElementById('channel-grid');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
let hls = new Hls();

async function init() {
    try {
        const res = await fetch('./data/channels.json');
        const data = await res.json();
        
        Object.keys(data).forEach(country => {
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
        channelGrid.innerHTML = "Erro ao carregar canais.";
    }
}

function renderChannels(channels) {
    channelGrid.innerHTML = '';
    channels.forEach(chan => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <img src="${chan.logo}" class="channel-logo">
            <p style="font-size:0.8rem; margin-bottom:10px;">${chan.name}</p>
            <button class="btn-play" onclick="playStream('${chan.url}')">ASSISTIR</button>
        `;
        channelGrid.appendChild(card);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
    channelGrid.style.display = 'none'; // Esconde a grade no celular para o player brilhar
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
    if(hls) hls.destroy();
};

init();
