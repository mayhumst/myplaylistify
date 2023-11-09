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

mongoose.model('Playlist', Playlist);
mongoose.model('User', User);
