
import './config.mjs';
import './db.mjs';
import express from 'express';
import session from 'express-session';
import axios from 'axios';
import queryString from "query-string";

import mongoose from 'mongoose';
const Playlist = mongoose.model('Playlist');
const User = mongoose.model('User');
const Song = mongoose.model('Song');
const Genre = mongoose.model('Genre');

//this function occurs automatically on redirect and takes info from the current user to populate the songs database
export async function getUserPlaylists(req, res, spotifyResponse) {
  //get user playlists
  const myPlaylists = await axios.get(
    "https://api.spotify.com/v1/me/playlists?offset=0&limit=50",
    {
      headers: {
        Authorization: "Bearer " + req.session.access_token,
      },
    }
  );

  //for each playlist, for each songlist in playlist, for each song, add the song
  for(const list of myPlaylists.data.items) {

    console.log(list.name)
    const listDetails = await axios.get(
      list.href,
      {
        headers: {
          Authorization: "Bearer " + req.session.access_token,
        },
      }
    )
    const listurl = listDetails.data.tracks.href
    const songList = await axios.get(
      listurl, 
      {
        headers: {
          Authorization: "Bearer " + req.session.access_token,
        },
      }
    )
    
    for(const track of songList.data.items) {

      if(track.track) {
        try {
          const dupe = await Song.find({code: track.track.id}); 
          if(dupe.length === 0) {
            addSong(req, res, spotifyResponse, track.track); 
          }
          else {
            //console.log("DUPLICATE SONG: " + track.track.name)
          }
        }       
        catch(error) {
          console.log("ERROR!")
          console.log(error);
        }
      }
    }
  }
}

export async function addSong(req, res, spotifyResponse, track) {

  // track song info to store in db
  const songObj = {
    name: track.name, 
    artists: [], 
    image: '',
    genres: [], 
    code: track.id,
  };

  if(track.album.images.length >= 0) {
    try {
      songObj.image = track.album.images[0].url;
    }
    catch(error) {
      console.log("THIS TRACK ALBUM HAS NO IMAGE " + track.name + track.artists[0]);
    }
  }
  else {
    //no image, bypassed check for some reason
  }
  
  //query for artists and genres
  async function addArtistsAndGenres() {
    // add each artist name to song object, then inspect each artist for genre
    for(const artist of track.artists) {
      //get the artist
      songObj.artists.push(artist.name);
      const inspectArtist = await axios.get(
        artist.href, 
        {
          headers: {
            Authorization: "Bearer " + spotifyResponse.data.access_token,
          },
        }
      )

      //record genres to song and genre database
      if(inspectArtist.data.genres) {
        await inspectArtist.data.genres.forEach(async (genre) => {
          //add genre to song info
          songObj.genres.push(genre);
          // if genre not already in genres database, add
          const dupeGen_in_genres = await Genre.find({name: genre}); 
          if(dupeGen_in_genres.length === 0) {
            const genObj = {name: genre, tag: genre.replaceAll(" ", "-")};
            const addGenObj = new Genre(genObj);
            addGenObj.save();
          }
          //if genre not already in USER's genres, add
          const dupeGen_in_user = await User.find({username: req.session.user, genres: {$all: [genre]} }); 
          //updateOne(myquery, newvalues, function(err, res) {
          if(dupeGen_in_user.length === 0) {
            User.updateOne( {username: req.session.user}, {$push: {genres: genre}}).then( async function() { 
              const doublecheck = await User.find({username: req.session.user, genres: {$all: [genre]} }); 
              if(doublecheck == 0) {
                console.log("ERROR!!!! NOT UPDATING PROPERLY!!"); 
                throw new Error('ERR');
              }
            });
          }
        })
      }   
    }  
  }
  
  
  addArtistsAndGenres().then(async function() {
    //add song info to db
    const dupe = await Song.find({code: songObj.code}); 
    if(dupe.length === 0) {
      const addSongObj = new Song(songObj);
      addSongObj.save();
    }
    // else dupe exists
    // do not do >== 1 because might have accidnetally added more than 1
  })
}

function sleeper(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}