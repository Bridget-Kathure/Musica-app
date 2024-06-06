const clientId = 'e2c54682a9e9419aa31a7a8ce1ae29b5'; // Replace with your Spotify Client ID
const clientSecret = '92d05d9111ee4c9f8e08546103b38dc1'; // Replace with your Spotify Client Secret
// Function to get Spotify token
async function getToken() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await result.json();
    return data.access_token;
}
// Function to get songs from Spotify API
async function getSongs(token) {
    const result = await fetch('https://api.spotify.com/v1/browse/new-releases', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await result.json();
    return data.albums.items;
}

const _searchArtists = async (token, query) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    });
    const data = await response.json();
    // Filter the search results to display only the artist you have searched for
    const filteredArtists = data.artists.items.filter(artist => artist.name.toLowerCase() === query.toLowerCase());
    return filteredArtists.map(artist => ({
      name: artist.name,
      id: artist.id,
      images: artist.images, // Include images array
      external_urls: artist.external_urls
    }));
}

  

// Function to display songs
function displaySongs(songs) {
    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';
    songs.forEach(song => {
        const musicItem = document.createElement('div');
        musicItem.classList.add('music-item');
        const img = document.createElement('img');
        img.src = song.images[0].url;
        img.alt = song.name;
        const title = document.createElement('h3');
        title.textContent = song.name;
        const link = document.createElement('a');
        link.href = song.external_urls.spotify;
        link.target = '_blank';
        link.textContent = 'Listen on Spotify';
        musicItem.appendChild(img);
        musicItem.appendChild(title);
        musicItem.appendChild(link);
        musicList.appendChild(musicItem);
    });
}

// Initialize the app
async function init() {
    const token = await getToken();
    const songs = await getSongs(token);
    displaySongs(songs);
}


fetch('https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg/top-tracks')
  .then(response => response.json())
  .then(data => {
    const songs = data.tracks.items;
    const genres = data.genres;

    const songsContainer = document.getElementById('songs');
    const genresContainer = document.getElementById('genreList');

    songs.forEach(song => {
      const songElement = document.createElement('div');
      songElement.className = 'song';

      const img = document.createElement('img');
      img.src = song.album.images[0].url;
      img.alt = song.name;

      songElement.appendChild(img);

      songsContainer.appendChild(songElement);
    });

    genres.forEach(genre => {
      const genreElement = document.createElement('div');
      genreElement.className = 'genre';

      const img = document.createElement('img');
      img.src = genre.image.url;
      img.alt = genre.name;

      genreElement.appendChild(img);

      genresContainer.appendChild(genreElement);
    });
  });

document.addEventListener('DOMContentLoaded', init);