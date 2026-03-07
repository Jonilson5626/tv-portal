function renderChannels(countryName, channels) {
    // Definimos uma imagem de bandeira genérica ou baseada no nome
    const flagUrl = `https://flagcdn.com/w80/${getCountryCode(countryName)}.png`;

    channelGrid.innerHTML = `
        <div class="currentplaying">
            <img src="${flagUrl}" class="country-flag-header" onerror="this.src='https://cdn-icons-png.flaticon.com/512/44/44386.png'">
            <p class="heading">${countryName}</p>
        </div>
    `;

    channels.forEach(chan => {
        const row = document.createElement('div');
        row.className = 'channel-row';
        row.onclick = () => playStream(chan.url);

        row.innerHTML = `
            <div class="channel-info-group">
                <img src="${chan.logo}" class="channel-logo-mini" onerror="this.src='https://via.placeholder.com/40'">
                <div class="song-details">
                    <p class="channel-name">${chan.name}</p>
                    <p class="channel-category">TV Online</p>
                </div>
            </div>
            <div class="play-icon"></div>
        `;
        channelGrid.appendChild(row);
    });
}

// Função auxiliar para pegar código da bandeira (exemplo simples)
function getCountryCode(name) {
    const codes = { "Brasil": "br", "Portugal": "pt", "EUA": "us", "Espanha": "es" };
    return codes[name] || "un"; // 'un' para desconhecido
}

// Ajuste na chamada do init() para passar o nome do país
async function init() {
    try {
        const res = await fetch('./data/channels.json');
        const data = await res.json();
        
        Object.keys(data).sort().forEach(country => {
            const li = document.createElement('li');
            li.className = 'country-item';
            li.innerHTML = `<button>${country}</button>`;
            li.onclick = () => {
                renderChannels(country, data[country]);
            };
            countryList.appendChild(li);
        });

        const first = Object.keys(data)[0];
        renderChannels(first, data[first]);
    } catch (err) { console.error(err); }
}
