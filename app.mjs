import './config.mjs';
import './db.mjs';
import express from 'express';
import session from 'express-session';
import axios from 'axios';
import queryString from "query-string";

import mongoose from 'mongoose';
const Playlist = mongoose.model('Playlist');
const User = mongoose.model('User');

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
        if(req.query["code"]) {
            req.session.login = true;
            req.session.user;
            req.session.code = req.query["code"];

        }
    }
    else { //first time on? make session variables
        req.session.login = false;
        req.session.user = '/';

    }


    if(req.query["code"]) {
        req.session.login = true;
        req.session.user = "hello";
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
        console.log(spotifyResponse)
    }
    else {
        //
    }

    res.render( 'home', { layout: 'layout', client_id: process.env.CLIENT_ID, user: req.session.user });
    
});

app.get('/', (req, res) => {
  
    res.redirect('/home');
  
});

app.get('/generate', (req, res) => {
  
    res.render( 'generate', { layout: 'layout' });
  
});

app.get('/myplaylists', (req, res) => {

  res.render( 'mine', { layout: 'layout' });
  
});

app.get('/register', (req, res) => {

    res.render( 'register', { layout: 'layout' });
    
  });



app.listen(process.env.PORT ?? 3000);