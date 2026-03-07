// ... (mantenha o início do seu app.js)

window.playStream = (url) => {
    playerSection.style.display = 'block';
    
    // Se for celular, esconde a grade para o player ocupar a tela
    if (window.innerWidth < 768) {
        channelGrid.style.display = 'none';
    }

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
    channelGrid.style.display = 'grid'; // Volta a mostrar a grade
    video.pause();
    video.src = "";
    if(hls) hls.destroy();
};
