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
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');

    if (id && type) {
        if (type === 'playlist') {
            // ASTUCE : On ajoute &index=1 (ou un chiffre au hasard) et on s'assure que le shuffle est activé
            // Note: YouTube est capricieux, l'ajout de autoplay=1 aide souvent à valider le shuffle
            iframe.src = `https://www.youtube.com/embed/videoseries?list=${id}&shuffle=1&autoplay=1`;
        } else if (type === 'video') {
            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}`;
        }
    } else {
        iframe.style.display = 'none';
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
