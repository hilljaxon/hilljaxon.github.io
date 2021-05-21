
Game.screens['controls'] = (function(main) {
    'use strict';

    let fire_output = {
        ele: document.getElementById('fire-input'),
        listening: false
    };
    let left_output = {
        ele: document.getElementById('move-left-input'),
        listening: false
    };
    let right_output = {
        ele: document.getElementById('move-right-input'),
        listening: false
    };

    function checkLocalStorage(){  // check if the local browser has cookies for the leaderBoard
        let storage = localStorage.getItem('Game.controls');
        if(storage !== null){
            Game.controlMap = JSON.parse(storage);
        }else{
            Game.controlMap = {
                fire: " ",
                left: "ArrowLeft",
                right: "ArrowRight",
            }
        }
    }

    function cacheMap(){
        localStorage['Game.controls'] = JSON.stringify(Game.controlMap);
    }

    function loadMap(){  // populate html page with inputs
        cacheMap();
        if(fire_output.listening){
            fire_output.ele.textContent = "...";
        }else{
            fire_output.ele.textContent = (Game.controlMap['fire']==" "?'Space':Game.controlMap['fire']);
        }

        if(left_output.listening){
            left_output.ele.textContent = "...";
        }else{
            left_output.ele.textContent = Game.controlMap['left'];
        }

        if(right_output.listening){
            right_output.ele.textContent = "...";
        }else{
            right_output.ele.textContent = Game.controlMap['right'];
        }
    }

    function initialize() {
        checkLocalStorage();
        
        window.addEventListener("keydown", function (event) {
            if(fire_output.listening){
                fire_output.listening = false;
                Game.controlMap['fire'] = event.key;
                loadMap();
            }else if(left_output.listening){
                left_output.listening = false;
                Game.controlMap['left'] = event.key;
                loadMap();
            }else if(right_output.listening){
                right_output.listening = false;
                Game.controlMap['right'] = event.key;
                loadMap();
            }
        })

        
        document.getElementById('main-button(controls)').addEventListener('click',function() { 
            main.showScreen('main-menu'); 
        });

        fire_output.ele.addEventListener('click', function() { 
            if(!left_output.listening && !right_output.listening){
                fire_output.listening = !fire_output.listening;
            }
            loadMap();
        });

        left_output.ele.addEventListener('click',function() { 
            if(!fire_output.listening && !right_output.listening){
                left_output.listening = !left_output.listening;
            }
            loadMap();
        });

        right_output.ele.addEventListener('click',function() { 
            if(!fire_output.listening && !left_output.listening){
                right_output.listening = !right_output.listening;
            }  
            loadMap();      
        });
    }

    function run() {
        loadMap();
        // I know this is empty, there isn't anything to do.
    }
    
    
    return {
        initialize : initialize,
        run : run,
    };
}(Game.main));
