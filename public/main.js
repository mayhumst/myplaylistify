
const pinned = []; 

function main() {
    console.log(document.getElementById('pinned').value);
}

function random_gen() {
    const list = document.getElementById("full-list");
    const list_content = list.textContent;
    const arr = list_content.split(",");
    const num = arr.length; 
    const random = Math.floor(Math.random() * num);
    const my_input = document.querySelector("#genre");
    my_input.value = arr[random];
}

function star(num) {
    const this_star = document.querySelector(`.star-${num}`); 
    if(this_star.classList.contains("star-default")) {
        this_star.classList.remove("star-default")
        this_star.classList.add("star-pinned");
        pinned.push(num);
        document.getElementById('pinned').value += (num + ';');
        document.getElementById('final-songs').value += (num + ';');
    }
    else {
        this_star.classList.remove("star-pinned")
        this_star.classList.add("star-default");
        document.getElementById('pinned').value.replace((num + ';'), "")
        document.getElementById('final-songs').value.replace((num + ';'), "")
        
        pinned.splice(pinned.indexOf(num), 1)
        
    }
}

function main_genre(genre) {
    //change genre value to correct one 
    //trigger click of submit button
    document.getElementById('genre').value = genre; 
    document.getElementById('post-submit').click(); 
}

function login_switch(original) {
    if(original === "login") {
        console.log('here');
        document.querySelector('.login').style="display:none;";
        document.querySelector('.signup').style=""; 
    }
    else {
        document.querySelector('.signup').style="display:none;";
        document.querySelector('.login').style=""; 
    }
}

function submit() {
    document.querySelector('.playlist-submit-invisible').className = "playlist-submit-visible"
}

document.addEventListener('DOMContentLoaded', main);