// add your code here!
import mongoose from 'mongoose';
mongoose.connect(process.env.DSN); 

const Playlist = new mongoose.Schema({
    name: String,
	songs: Array,
	genres: Array
});

const User = new mongoose.Schema({
    username: String,
    genres: Array,
    playlists: Array
});

const Song = new mongoose.Schema({
    name: String, 
    artists: Array, 
    image: String,
    genres: Array, 
    code: String
});

const Genre = new mongoose.Schema({
    name: String,
    tag: String
});

mongoose.model('Playlist', Playlist);
mongoose.model('User', User);
mongoose.model('Song', Song);
mongoose.model('Genre', Genre);