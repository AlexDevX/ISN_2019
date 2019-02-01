// Déclaration des variables globales.
var socket;
var div_game;
var h1_div_connect;

//Joueur
var id = NaN;
var pseudo = "";
var regexPseudo = /^[a-zA-Z0-9_-]{3,16}$/;

//Jeu
var COL = 3
var CASE_PER_COL = 3

function getCase(i,j){
    return document.querySelectorAll('[col="' + i + '"][case="' + j + '"]')[0];
}


//Initialisation
var setupEvents = function() {
    // Affectation des variables globales désignant des éléments de la page html.
    div_game = document.getElementById("game");
    h1_div_connect = document.getElementById("h1_connect_base")

    //L'utilisateur choisit un pseudo
    do{
        pseudo = prompt('Entre ton pseudo :')
    }while(!regexPseudo.test(pseudo) || pseudo == "" || pseudo == NaN || pseudo == undefined || pseudo == null);

    // Initialisation de la connexion avec le serveur.
    socket = io.connect('/');

    //Affichage sur le HTML de la connexion en cours
    div_game.style.backgroundColor = "#e67e22";
    h1_div_connect.innerHTML = "Connexion";

    // Initialisation des variables d'écoutes du serveur
    socket.emit('test', [window.innerWidth, window.innerHeight])
    socket.emit('connect', pseudo);
    socket.on('connected', connected);
    socket.on('start', start);
    socket.on('error',error);
    socket.on('null', function(){
        div_game.innerHTML = "";
        div_game.style.textAlign = "center";
        div_game.style.backgroundColor = "#ff9f43";

        var TextWin = document.createElement("h1");
        TextWin.classList.add("h1_connect");
        TextWin.innerHTML = "Partie nulle !"
        div_game.appendChild(TextWin);
        setTimeout(function(){
            location.reload();
        },3000)
    })
    socket.on('play_validate', function(result){
        var forme = (result[0] == 1) ? "croix" : "rond";
        getCase(result[2],result[1]).classList.add(forme);
    });
    socket.on('result', function(result){
        console.log(result);
        if(result[0].toString() == pseudo && result[1].toString() == id){
            setTimeout(function(){
                div_game.innerHTML = "";
                div_game.style.textAlign = "center";
                div_game.style.backgroundColor = "#27ae60";

                var TextWin = document.createElement("h1");
                TextWin.classList.add("h1_connect");
                TextWin.innerHTML = "Victoire"
                div_game.appendChild(TextWin);
            },5000);
        }else{
            setTimeout(function(){
                div_game.innerHTML = "";
                div_game.style.textAlign = "center";
                div_game.style.backgroundColor = "#e74c3c";

                var TextWin = document.createElement("h1");
                TextWin.classList.add("h1_connect");
                TextWin.innerHTML = "Défaite"
                div_game.appendChild(TextWin);
            },5000);
        }
        setTimeout(function(){
            location.reload();
        },10000);
    });
    socket.on('ping', function(){
        socket.emit('pong', true);
    });
    socket.on('disconnected',function(){
        div_game.innerHTML = "";
        div_game.style.backgroundColor = "#e74c3c";
        var h1_error = document.createElement("h1")
        h1_error.classList.add("h1_connect")
        h1_error.innerHTML = "Un joueur a été déconnecté !"
        div_game.appendChild(h1_error);
        setTimeout(function(){
            location.reload();
        },3000);
    });
}

//On charge la fonction qui est au dessus seulement quand la page est chargée
window.addEventListener("load", setupEvents);


//+-------------------------------+
//| Fonction                      |
//+-------------------------------+

//Fonction qui nous dit que le serveur a bien reçu notre connexion et qu'il reste de la place dans la partie
function connected(result){
    setTimeout(function(){
        div_game.style.backgroundColor = "#27ae60";
        h1_div_connect.innerHTML = "Connecté !";
        id = result.id;
    }, 1500);

    setTimeout(function(){
        div_game.style.backgroundColor = "#3498db";
        h1_div_connect.innerHTML = "En attente";
    }, 2500);
    console.log(result);
}

//Démarrage de la partie
function start(result){
    setTimeout(function(){
        div_game.style.backgroundColor = "#2c3e50";
        h1_div_connect.innerHTML = "Début de la partie !";
        console.log(result);
    }, 3000);

    //Affichage de la grille du morpion
    setTimeout(function(){
        div_game.innerHTML = "";
        div_game.style.backgroundColor = "#c8d6e5";

        for(var i = 1; i<=COL; i++){
            var div_COL = document.createElement("div");
            div_COL.setAttribute('col', i)
            div_COL.classList.add("col");
            for(var j = 1; j<=CASE_PER_COL; j++){
                var div_CASE = document.createElement("div");
                div_CASE.setAttribute('case', j);
                div_CASE.setAttribute('col', i);
                div_CASE.classList.add("case");
                //Evenement "click" en écoute sur les cases
                div_CASE.addEventListener("click",play)
                div_COL.appendChild(div_CASE);
            }
            div_game.appendChild(div_COL);
        }

        //On envoit les coordonnées de la case sur laquelle on veut joueur au serveur
        function play(){
            socket.emit('new_play', [id, this.getAttribute("col"), this.getAttribute("case")]);
        }

    }, 5000);
}

//Le serveur nous dit qu'il n'y a plus de place.
function error(result){
    div_game.style.backgroundColor = "#e74c3c";
    if(result.type == "full"){
        h1_div_connect.innerHTML = "La partie est pleine ! Reviens plus tard.";
    }
}