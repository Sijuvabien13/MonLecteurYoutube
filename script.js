// Fonction pour lire le fichier JSON et générer les boutons sur index.html
function generatePlaylistButtons() {
    fetch('playlists.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(playlists => {
            const controlsDiv = document.getElementById('controls');
            controlsDiv.innerHTML = ''; 

            playlists.forEach(playlist => {
                const link = document.createElement('a');
                // MODIFICATION : On passe l'ID ET le type dans l'URL !
                link.href = `player.html?id=${playlist.id}&type=${playlist.type}`;
                
                const button = document.createElement('button');
                button.textContent = playlist.name;

                link.appendChild(button);
                controlsDiv.appendChild(link);
            });
        })
        .catch(error => {
            console.error('Erreur de chargement des playlists:', error);
            document.getElementById('controls').innerHTML = '<p style="color:red;">Erreur lors du chargement des playlists. (Voir console)</p>';
        });
}

// Logique pour la page du lecteur
function loadPlayer() {
    const iframe = document.getElementById('lecteurYoutube');
    
    // 1. Récupère les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Notez que nous récupérons 'id' au lieu de 'list'
    const type = urlParams.get('type');

    let nouvelleSrc = '';
    
    if (id && type) {
        if (type === 'playlist') {
            // C'est une PLAYLIST : on utilise 'videoseries?list=' et on ajoute le shuffle
            nouvelleSrc = `https://www.youtube.com/embed/videoseries?list=${id}&shuffle=1`;
        } else if (type === 'video') {
            // C'est une VIDEO UNIQUE (Radio) : on utilise 'embed/' et on ajoute la boucle
            // 'autoplay=1' lance la lecture. 'loop=1' met en boucle.
            nouvelleSrc = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}`;
        }
        
        // Applique l'URL construite
        iframe.src = nouvelleSrc;

    } else {
        iframe.style.display = 'none';
        alert("Erreur : Contenu non spécifié. Retour à l'accueil.");
        window.location.href = 'index.html'; 
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('controls')) {
        generatePlaylistButtons();
    }
    if (document.getElementById('lecteurYoutube')) {
        loadPlayer();
    }
});
