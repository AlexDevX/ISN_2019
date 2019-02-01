var http = require('http');
var url = require('url');
var fs = require('fs');
console.log('\x1b[33m', 'Démarrage du serveur...');
var sockets = []; // Pour stocker les sockets des différents clients connectés.
var users = [];
var joueur = 1;
var tab = [[],["",0,0,0,""],["",0,0,0,""],["",0,0,0,""]];
var statut = false;
var timeset;
var ping_nbr = 0;

function checkWin(p,x,y){
    //Horrizontale
    for(var i = 1; i <= 3; i++){
        var count = 0;
        for(var j = 1; j <= 3; j++){
            if(tab[i][j] == p){
                count ++;
                if(count >= 3){
                    console.log("Player " + p + " Win !");
                    statut = false;
                    return true;
                }
            }
        }
        count = 0;
    }

    //Verticale
    for(var i = 1; i <= 3; i++){
        var count = 0;
        for(var j = 1; j <= 3; j++){
            if(tab[j][i] == p){
                count ++;
                if(count >= 3){
                    console.log("Player " + p + " Win !");
                    statut = false;
                    return true;
                }
            }
        }
        count = 0;
    }

    //Diagonales
    if((tab[1][1] == p) && (tab[2][2] == p) && (tab[3][3] == p)){
        console.log("Player " + p + " Win !");
        statut = false;
        return true;
    }else if((tab[3][1] == p) && (tab[2][2] == p) && (tab[1][3] == p)){
        console.log("Player " + p + " Win !");
        statut = false;
        return true;
    }
}

function checkNull(){
	console.log(tab);
    var counts = 0;
    for(var c = 1;c <= 3; c++){
        for(var d = 1; d <= 3; d++){
            if(parseInt(tab[c][d]) == 0){
                counts++;
                console.log("++");
            }
        }
    }
    if(counts == 0){
        return true;
    }else{
        return false;
    }
}

// Gestion des chargements par le client des fichiers index.html, client.js, style.css et socket.io.js.
var server = http.createServer(function(req, res) {
    var page=url.parse(req.url).pathname;
    if (page == '/') {
        fs.readFile('./index.html', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(content);
        })
    }
    else if (page == '/client.js'){
        fs.readFile('./client.js', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(content);
        })
    }
    else if (page == '/style.css'){
        fs.readFile('./style.css', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/css"});
            res.end(content);
        })
    }
    else if (page == '/socket.io/socket.io.js'){
        fs.readFile('./socket.io/socket.io.js', 'utf-8', function(error, content) {
            res.writeHead(200, {"Content-Type": "text/javascript"});
            res.end(content);
        })
    }
    else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("Fichier non trouvé.\n");
        res.end();
    }
});

// Chargement de socket.io
var io = require('socket.io').listen(server);
//io.set('log level', 1);
console.log('\x1b[35m', 'Serveur démarré !');
// Fonction qui classe un score.
// ***les console.log(...) sont inutile, ils permettent juste de voir ce que fait le serveur en temps réel.
var classer = function (message) {
        console.log("\x1b[36m", message[0] + " → " + message[1]);
        for (var i=0; i<sockets.length; i++) {
            sockets[i].emit('listen',['message', message[0], message[1], '']);
        }
    }            
// Quand on client se connecte, on le note dans la console et envoie un message au client
io.sockets.on('connection', function (socket) {
    // ajout de la socket à la liste.
    socket.on('test', function(result){
        console.log("Ecran : " + result[0] + "x" + result[1]);
    });

    socket.on('connect', function(pseudo){
        if(sockets.length != 0 && sockets.length < 2){
            //Deux utilisateurs connectés
            sockets.push(socket);
            users.push({ref: users.length+1,pseudo: pseudo,id: socket.id});
            socket.emit('connected',{id: socket.id,full: true});
            //Lancement de la partie
            statut = true;
            setTimeout(function(){
                for(var i=0;i<sockets.length;i++){
                    sockets[i].emit('start',"Début de la partie");
                }
            },3000)
        }else if(sockets.length == 0){
            //Utilisateur seul
            sockets.push(socket);
            users.push({ref: users.length+1,pseudo: pseudo,id: socket.id});
            socket.emit('connected',{id: socket.id,full: false});
        }else if(statut){
            socket.emit('error',{type: "full"})
        }else{
            socket.emit('error',{type: "full"})
        }
    });

    socket.on('new_play', function(result){
        console.log(socketToRef(result[0]) + " ( " + result[0] + " ) veut jouer en " + result[2] + " ; " + result[1]);

        if((socketToRef(result[0]) == joueur) && (tab[result[2]][result[1]] == 0) && (statut)){
            tab[result[2]][result[1]] = socketToRef(result[0])

            for(var i=0;i<sockets.length;i++){
                sockets[i].emit('play_validate', [socketToRef(result[0]),result[2],result[1]]);
            }
            console.log("Coup joué.")
            if(checkWin(socketToRef(result[0]),result[2],result[1])){
                for(var i=0;i<sockets.length;i++){
                    sockets[i].emit('result', [users[socketToRef(result[0])-1].pseudo,result[0]]);
                }
                users = [];
                sockets = [];
                joueur = 1;
                tab = [[],["",0,0,0,""],["",0,0,0,""],["",0,0,0,""]];
                statut = false;
            }
            if(checkNull() == true){
                for(var i=0;i<sockets.length;i++){
                    sockets[i].emit('null', true);
                }
                users = [];
                sockets = [];
                joueur = 1;
                tab = [[],["",0,0,0,""],["",0,0,0,""],["",0,0,0,""]];
                statut = false;
            }
            joueur = (joueur == 1) ? 2 : 1;
        }else{
            console.log("Coup incorrect.")
        }
    });

    socket.on('disconnect', function(){
    	if(statut){
            for(var i=0;i<sockets.length;i++){
                sockets[i].emit('ping',true);
            }

            timeset = setTimeout(function(){
                console.log("Un joueur s'est déconnecté !")
                for(var i=0;i<sockets.length;i++){
                    sockets[i].emit('disconnected',true);
                }
                users = [];
                sockets = [];
                joueur = 1;
                tab = [[],["",0,0,0,""],["",0,0,0,""],["",0,0,0,""]];
                statut = false;
            },60000);
    	}
    })

    socket.on('pong', function(){
        ping_nbr++
        if(ping_nbr >= 2){
            console.log("Une déconnexion a été empêchée !");
            clearTimeout(timeset);
            ping_nbr = 0;
        }
    })
});

// Lancement du serveur
server.listen(8080, '0.0.0.0');

function socketToRef(socket){
    function check(element){
        return element.id == socket;
    }
    return users.findIndex(check)+1
}