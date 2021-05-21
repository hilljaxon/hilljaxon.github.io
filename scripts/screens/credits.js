Game.screens['credits'] = (function(main) {
    'use strict';
    
    function initialize() {
        //
        // Setup each of menu events for the screens
        document.getElementById('main-button(credits)').addEventListener(
            'click',
            function() { 
                main.showScreen('main-menu'); 
            });
    }
    
    function run() {
        // I know this is empty, there isn't anything to do.
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(Game.main));
