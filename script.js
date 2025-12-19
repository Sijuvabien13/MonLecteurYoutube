// --- CONFIGURATION GLOBALE ---
var player; 
var updateTimer; 
let wakeLock = null;

// --- 1. GÉNÉRATION DU MENU (INDEX.HTML) ---
function generatePlaylistButtons() {
    fetch('playlists.json')
        .then(response => {
            if (!response.ok) throw new Error('Erreur de chargement du JSON');
            return response.text();
        })
        .then(textData => JSON.parse(textData))
        .then(playlists => {
            const controlsDiv = document.getElementById('controls');
            if (!controlsDiv) return;
            
            controlsDiv.innerHTML = ''; 
            playlists.forEach(playlist => {
                const link = document.createElement('a');
                link.href = `player.html?id=${playlist.id}&type=${playlist.type}`;
                const button = document.createElement('button');
                button.textContent = playlist.name;
                link.appendChild(button);
                controlsDiv.appendChild(link);
            });
        })
        .catch(err => console.error("Erreur Menu:", err));
}

// --- 2. INITIALISATION API YOUTUBE (PLAYER.HTML) ---
function onYouTubeIframeAPIReady() {
    if (!document.getElementById('lecteurYoutube')) return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');

    if (!id || !type) {
        window.location.href = 'index.html';
        return;
    }

    let playerConfig = {
        height: '450',
        width: '100%',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    };

    if (type === 'playlist') {
        playerConfig.playerVars = { 'listType': 'playlist', 'list': id };
    } else if (type === 'video') {
        playerConfig.videoId = id;
        playerConfig.playerVars = { 'loop': 1, 'playlist': id };
    }

    player = new YT.Player('lecteurYoutube', playerConfig);
}

function onPlayerReady(event) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'playlist') {
        event.target.setShuffle(true);
        event.target.playVideoAt(0);
    } else {
        event.target.playVideo();
    }
}

// --- 3. GESTION DES ÉTATS ET NOTIFICATIONS ---
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        updateMediaSession();
        startPositionTracking();
        requestWakeLock();
    } else {
        stopPositionTracking();
        releaseWakeLock();
    }
}

// Empêche l'écran de mettre l'App en veille profonde
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.log("WakeLock refusé:", err.message);
        }
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
    }
}

function updateMediaSession() {
    if ('mediaSession' in navigator && player) {
        const data = player.getVideoData();
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: data.title || "Lecture en cours",
            artist: data.author || "Mon Lecteur",
            album: "YouTube Music Web",
            artwork: [
                { src: `https://img.youtube.com/vi/${data.video_id}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => player.playVideo());
        navigator.mediaSession.setActionHandler('pause', () => player.pauseVideo());
        navigator.mediaSession.setActionHandler('nexttrack', () => player.nextVideo());
        navigator.mediaSession.setActionHandler('previoustrack', () => player.previousVideo());
        
        navigator.mediaSession.playbackState = "playing";
    }
}

function startPositionTracking() {
    if (updateTimer) clearInterval(updateTimer);
    updateTimer = setInterval(() => {
        if ('mediaSession' in navigator && player && player.getDuration) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: player.getDuration() || 0,
                    playbackRate: player.getPlaybackRate() || 1,
                    position: player.getCurrentTime() || 0
                });
            } catch (e) {}
        }
    }, 1000);
}

function stopPositionTracking() {
    clearInterval(updateTimer);
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "paused";
    }
}

// --- 4. DÉMARRAGE ---
document.addEventListener('DOMContentLoaded', () => {
    // Si on est sur l'index
    if (document.getElementById('controls')) generatePlaylistButtons();

    // Si on est sur le lecteur
    if (document.getElementById('lecteurYoutube')) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Gestion du bouton physique sur la page
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (player && typeof player.nextVideo === 'function') {
                player.nextVideo();
            }
        });
    }
});
                
