
Game.screens['game-screen'] = (function(gameModel, main, graphics, input, sound) {
    let keyboard = input.Keyboard(),
    cancelNextRequest = false,
    lastTimeStamp = performance.now();

    function initialize() {
        console.log('game initializing...');
        gameModel.initialize();
        keyboard.registerCommand("Escape", function() {
            cancelNextRequest = true;
            console.log("CHECKPOINT")
            main.showScreen('pause');
        });
    }

    function processInput(elapsedTime) {
        keyboard.update(elapsedTime);
        gameModel.processInput(elapsedTime);
    }

    function update(elapsedTime) {
        if(gameModel.update(elapsedTime)){
            cancelNextRequest = true;
            main.showScreen("main-menu");
        }
    }

    function render() {
        graphics.clear();
        gameModel.render();
    }

    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        if (!cancelNextRequest) {  // exit clause
            requestAnimationFrame(gameLoop);
        }
    }

    function run() {
        sound.play('background');
        lastTimeStamp = performance.now();

        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    }

    return {
        cancelNextRequest: cancelNextRequest,
        initialize : initialize,
        run : run
    };
}(Game.model, Game.main, Game.graphics, Game.input, Game.sound));