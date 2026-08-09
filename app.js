/* =========================================================
   TV PORTAL
   APP.JS
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const countries = [

    {
        name: "Brasil",
        path: "brazil",
        flag: "🇧🇷"
    },

    {
        name: "China",
        path: "china",
        flag: "🇨🇳"
    },

    {
        name: "Colômbia",
        path: "colombia",
        flag: "🇨🇴"
    },

    {
        name: "Japão",
        path: "japan",
        flag: "🇯🇵"
    },

    {
        name: "Espanha",
        path: "spain",
        flag: "🇪🇸"
    },

    {
        name: "Estados Unidos",
        path: "united_states",
        flag: "🇺🇸"
    }

];


let currentCountry = "";

let currentCountryName = "";

let currentType = "canais";

let currentData = [];

let hls = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const video =
    document.getElementById("tv-player");

const countryList =
    document.getElementById("country-list");

const channelGrid =
    document.getElementById("channel-grid");

const playerSection =
    document.getElementById("player-section");

const listContainer =
    document.getElementById("list-container");

const welcomeScreen =
    document.getElementById("welcome-screen");

const statusMessage =
    document.getElementById("status-msg");

const videoLoading =
    document.getElementById("video-loading");


/* =========================================================
   STORAGE
========================================================= */

const FAVORITES_KEY =
    "tvportal_favorites";

const RECENT_KEY =
    "tvportal_recent";


function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(FAVORITES_KEY)
        ) || [];

    } catch {

        return [];

    }

}


function saveFavorites(data) {

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(data)
    );

}


function getRecent() {

    try {

        return JSON.parse(
            localStorage.getItem(RECENT_KEY)
        ) || [];

    } catch {

        return [];

    }

}


