# myplaylistify

## Overview

Ever get a craving for new songs that match that /one specific mood/ but can't find it? Ever wish you had a genre-bending playlist that the spotify algorithm can't quite seem to conjure?

This is a web app connected to the Spotify API that can produce playlists for you with one click! Choose a common genre or get niche with it -- the app will produce ten songs that match your mood of the day. Start listening and enjoy!

## Data Model

The application will store genres, songs, artists, and playlists. 

* users can save playlists to their session and edit them. 
* generating new playlists should not reuse songs unless the user pins them. 
* different genres should produce different songs. 

An Example Playlist:

```javascript
{
  name: "my awesome playlist",
  songs: // an array of songs,
  genres: // an array of genres from the song info
}
```

An Example User:

```javascript
{
  username: "my awesome playlist",
  password: // hashed password? Maybe sha2 + salt?? 
  genres: // an array of top genres for this user
  playlists: //array of this user's playlists
}
```


## [Link to Commented First Draft Schema](db.mjs) 

## Wireframes

/home - page for creating a new shopping list

![list create](documentation/home.jpg)

/myplaylists - page for showing all shopping lists

![list](documentation/mylists.jpg)

/generate - page for generating playlists

![list](documentation/common.jpg)
![list](documentation/random.jpg)
![list](documentation/specific.jpg)

## Site map

![list](documentation/sitemap.jpg)

## User Stories or Use Cases

1. as non-registered user, I can register a new account with the site
2. as a user, I can log in to the site
3. as a user or non-user, I can generate playlists, pin songs, and mix genres
4. as a user, I can save a playlist to my playlists
5. as a user, I can see and edit my old saved playlists

## Research Topics

* (5 points) Integrate user authentication
    * I'm going to be using my own hash function for password hashing and keep the pswds in a db
    * I will create an example user to showcase
    * May integrate cybersecurity principles if I can find a good method
* (3 points) Configuration management with dotenv
* (1-6 points) Use of external Spotify API
    * I will use the Spotify API for all song selection and saving
    * most likely will NOT require spotify accounts to be registered
    * will use their genre seeds 
    * may use their play function


~10 points of 10 (approximate)


## [Link to Initial Main Project File](app.mjs) 

## Annotations / References Used

None yet

