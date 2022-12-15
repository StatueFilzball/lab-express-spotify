require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
  // Retrieve an access token
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));


// Our routes go here:

app.get('/', (req, res) => {
    res.render('index')
} )

app.get('/artist-search', (req, res) => {
    if(req.query.artistName){
        //API logic goes here
        spotifyApi.searchArtists(req.query.artistName)
        .then(data => {
            console.log('The received data from the API: ', data.body.artists.items[0]);
            // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
            res.render('artist-search-result', {artists: data.body.artists.items}) 
          })
          .catch(err => console.log('The error while searching artists occurred: ', err));
    }
})

app.get('/albums/:artistId', (req, res, next) => {

    if (req.params.artistId) {

        const artistName = spotifyApi.getArtist(req.params.artistId)
        .then(data => data.body.name)
        .catch(err => console.log(err));

        const artistAlbums = spotifyApi.getArtistAlbums(req.params.artistId)
        .then(data => data.body.items)
        .catch(err => console.log(err));
       

        Promise.all([artistName,artistAlbums]) 
        .then(data => res.render('albums', { artistName: data[0], artistAlbums: data[1] }))
        .catch(err => console.log(err));


    }   

})



app.get('/tracks/:albumId', (req, res) => {

    if (req.params.albumId) {

        const albumName = spotifyApi.getAlbum(req.params.albumId)
            .then(data => data.body.name)
         .catch(err => console.log(err));

        const albumTracks = spotifyApi.getAlbumTracks(req.params.albumId)
            .then(data => data.body.items)
            .catch(err => console.log(err));

        Promise.all([albumName, albumTracks]).then(data => res.render('tracks', { albumName: data[0], albumTracks: data[1]}))

    } else {
        app.redirect('/');
    }

});




app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
