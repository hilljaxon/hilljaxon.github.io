Game.screens['pause'] = (function(main, sound) {
    'use strict';
    
    function initialize() {
        //
        // Setup each of menu events for the screens
        document.getElementById('resume-game').addEventListener(
            'click',
            function() { 
                main.showScreen('game-screen'); 
            });
        document.getElementById('quit-game').addEventListener(
            'click',
            function() { 
                main.showScreen('main-menu'); 
            });
    }
    
    function run() {
        sound.mute();
        sound.mute();
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(Game.main,Game.sound));
