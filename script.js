// --- PARTIE 1 : GESTION DU MENU (Page d'accueil) ---

function generatePlaylistButtons() {
    // Note: Pour résoudre vos problèmes de JSON, j'utilise la version texte brut pour le debug
    fetch('playlists.json')
        .then(response => {
            if (!response.ok) throw new Error('Erreur HTTP');
            return response.text(); // On récupère le texte d'abord
        })
        .then(textData => {
            // Petite sécurité : on nettoie le texte si nécessaire avant de parser
            return JSON.parse(textData);
        })
        .then(playlists => {
            const controlsDiv = document.getElementById('controls');
            if (!controlsDiv) return; // Sécurité si on n'est pas sur la page d'accueil
            
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
        .catch(error => {
            console.error('Erreur:', error);
            const controls = document.getElementById('controls');
            if(controls) controls.innerHTML = '<p style="color:red;">Erreur chargement playlists</p>';
        });
}


// --- PARTIE 2 : GESTION DU LECTEUR API YOUTUBE (Page Player) ---

// Cette variable contiendra l'objet lecteur YouTube
var player;

// Fonction appelée automatiquement par l'API YouTube quand elle est prête
function onYouTubeIframeAPIReady() {
    // On vérifie qu'on est bien sur la page avec la div 'lecteurYoutube'
    if (!document.getElementById('lecteurYoutube')) return;

    // Récupération des paramètres URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');

    if (!id || !type) {
        alert("Erreur : Pas de média sélectionné.");
        window.location.href = 'index.html';
        return;
    }

    // Configuration spécifique selon le type
    let playerConfig = {
        height: '450',
        width: '100%',
        events: {
            'onReady': onPlayerReady
        }
    };

    if (type === 'playlist') {
        playerConfig.playerVars = {
            'listType': 'playlist',
            'list': id
            // Note: on ne met pas shuffle ici, on le force dans onPlayerReady
        };
    } else if (type === 'video') {
        playerConfig.videoId = id; // Pour une vidéo unique
        playerConfig.playerVars = {
            'loop': 1,
            'playlist': id // Nécessaire pour que le loop fonctionne sur une vidéo unique
        };
    }

    // Création du lecteur
    player = new YT.Player('lecteurYoutube', playerConfig);
}

// Fonction appelée quand le lecteur est chargé et prêt à jouer
function onPlayerReady(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    if (type === 'playlist') {
        // C'EST ICI QUE LA MAGIE OPÈRE POUR LE SHUFFLE
        // 1. On force le mode aléatoire
        event.target.setShuffle(true);
        
        // 2. On joue la vidéo à l'index 0 de la liste MÉLANGÉE
        // (Sans cette ligne, le shuffle est actif mais l'ordre visuel reste parfois le même au début)
        event.target.playVideoAt(0);
        
    } else {
        // Pour une vidéo/radio, on lance juste la lecture
        event.target.playVideo();
    }
}

// --- PARTIE 3 : INITIALISATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Si on est sur l'accueil, on génère les boutons
    if (document.getElementById('controls')) {
        generatePlaylistButtons();
    }

    // Si on est sur le lecteur, on doit charger le script de l'API YouTube
    if (document.getElementById('lecteurYoutube')) {
        // Injection dynamique du script API YouTube
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
});
                    
