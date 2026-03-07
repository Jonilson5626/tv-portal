const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');
let hls = new Hls();

async function init() {
    try {
        const res = await fetch('./data/channels.json');
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        Object.keys(data).sort().forEach(country => {
            const li = document.createElement('li');
            li.className = 'country-item';
            li.innerHTML = `<button>${country}</button>`;
            li.onclick = () => {
                document.querySelectorAll('.country-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                renderChannels(country, data[country]);
            };
            countryList.appendChild(li);
        });

        const firstCountry = Object.keys(data)[0];
        if(firstCountry) renderChannels(firstCountry, data[firstCountry]);

    } catch (err) {
        console.error("Erro ao carregar canais");
    }
}

function renderChannels(countryName, channels) {
    // Cabeçalho da Lista
    listHeader.innerHTML = `
        <img src="https://cdn-icons-png.flaticon.com/512/323/323310.png" class="country-icon">
        <p class="heading">${countryName}</p>
    `;

    channelList.innerHTML = ''; 

    channels.forEach(chan => {
        const row = document.createElement('div');
        row.className = 'channel-row';
        row.onclick = () => playStream(chan.url);

        row.innerHTML = `
            <div class="channel-info">
                <img src="${chan.logo}" class="logo-mini" onerror="this.src='https://via.placeholder.com/40'">
                <div class="name-group">
                    <p class="chan-name">${chan.name}</p>
                    <p class="chan-artist">TV Online HD</p>
                </div>
            </div>
            <div class="play-btn-ui"></div>
        `;
        channelList.appendChild(row);
    });
}

window.playStream = (url) => {
    playerSection.style.display = 'block';
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
    window.scrollTo({top: 0, behavior: 'smooth'});
};

window.unmuteVideo = () => {
    video.muted = false;
    unmuteOverlay.style.display = 'none';
};

window.closePlayer = () => {
    playerSection.style.display = 'none';
    video.pause();
    if(hls) hls.destroy();
};

init();
