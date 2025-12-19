// --- CONFIGURATION ---
var player; // Variable globale pour le lecteur YouTube
var updateTimer; // Timer pour mettre à jour la barre de progression Android

// --- 1. GÉNÉRATION DU MENU ---
function generatePlaylistButtons() {
    fetch('playlists.json')
        .then(response => {
            if (!response.ok) throw new Error('Erreur HTTP');
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
        .catch(console.error);
}

// --- 2. INITIALISATION API YOUTUBE ---
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

// --- 3. GESTION INTELLIGENTE DE LA MEDIA SESSION ---
function onPlayerStateChange(event) {
    // Si la lecture commence (Etat = 1)
    if (event.data === YT.PlayerState.PLAYING) {
        // 1. On met à jour les infos statiques (Titre, Image)
        updateMediaSessionMetadata();
        
        // 2. On lance une boucle pour mettre à jour le temps (Timer)
        // C'est CRUCIAL pour que les boutons restent affichés
        startPositionTracking();

    } else {
        // Si pause ou fin, on arrête le tracking pour économiser la batterie
        stopPositionTracking();
    }
}

function updateMediaSessionMetadata() {
    if ('mediaSession' in navigator && player) {
        const data = player.getVideoData();
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: data.title || "Lecture en cours",
            artist: data.author || "Mon Site Musique",
            album: "YouTube Player",
            artwork: [
                { src: `https://img.youtube.com/vi/${data.video_id}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' }
            ]
        });

        // Définition des actions (Les boutons)
        // Le fait de les redéfinir à chaque lecture force le navigateur à vérifier leur existence
        navigator.mediaSession.setActionHandler('play', () => player.playVideo());
        navigator.mediaSession.setActionHandler('pause', () => player.pauseVideo());
        navigator.mediaSession.setActionHandler('nexttrack', () => player.nextVideo());
        navigator.mediaSession.setActionHandler('previoustrack', () => player.previousVideo());
    }
}

// Fonction pour dire au téléphone où on en est (ex: 0:45 / 3:50)
// Sans ça, certains téléphones cachent les boutons Suivant/Précédent
function startPositionTracking() {
    stopPositionTracking(); // On nettoie l'ancien timer si besoin
    
    updateTimer = setInterval(() => {
        if ('mediaSession' in navigator && player && player.getDuration) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: player.getDuration(),
                    playbackRate: player.getPlaybackRate(),
                    position: player.getCurrentTime()
                });
            } catch (error) {
                // Ignore les erreurs si la vidéo charge encore
            }
        }
    }, 1000); // Mise à jour toutes les secondes
}

function stopPositionTracking() {
    if (updateTimer) clearInterval(updateTimer);
}

// --- 4. DEMARRAGE GLOBAL ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('controls')) generatePlaylistButtons();

    if (document.getElementById('lecteurYoutube')) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (player && player.nextVideo) player.nextVideo();
        });
    }
});

