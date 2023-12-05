import './config.mjs';
import './db.mjs';
import * as populate from './populate.mjs';
import express from 'express';
import session from 'express-session';
import axios from 'axios';
import queryString from "query-string";

import mongoose from 'mongoose';
const Playlist = mongoose.model('Playlist');
const User = mongoose.model('User');
const Song = mongoose.model('Song');
const Genre = mongoose.model('Genre');

const app = express();

// set up express static
import url from 'url';
import path from 'path';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

//config session
const sessionOptions = { 
	secret: 'my secret', 
	saveUninitialized: false, 
	resave: false 
};
app.use(session(sessionOptions));

// configure templating to hbs
app.set('view engine', 'hbs');

// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

//
// GLOBAL VARS
//



//
// HELPER FUNCTIONS
//

async function getSongsSimple(req, res) {
  //helper function to query database for songs matching requested genre
  //query genre to get the correct tag
  const genretag = await Genre.find({name: req.body.genre}); 
  let mySongs = {}; 
  if(genretag) {
    mySongs = await Song.find({genres: {$all: [genretag[0].name]}});
  }
  return mySongs;
}


//
// PAGES
//

app.get('/home', async (req, res) => {
  //real homepage
  if(req.session.login === true) { //logged in 
    //
  }
  else if(req.session.login === false) {
    //
  }
  else { //first time on? make session variables
      req.session.user = '/';
      req.session.login = false;
  }
    
  res.render( 'home', { layout: 'layout', client_id: process.env.CLIENT_ID, user: req.session.user, url_encoded: process.env.REDIRECT_ENCODE });
    
});

app.get('/', (req, res) => {
  // redirect to real homepage
  res.redirect('/home');
});

app.get('/generate', async (req, res) => {
  const myGenres = await Genre.find({});
  res.render( 'generate', { layout: 'layout', url: process.env.BASE_URL, user: req.session.user, pinnedsongs: [], songs: [], niche: myGenres });
});

app.post('/generate', async (req, res) => {
  let newsongs; 
  const myGenres = await Genre.find({});
  //get pinned songs 
  const pinnedarrID = req.body.pinned.split(';');
  const pinnedarrSong = []; 
  await pinnedarrID.forEach(async element => {
    const thissong = await Song.find({code: element});
    if(thissong.length > 0) {
      pinnedarrSong.push(thissong[0])
    }
  });
  //query new songs from db
  newsongs = await getSongsSimple(req, res)
  //render with list of pinned + list of new generated
  res.render( 'generate', { layout: 'layout', url: process.env.BASE_URL, user: req.session.user, pinnedsongs: pinnedarrSong, songs: newsongs, niche: myGenres });
});

app.post('/login', (req, res) => {
  req.session.user = req.body.user; 
  res.redirect('/generate'); 
});

app.post('/signup', (req, res) => {
  req.session.user = req.body.user; 
  res.redirect('/generate'); 
});

app.get('/myplaylists', async (req, res) => {
  const myplaylists = await User.find({name: req.session.user})
  res.render( 'mine', { layout: 'layout', user: req.session.user, playlists: myplaylists.playlists });
});

app.get('/register', (req, res) => {
  res.render( 'register', { layout: 'layout', client_id: process.env.CLIENT_ID, user: req.session.user, url_encoded: process.env.REDIRECT_ENCODE });
});

app.get('/redir', async (req, res) => { //when user signs into spotify, redirects here to handle data and config, then redirects again to home
  if(req.query["code"]) {
        
    //get access token
    const spotifyResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        queryString.stringify({
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: process.env.REDIRECT_DECODE,
        }),
        {
          headers: {
            Authorization: "Basic " + process.env.BASE_64,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
    );

    //get user
    const thisUser = await axios.get(
      "https://api.spotify.com/v1/me", 
      {
        headers: {
          Authorization: "Bearer " + spotifyResponse.data.access_token,
        },
      }
    );
    //session variables
    req.session.login = true;
    req.session.user = thisUser.data.display_name;
    req.session.access_token = spotifyResponse.data.access_token;
      
    const checkUser = await User.find({username: thisUser.data.display_name});
    console.log("checking user " + thisUser.data.display_name);
    if(checkUser.length === 0) {
      // make new user and populate
      console.log("new user! ");
      const userObj = {
        username: thisUser.data.display_name, 
        genres: [], 
        playlists: []
      };
      const addUserObj = new User(userObj);
      addUserObj.save();

      /* try {
        populate.getUserPlaylists(req, res, spotifyResponse); 
      }
      catch(err) {
        console.log("error in populate: potentially overwhelming API calls");
        console.log(err);
      } */
      
    }
    else {
      console.log("old user... ");
      /* try {
        populate.getUserPlaylists(req, res, spotifyResponse); 
      }
      catch(err) {
        console.log("error in populate: potentially overwhelming API calls");
        console.log(err);
      } */
    }
    
  }
  else {
    console.log("error, continue as anonymous");
  }

  res.redirect('/home');
});

app.post('/login', (req, res) => {

});

app.post('/playlist', async (req, res) => {
  const pinnedarrID = req.body['final-songs'].split(';');
  const pinnedarrSong = []; 
  await pinnedarrID.forEach(async element => {
    const thissong = await Song.find({code: element});
    if(thissong.length > 0) {
      pinnedarrSong.push(thissong[0])
    }
  });

  const genObj = {name: req.body['playlist-name'], genres: [], songs: pinnedarrSong};
  const addGenObj = new Playlist(genObj);
  addGenObj.save();

  const findObj = await Playlist.find({name: req.body['playlist-name'], genres: [], songs: pinnedarrSong});

  if(req.session.user != '/') {
    User.updateOne( {username: req.session.user}, {$push: {playlists: findObj.id}})
  }

  res.redirect('/myplaylists');
});


app.listen(process.env.PORT ?? 80);