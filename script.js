function toggleMenu(){
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}


const APIController = (function() {
  const clientId = "e2c54682a9e9419aa31a7a8ce1ae29b5";
  const clientSecret = "92d05d9111ee4c9f8e08546103b38dc1";
  const _getToken = async () => {
    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization' : 'Basic ' + btoa( clientId + ':' + clientSecret)
      },
      body: 'grant_type=client_credentials'
    });
    const data = await result.json();
    return data.access_token;
  }
  const _getRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const url = "https://accounts.spotify.com/api/token";
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         client_id: clientId
       })
     }
     const result = await fetch(url, payload);
     const data = await result.json();
     return data.refresh_token
   }
  const _searchArtists = async (token, query) => {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    });
    const data = await response.json();
    const filteredArtists = data.artists.items.filter(artist => artist.name.toLowerCase() === query.toLowerCase());
    return filteredArtists.map(artist => ({
      name: artist.name,
      id: artist.id,
      images: artist.images,
      external_urls: artist.external_urls
    }));
  }
  async function getSongs(token) {
    const result = await fetch('https://api.spotify.com/v1/browse/new-releases', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await result.json();
    return data.albums.items;
}
  const _getArtistTopTracks = async (token, artistId) => {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=Kenya`, {
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    });
    const data = await response.json();
    return data.tracks;
  }
  return {
    getSongs: getSongs,
    _getToken: _getToken,
    _getRefreshToken:_getRefreshToken,
    _searchArtists: _searchArtists,
    _getArtistTopTracks: _getArtistTopTracks
  }
})();
const UIController = (function() {
  const DOMElements = {
    searchInput: '#searchInput',
    searchButton: '#searchButton',
    resultsList: '#resultsList',
    musicList: "#musicList",
    genresSection: "#genresSection",
    artistsSection: "#artistsSection",
    albumsSection: "#albumsSection",
    // seeMoreButton: '#seeMoreButton',
    // seeLessButton: '#seeLessButton'
  }
  function displaySongs(songs, maxItems = 5) {
    const musicList = document.getElementById('musicList');
    musicList.innerHTML = '';
    songs.slice(0, maxItems).forEach(async (song) => {
      const musicItem = createMusicItem(song);
      musicList.appendChild(musicItem);
    });
    // if (songs.length > maxItems) {
    //   const seeMoreButton = document.createElement('button');
    //   seeMoreButton.textContent = 'See More';
    //   seeMoreButton.setAttribute('id', 'seeMoreButton');
    //   musicList.appendChild(seeMoreButton);
    // }
  }
  function createMusicItem(song) {
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
    return musicItem;
  }
  // function displayMoreSongs(songs) {
  //   displaySongs(songs, songs.length);
  //   const seeLessButton = document.createElement('button');
  //   seeLessButton.textContent = 'See Less';
  //   seeLessButton.setAttribute('id', 'seeLessButton');
  //   musicList.appendChild(seeLessButton);
  // }
  const displaySectionContent = (section, data, maxItems = 5) => {
    const sectionElement = document.querySelector(section);
    sectionElement.innerHTML = '';
    data.slice(0, maxItems).forEach(item => {
      const listItem = document.createElement('div');
      listItem.classList.add('listItems');
      const title = document.createElement('h3');
      title.textContent = item.name;
      if (item.images && item.images.length > 0) {
        const image = document.createElement('img');
        image.src = item.images[0].url;
        image.alt = item.name;
        listItem.appendChild(image);
      }
      const link = document.createElement('a');
      link.href = item.external_urls.spotify;
      link.textContent = 'Listen on Spotify';
      link.target = '_blank';
      listItem.appendChild(title);
      listItem.appendChild(link);
      sectionElement.appendChild(listItem);
    });
    // if (data.length > maxItems) {
    //   const seeMoreButton = document.createElement('button');
    //   seeMoreButton.textContent = 'See More';
    //   seeMoreButton.setAttribute('id', 'seeMoreButton');
    //   sectionElement.appendChild(seeMoreButton);
    // }
  };
  const displayArtistResults = async (artists) => {
    const resultsList = document.querySelector(DOMElements.resultsList);
    resultsList.innerHTML = '';
    artists.slice(0, 5).forEach(async (artist) => {
      const listItem = document.createElement('div');
      listItem.setAttribute("class", "listItems");
      const title = document.createElement('h3');
      title.innerHTML = artist.name;
      const artistImage = document.createElement('img');
      if (artist.images.length > 0) {
        artistImage.src = artist.images[0].url;
        artistImage.alt = artist.name;
        listItem.appendChild(artistImage);
      }
      const link = document.createElement('a');
      link.href = artist.external_urls.spotify;
      link.textContent = 'Listen Here';
      link.target = '_blank';
      listItem.appendChild(title);
      listItem.appendChild(link);
      resultsList.appendChild(listItem);
    });
    const token = await APIController._getToken();
    const tracks = await APIController._getArtistTopTracks(token, artists[0].id);
    displayTracks(tracks);
  }
  const displayTracks = (tracks) => {
    const resultsList = document.querySelector(DOMElements.resultsList);
    tracks.forEach(track => {
      const trackItem = document.createElement('div');
      trackItem.innerHTML = `<strong>${track.name}</strong> - ${track.album.name}`;
      resultsList.appendChild(trackItem);
    });
  }
  return {
    DOMElements: DOMElements,
    displayArtistResults: displayArtistResults,
    displaySongs: displaySongs,
    // displayMoreSongs: displayMoreSongs,
    displaySectionContent: displaySectionContent
  }
})();
const APPController = (function(APICtrl, UICtrl) {
  const DOMElements = UICtrl.DOMElements;
  const searchButton = document.querySelector(DOMElements.searchButton);
  async function displayInitialData() {
    const token = await APICtrl._getToken();
    const songs = await APICtrl.getSongs(token);
    UICtrl.displaySongs(songs);
    const genres = await fetchGenres(token);
    const artists = await fetchArtists(token);
    const albums = await fetchAlbums(token);
    UICtrl.displaySectionContent(DOMElements.genresSection, genres);
    UICtrl.displaySectionContent(DOMElements.artistsSection, artists);
    UICtrl.displaySectionContent(DOMElements.albumsSection, albums);
  }
  async function fetchGenres(token) {
    try {
      const response = await fetch('https://api.spotify.com/v1/browse/categories', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      return data.categories.items.map(item => ({ name: item.name, external_urls: item.href, images: item.icons }));
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }
  async function fetchArtists(token) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/following?type=artist', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      return data.artists.items.map(item => ({ name: item.name, external_urls: item.external_urls, images: item.images }));
    } catch (error) {
      console.error('Error fetching artists:', error);
      return [];
    }
  }
  async function fetchAlbums(token) {
    try {
      const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      return data.albums.items.map(item => ({ name: item.name, external_urls: item.external_urls, images: item.images }));
    } catch (error) {
      console.error('Error fetching albums:', error);
      return [];
    }
  }
  displayInitialData();
  searchButton.addEventListener('click', async () => {
    const searchInput = document.querySelector(DOMElements.searchInput);
    const searchQuery = searchInput.value;
    const token = await APICtrl._getToken();
    const artists = await APICtrl._searchArtists(token, searchQuery);
    UICtrl.displayArtistResults(artists);
  });
  document.addEventListener('click', async (event) => {
    if (event.target.id === 'seeMoreButton') {
      const token = await APICtrl._getToken();
      const songs = await APICtrl.getSongs(token);
      UICtrl.displayMoreSongs(songs);
    } else if (event.target.id === 'seeLessButton') {
      const token = await APICtrl._getToken();
      const songs = await APICtrl.getSongs(token);
      UICtrl.displaySongs(songs);
    }
  });
  return {
    init: function() {
      console.log('App is starting');
    }
  }
})(APIController, UIController);
APPController.init();