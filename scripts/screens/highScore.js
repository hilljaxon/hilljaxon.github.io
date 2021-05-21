Game.screens['high-scores'] = (function(main) {
    'use strict';
    // "Lvl:___, Time:___, Fuel:___"
    let scores = [];
    let leaderBoard = document.getElementById("leaderBoard");

    function checkLocalStorage(){  // check if the local browser has cookies for the leaderBoard
        let storage = localStorage.getItem('Game.highScores');
        if(storage !== null){
            scores = JSON.parse(storage);
        }
        
    }

    function saveScore(gameState){
        scores.push({lvl :gameState.level, 
                     score: gameState.score,
                     "Hit-ratio": (gameState.timesFired==0)? 0:Math.round(gameState.hitsOverall/gameState.timesFired*1000)/10
        });
        scores.sort((a,b)=>{
            if(a.score<b.score) return 1;
            if(a.score>b.score) return -1;
            if(a.lvl>b.lvl) return 1;
            if(a.lvl<b.lvl) return -1;
            if(a["Hit-ratio"]<b["Hit-ratio"]) return 1;
            if(a["Hit-ratio"]>b["Hit-ratio"]) return -1;
            return 0;
        });
        localStorage['Game.highScores'] = JSON.stringify(scores);
    }

    
    function initialize() {
        checkLocalStorage()
        //
        // Setup each of menu events for the screens
        document.getElementById('main-button(high-scores)').addEventListener(
            'click',
            function() { 
                main.showScreen('main-menu'); 
            });
    }

    function report(){
        for(let i = 0;i<Math.min(5,scores.length);i++){
            let s = document.createElement("li")
            s.textContent ="Lvl:"+scores[i].lvl+
                           " Score:"+scores[i].score+
                           " Hit-ratio:"+ scores[i]["Hit-ratio"];
            leaderBoard.appendChild(s)
        }
    }
    
    function run() {
        while(leaderBoard.hasChildNodes()){
            leaderBoard.removeChild(leaderBoard.firstChild)
        }
        report();
    }
    
    return {
        initialize : initialize,
        run : run,
        saveScore: saveScore
    };
}(Game.main));
