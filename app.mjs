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

// GLOBALS


// PAGES

app.get('/home', async (req, res) => {

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
    
  res.render( 'home', { layout: 'layout', client_id: process.env.CLIENT_ID, user: req.session.user });
    
});

app.get('/', (req, res) => {
  
  res.redirect('/home');
});

async function getSongsSimple(req, res) {

  let mySongs = {}; 

  if(req.query.genre) {
    const newString = req.query.genre.replace("-", " ")
    
    mySongs = await Song.find({genres: {$all: [newString]}});
  }

  return mySongs;
}

app.get('/generate', async (req, res) => {
  
  const mySongs = await getSongsSimple(req, res);
  res.render( 'generate', { layout: 'layout', songs: mySongs });
  
});

app.get('/myplaylists', (req, res) => {

  res.render( 'mine', { layout: 'layout' });
  
});

app.get('/register', (req, res) => {

    res.render( 'register', { layout: 'layout' });
    
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
    req.session.user = thisUser.display_name;
    req.session.access_token = spotifyResponse.data.access_token;
  
    populate.getUserPlaylists(req, res, spotifyResponse); 
  }
  else {
      console.log("error, continue as anonymous")
  }

  res.redirect('/home');
})


app.listen(process.env.PORT ?? 80);