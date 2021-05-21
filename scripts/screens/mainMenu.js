Game.screens['main-menu'] = (function(main, model, sound) {
    'use strict';
    let cancelNextRequest = false, // times for keeping track of attract mode
        elapsedTime,
        countdown = 0,
        lastTimeStamp = performance.now();

    function initialize() {
        // Setup each of menu events for the screens
        document.getElementById('new-game-button').addEventListener(
            'click',
            function() { 
                cancelNextRequest = true;
                model.initialize()
                main.showScreen('game-screen');
            });

        document.getElementById('high-scores-button').addEventListener(
            'click',
            function() { 
                cancelNextRequest = true;
                main.showScreen('high-scores'); 
            });

        document.getElementById('controls-button').addEventListener(
            'click',
            function() { 
                cancelNextRequest = true;
                main.showScreen('controls'); 
            });

        document.getElementById('credits-button').addEventListener(
            'click',
            function() { 
                cancelNextRequest = true;
                main.showScreen('credits'); 
            });

        // event listeners to reset the atract mode counter
        window.addEventListener("keydown", function () {
            countdown = 0;
        })
        window.addEventListener('mousemove', function(){
            countdown = 0;
        });
        window.addEventListener('mousedown', function(){
            countdown = 0;
        });
    }

    function beginAttractMode(elapsedTime){
        countdown += elapsedTime;
        if(countdown>10000){
            cancelNextRequest = true;
            model.initialize(true); // attract = true;
            main.showScreen('game-screen');
        };
    };

    function pseudoGameLoop(time){
        elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;
        beginAttractMode(elapsedTime);
        if(!cancelNextRequest) {  // exit clause
            requestAnimationFrame(pseudoGameLoop);
        }
    }
    
    function run() {
        sound.mute();
        cancelNextRequest = false;
        countdown = 0;
        lastTimeStamp = performance.now();
        requestAnimationFrame(pseudoGameLoop)
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(Game.main, Game.model, Game.sound));
