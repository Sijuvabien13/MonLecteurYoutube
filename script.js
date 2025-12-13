// Cette fonction est appelée par les boutons dans index.html
function chargerPlaylist(playlistId) {
    const iframe = document.getElementById('lecteurYoutube');
    
    // Construit l'URL avec l'ID de la playlist et active le mode aléatoire (shuffle)
    const nouvelleSrc = `https://www.youtube.com/embed/videoseries?list=${playlistId}&shuffle=1`;
    
    // Met à jour l'attribut src de l'iframe
    iframe.src = nouvelleSrc;
}

// Fonction pour charger la première playlist au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Charger la première playlist par défaut (ID de la Playlist A)
    chargerPlaylist('PLIQjKfP2nq7llaxYJk4UGpcIa1ABgL6kC'); 
});