function saveRecent(data) {

    localStorage.setItem(
        RECENT_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

function init() {

    renderCountries();

    updateCountryCount();

    setupCountrySearch();

    setupGlobalEvents();

}


function updateCountryCount() {

    const element =
        document.getElementById("totalCountries");

    if (element) {

        element.textContent =
            countries.length;

    }

}


/* =========================================================
   PAÍSES
========================================================= */

function renderCountries() {

    if (!countryList) return;

    countryList.innerHTML = "";


    countries.forEach(country => {

        const li =
            document.createElement("li");

        li.className =
            "country-item";


        const button =
            document.createElement("button");


        button.type = "button";


        button.innerHTML = `
            <span class="country-flag">
                ${country.flag}
            </span>

            <span>
                ${escapeHTML(country.name)}
            </span>

            <i class="fas fa-chevron-right"></i>
        `;


        button.addEventListener(
            "click",
            () => selectCountry(
                country,
                li
            )
        );


        li.appendChild(button);

        countryList.appendChild(li);

    });

}


async function selectCountry(
    country,
    element
) {

    currentCountry =
        country.path;

    currentCountryName =
        country.name;


    document
        .querySelectorAll(".country-item")
        .forEach(item => {

            item.classList.remove("active");

        });


    element.classList.add("active");


    if (statusMessage) {

        statusMessage.textContent =
            `${country.flag} ${country.name}`;

    }


    await loadJSON();


    const content =
        document.getElementById("conteudo");

    if (content) {

        content.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   BUSCA DE PAÍSES
========================================================= */

function setupCountrySearch() {

    const input =
        document.getElementById(
            "country-search"
        );


    if (!input) return;


    input.addEventListener(
        "input",
        filterCountries
    );

}


window.filterCountries =
    function () {

        const input =
            document.getElementById(
                "country-search"
            );


        if (!input) return;


        const term =
            input.value
                .toLowerCase()
                .trim();


        document
            .querySelectorAll(".country-item")
            .forEach(item => {

                const text =
                    item.textContent
                        .toLowerCase();


                item.style.display =
                    text.includes(term)
                        ? ""
                        : "none";

            });

    };


/* =========================================================
   CARREGAR JSON
========================================================= */

async function loadJSON() {

    if (!currentCountry) return;


    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }


    if (listContainer) {

        listContainer.style.display =
            "block";

    }


    if (channelGrid) {

        channelGrid.innerHTML = `

            <div class="loading-card">

                <div class="spinner"></div>

                <span>
                    Carregando conteúdo...
                </span>

            </div>

        `;

    }


    const file =
        `./paises/${currentCountry}/${currentType}.json`;


    try {

        const response =
            await fetch(file);


        if (!response.ok) {

            throw new Error(
                `Arquivo não encontrado: ${file}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Formato de JSON inválido."
            );

        }


        currentData = data;

        renderGrid(data);

        updateChannelCount();


    } catch (error) {

        console.error(
            "Erro ao carregar conteúdo:",
            error
        );


        if (channelGrid) {

            channelGrid.innerHTML = `

                <div class="loading-card error-card">

                    <i class="fas fa-circle-exclamation"></i>

                    <strong>
                        Não foi possível carregar os canais.
                    </strong>

                    <span>
                        Verifique se o arquivo
                        ${currentType}.json existe.
                    </span>

                </div>

            `;

        }

    }

}


/* =========================================================
   CONTADOR DE CANAIS
========================================================= */

function updateChannelCount() {

    const element =
        document.getElementById(
            "totalChannels"
        );


    if (!element) return;


    if (currentData.length > 0) {

        element.textContent =
            currentData.length;

    }

}


/* =========================================================
   RENDERIZAÇÃO DOS CANAIS
========================================================= */

function renderGrid(data) {

    if (!channelGrid) return;


    channelGrid.innerHTML = "";


    if (!data.length) {

        channelGrid.innerHTML = `

            <div class="loading-card">

                <i class="fas fa-tv"></i>

                <strong>
                    Nenhum canal encontrado.
                </strong>

            </div>

        `;

        return;

    }


    data.forEach((item, index) => {

        const card =
            document.createElement("div");


        card.className =
            "item-card";


        const logo =
            document.createElement("img");


        logo.src =
            item.logo || "";


        logo.alt =
            item.name || "Canal";


        logo.loading =
            "lazy";


        logo.onerror =
            function () {

                this.onerror = null;

                this.src =
                    createPlaceholderLogo(
                        item.name
                    );

            };


        const name =
            document.createElement("p");


        name.textContent =
            item.name ||
            "Canal sem nome";


        card.appendChild(logo);

        card.appendChild(name);


        card.addEventListener(
            "click",
            () => {

                playChannel(
                    item.url,
                    item.name,
                    item.logo
                );

            }
        );


        channelGrid.appendChild(card);

    });

}


/* =========================================================
   PLAYER
========================================================= */

function playChannel(
    url,
    name,
    logo = ""
) {

    if (!url || !video) {

        showToast(
            "Este canal não possui uma transmissão válida."
        );

        return;

    }


    if (playerSection) {

        playerSection.style.display =
            "block";

    }


    if (listContainer) {

        listContainer.style.display =
            "none";

    }


    const playingNow =
        document.getElementById(
            "playing-now"
        );


    if (playingNow) {

        playingNow.textContent =
            name || "Canal";

    }


    video.muted = true;


    updateAudioButton();


    showVideoLoading();


    destroyHLS();


    try {

        if (
            typeof Hls !== "undefined" &&
            Hls.isSupported() &&
            url.includes(".m3u8")
        ) {

            hls =
                new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });


            hls.loadSource(url);

            hls.attachMedia(video);


            hls.on(
                Hls.Events.MANIFEST_PARSED,
                () => {

                    hideVideoLoading();

                    video.play()
                        .catch(() => {});

                }
            );


            hls.on(
                Hls.Events.ERROR,
                (event, data) => {

                    console.warn(
                        "Erro HLS:",
                        data
                    );

                    if (
                        data.fatal
                    ) {

                        hideVideoLoading();

                        showToast(
                            "Não foi possível reproduzir esta transmissão."
                        );

                    }

                }
            );


        } else {

            video.src = url;


            video.addEventListener(
                "loadeddata",
                hideVideoLoading,
                { once: true }
            );


            video.play()
                .then(() => {

                    hideVideoLoading();

                })
                .catch(error => {

                    console.warn(
                        "Autoplay bloqueado:",
                        error
                    );

                    hideVideoLoading();

                });

        }


    } catch (error) {

        console.error(
            "Erro no player:",
            error
        );

        hideVideoLoading();

        showToast(
            "Erro ao iniciar a transmissão."
        );

    }


    addToRecent({
        name: name,
        url: url,
        logo: logo,
        country: currentCountryName
    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   ÁUDIO
========================================================= */

window.toggleMute =
    function () {

        if (!video) return;


        video.muted =
            !video.muted;


        updateAudioButton();

    };


function updateAudioButton() {

    const button =
        document.getElementById(
            "btn-audio"
        );


    if (!button || !video) return;


    if (video.muted) {

        button.innerHTML = `
            <i class="fas fa-volume-high"></i>
            ATIVAR SOM
        `;

        button.classList.add(
            "audio-button"
        );

    } else {

        button.innerHTML = `
            <i class="fas fa-volume-xmark"></i>
            MUDO
        `;

        button.classList.remove(
            "audio-button"
        );

    }

}


/* =========================================================
   TELA CHEIA
========================================================= */

window.toggleFullScreen =
    function () {

        if (!video) return;


        if (
            video.requestFullscreen
        ) {

            video.requestFullscreen();

        } else if (
            video.webkitRequestFullscreen
        ) {

            video.webkitRequestFullscreen();

        } else if (
            video.msRequestFullscreen
        ) {

            video.msRequestFullscreen();

        }

    };


/* =========================================================
   FECHAR PLAYER
========================================================= */

window.closePlayer =
    function () {

        if (video) {

            video.pause();

            video.removeAttribute(
                "src"
            );

            video.load();

        }


        destroyHLS();


        if (playerSection) {

            playerSection.style.display =
                "none";

        }


        if (listContainer) {

            listContainer.style.display =
                "block";

        }

    };


function destroyHLS() {

    if (hls) {

        try {

            hls.destroy();

        } catch (error) {

            console.warn(error);

        }

        hls = null;

    }

}


/* =========================================================
   TV / RÁDIO
========================================================= */

window.switchType =
    async function (type) {

        currentType =
            type;


        const tvButton =
            document.getElementById(
                "btn-tv"
            );


        const radioButton =
            document.getElementById(
                "btn-radio"
            );


        tvButton?.classList.toggle(
            "active",
            type === "canais"
        );


        radioButton?.classList.toggle(
            "active",
            type === "radios"
        );


        if (statusMessage) {

            statusMessage.textContent =
                currentCountryName
                    ? `${currentCountryName} • ${
                        type === "canais"
                            ? "TV"
                            : "Rádio"
                    }`
                    : "Selecione um país";

        }


        if (currentCountry) {

            await loadJSON();

        }

    };


/* =========================================================
   FAVORITOS
========================================================= */

function isFavorite(url) {

    return getFavorites()
        .some(item => item.url === url);

}


function toggleFavorite(channel) {

    if (!channel?.url) return;


    let favorites =
        getFavorites();


    const exists =
        favorites.some(
            item => item.url === channel.url
        );


    if (exists) {

        favorites =
            favorites.filter(
                item => item.url !== channel.url
            );


        showToast(
            "Removido dos favoritos."
        );

    } else {

        favorites.unshift(channel);


        showToast(
            "Adicionado aos favoritos."
        );

    }


    saveFavorites(favorites);

}


/* =========================================================
   HISTÓRICO
========================================================= */

function addToRecent(channel) {

    if (!channel?.url) return;


    let recent =
        getRecent();


    recent =
        recent.filter(
            item => item.url !== channel.url
        );


    recent.unshift(channel);


    recent =
        recent.slice(0, 10);


    saveRecent(recent);

}


/* =========================================================
   PLACEHOLDER
========================================================= */

function createPlaceholderLogo(name) {

    const text =
        String(name || "TV")
            .substring(0, 12);


    const svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="300"
            height="150"
            viewBox="0 0 300 150"
        >

            <rect
                width="300"
                height="150"
                fill="#171722"
            />

            <text
                x="150"
                y="78"
                text-anchor="middle"
                fill="#a78bfa"
                font-family="Arial"
                font-size="24"
                font-weight="bold"
            >
                ${escapeSVG(text)}
            </text>

        </svg>

    `;


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeSVG(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "tvportal-toast"
        );


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "tvportal-toast";

        toast.style.position =
            "fixed";

        toast.style.left =
            "50%";

        toast.style.bottom =
            "25px";

        toast.style.transform =
            "translateX(-50%) translateY(20px)";

        toast.style.zIndex =
            "9999";

        toast.style.padding =
            "12px 18px";

        toast.style.borderRadius =
            "12px";

        toast.style.background =
            "#181821";

        toast.style.border =
            "1px solid rgba(255,255,255,0.1)";

        toast.style.color =
            "#fff";

        toast.style.fontSize =
            "12px";

        toast.style.fontWeight =
            "600";

        toast.style.opacity =
            "0";

        toast.style.transition =
            "all 180ms ease";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    requestAnimationFrame(() => {

        toast.style.opacity =
            "1";

        toast.style.transform =
            "translateX(-50%) translateY(0)";

    });


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(() => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateX(-50%) translateY(20px)";

        }, 2500);

}


/* =========================================================
   EVENTOS
========================================================= */

function setupGlobalEvents() {

    if (!video) return;


    video.addEventListener(
        "waiting",
        showVideoLoading
    );


    video.addEventListener(
        "playing",
        hideVideoLoading
    );


    video.addEventListener(
        "canplay",
        hideVideoLoading
    );


    video.addEventListener(
        "error",
        () => {

            hideVideoLoading();

        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function showVideoLoading() {

    if (videoLoading) {

        videoLoading.style.display =
            "flex";

    }

}


function hideVideoLoading() {

    if (videoLoading) {

        videoLoading.style.display =
            "none";

    }

}


/* =========================================================
   INICIAR
========================================================= */

init();
