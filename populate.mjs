

//this function occurs automatically on redirect and takes info from the current user to populate the songs database
export async function getUserPlaylists() {
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
              Authorization: "Bearer " + req.session.data.access_token,
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
                return new Promise(function (resolve, reject) { 
                  setTimeout(resolve, 5); 
                }).then(addSong(req, res, track.track)); 
              }
              else {
                //console.log("DUPLICATE SONG: " + track.track.name)
              }
            }       
            catch(error) {
              console.log("ERROR!")
              console.log(error);
              return;
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
  
    for(const artist of track.artists) {
  
      async function queryArtistGenres() { 
        return new Promise(function (resolve, reject) { 
            setTimeout(resolve, 5); 
        }).then(async function () { 
          const inspectArtist = await axios.get(
            artist.href, 
            {
              headers: {
                Authorization: "Bearer " + spotifyResponse.data.access_token,
              },
            }
          )
          //record genres
          if(inspectArtist.data.genres) {
            await inspectArtist.data.genres.forEach((genre) => {
              songObj.genres.push(genre);
            })
          }
        }); 
      } 
  
      queryArtistGenres().then( () => { songObj.artists.push(artist.name) }) 
  
      //make callback function to query api 
      async function mycb() {
        const inspectArtist = await axios.get(
          artist.href, 
          {
            headers: {
              Authorization: "Bearer " + spotifyResponse.data.access_token,
            },
          }
        )
        //record genres
        if(inspectArtist.data.genres) {
          await inspectArtist.data.genres.forEach((genre) => {
            songObj.genres.push(genre);
          })
        }
      }
  
      //query api with 5ms delay
      //songObj.artists.push(artist.name);
      //get artist
      //const done = setTimeout( mycb, 10);
    }
    // add each artist name to song object, then inspect each artist for genre
    
    //add song info to db
    const dupe = await Song.find({code: songObj.code}); 
    if(dupe.length === 0) {
      const addSongObj = new Song(songObj);
      addSongObj.save();
    }
    // else dupe exists
    // do not do >== 1 because might have accidnetally added more than 1
  }