// Fonction pour lire le fichier JSON et générer les boutons sur index.html
function generatePlaylistButtons() {
    fetch('playlists.json')
        .then(response => response.json())
        .then(playlists => {
            const controlsDiv = document.getElementById('controls');
            controlsDiv.innerHTML = ''; // Nettoie le message de chargement

            playlists.forEach(playlist => {
                // Créer le lien vers la page du lecteur
                const link = document.createElement('a');
                // Le lien passe l'ID de la playlist à la page player.html
                link.href = `player.html?list=${playlist.id}`;
                
                // Créer le bouton
                const button = document.createElement('button');
                button.textContent = playlist.name;

                // Assembler le tout
                link.appendChild(button);
                controlsDiv.appendChild(link);
            });
        })
        .catch(error => {
            console.error('Erreur de chargement des playlists:', error);
            document.getElementById('controls').innerHTML = '<p style="color:red;">Erreur lors du chargement des playlists.</p>';
        });
}

// Logique pour la page du lecteur (inchangée)
function loadPlayer() {
    const iframe = document.getElementById('lecteurYoutube');
    
    // 1. Récupère l'ID de la playlist de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('list');
    
    if (playlistId) {
        // 2. Construit l'URL avec l'ID et active le mode SHUFFLE (&shuffle=1)
        const nouvelleSrc = `https://www.youtube.com/embed/videoseries?list=${playlistId}&shuffle=1`;
        iframe.src = nouvelleSrc;
    } else {
        iframe.style.display = 'none';
        // Redirige vers l'accueil si l'ID est manquant
        alert("Erreur : Aucune playlist spécifiée. Retour à l'accueil.");
        window.location.href = 'index.html'; 
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Si la page a l'ID 'controls', nous sommes sur l'accueil
    if (document.getElementById('controls')) {
        generatePlaylistButtons();
    }
    // Si la page a l'ID 'lecteurYoutube', nous sommes sur la page du lecteur
    if (document.getElementById('lecteurYoutube')) {
        loadPlayer();
    }
});
