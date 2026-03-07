const countryList = document.getElementById('country-list');
const channelList = document.getElementById('channel-list');
const listHeader = document.getElementById('list-header');
const playerSection = document.getElementById('player-section');
const video = document.getElementById('tv-player');
const unmuteOverlay = document.getElementById('unmute-overlay');
let hls = new Hls();

const countryCodes = { "Brasil": "br", "Portugal": "pt", "Espanha": "es", "EUA": "us" };

async function init() {
    // Tenta carregar de dois lugares possíveis para evitar erro 404 no GitHub
    const paths = ['./data/channels.json', './channels.json'];
    let data = null;

    for (let path of paths) {
        try {
            const res = await fetch(path);
            if (res.ok) {
                data = await res.json();
                break; 
            }
        } catch (e) { continue; }
    }

    if (!data) {
        channelList.innerHTML = `<p style="color:red; text-align:center;">Erro: Arquivo channels.json não encontrado.</p>`;
        return;
    }

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

    const first = Object.keys(data).sort()[0];
    if (first) renderChannels(first, data[first]);
}

function renderChannels(countryName, channels) {
    const code = countryCodes[countryName] || "un";
    const flagUrl = `https://flagcdn.com/w160/${code}.png`;

    listHeader.innerHTML = `
        <img src="${flagUrl}" class="country-icon" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2144/2144830.png'">
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

window.unmuteVideo = () => { video.muted = false; unmuteOverlay.style.display = 'none'; };
window.closePlayer = () => { playerSection.style.display = 'none'; video.pause(); if(hls) hls.destroy(); };

init();
