//Déclaration des variables !
var div_game;
var COL = 3
var CASE_PER_COL = 3
var cases = [];
var joueur = 1;
var statut = true;
//Fin de la déclaration !

window.addEventListener("load",main);

function main(){
    div_game = document.getElementById('game');


    for(var i = 1; i<=COL; i++){
        var div_COL = document.createElement("div");
        div_COL.setAttribute('col', i)
        div_COL.classList.add("col");
        for(var j = 1; j<=CASE_PER_COL; j++){
            var div_CASE = document.createElement("div");
            div_CASE.setAttribute('case', j);
            div_CASE.setAttribute('col', i);
            div_CASE.classList.add("case");
            div_CASE.addEventListener("click",play)
            div_COL.appendChild(div_CASE);
        }
        div_game.appendChild(div_COL);
    }

    function play(){
        if(statut == false){ return false; }
        if(!this.hasAttribute("player")){
            this.style.backgroundColor = (joueur == 1) ? "red" : "black";
            this.setAttribute("player", joueur);

            winner(joueur);

            joueur = (joueur == 1) ? "2" : "1";
        }
    }
}

function getCase(i,j){
    return document.querySelectorAll('[col="' + i + '"][case="' + j + '"]')[0];
}

function winner(p){
    var count = 0;
    for(a=1; a<=3; a++){
        for(b=1; b<=3; b++){
            if(getCase(b,a).getAttribute("player") == p){
                count++;
            }
        }
        if(count == 3){
            console.log("Player " + p + " Win !");
            statut = false;
            return p;
        }else{
            count = 0;
        }
    }
    //Diagonales
    if((getCase(1,1).getAttribute("player") == p) && (getCase(2,2).getAttribute("player") == p) && (getCase(3,3).getAttribute("player") == p)){
        console.log("Player " + p + " Win !");
        statut = false;
        return p;
    }else if((getCase(3,1).getAttribute("player") == p) && (getCase(2,2).getAttribute("player") == p) && (getCase(1,3).getAttribute("player") == p)){
        console.log("Player " + p + " Win !");
        statut = false;
        return p;
    }else{
        return 0;
    }
}