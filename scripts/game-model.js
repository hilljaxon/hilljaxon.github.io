// game modes
    // title/into banner/layover
    // Level intro/transition
    // primary game-play
        /*
        * waves
        */
    // game over

Game.model = (function(components, graphics, input, sound, screens) {
    'use strict';
    let width = components.global.width,
        height = components.global.height;
    let keyboard = input.Keyboard(),
        particleSystem = components.global.particleSystem,
        attractMode = false,
        quit = [];
    let AI = GalagaAI(quit),
        internalUpdate,
        internalRender,
        elapsedCountdown,
        player,
        enemies,
        fire,
        livesRemaining,
        scoreLabel = {},
        scoreText = {},
        countdownText = {
            text: "3",
            font: 'bold 40px courier',
            fill: 'rgba(75, 75, 200, 1)',
            stroke: 'rgba(0, 0, 0, 1)',
        },
        GameOverText = {
            text: "Game Over",
            font: 'Bold 128px Monospace',
            fill: 'rgba(150, 0, 0, 1)',
            stroke: 'rgba(0, 0, 0, 1)',
        },
        statsText = {
            text: "Results",
            font: 'Bold 40px Monospace',
            fill: 'rgba(200, 200, 200, 1)',
            stroke: 'rgba(0, 0, 0, 1)',
        },
        exitText = {
            text: "(press esc to exit)",
            font: 'bold italic 30px courier',
            fill: 'rgba(200, 200, 200, 1)',
            stroke: 'rgba(0, 0, 0, 1)',
        };
    function isPlaying(){
        return internalUpdate == updatePlaying;
    }
    function initializePlayer() {
        let img = new Image();
        // img.src = "static/Fighter.png";
        img.src = "static/Fighter.png";
        player = components.PlayerShip({
            pos: {x:width/2,y:height-60},
            size: 50,
            moveSpeed:0.5,
            fireRate : 300,
            iframeDuration: 3000,
            iframeTimer: 0,
            hitbox:25,
            bounds: {
                x0:50,
                x1:width-50,
            },
            offset:{x:0,y:0},
            img: img
        });
        player.enter();
            if(!attractMode){
            keyboard.registerCommand(Game.controlMap['left'], player.moveLeft);
            keyboard.registerCommand(Game.controlMap['right'], player.moveRight);
            keyboard.registerCommand(Game.controlMap['fire'], function(){
                if(player.isPlaying() && isPlaying()){
                    fire.firePlayer(player.pos);
                }
            })
        }
    };

    function initialize(attract = false) {
        attractMode = attract;
        quit[0] = false;
        livesRemaining = 3; 
        components.global.level = 1; 
        components.global.score = 0;
        components.global.hitsOverall = 0,
        components.global.timesFired = 0,
        initializePlayer();
        fire = components.Bullets(player);
        enemies = components.Enemies(fire);
        enemies.setGameMode("normal");
        elapsedCountdown = 7000;
        internalUpdate = playIntro;
        internalRender = renderCountdown;
        if(attractMode) AI.init(player,enemies,fire);
        else AI.sleep();
    }

    function playIntro(elapsedTime){
        sound.play("intro", true);
        internalUpdate = updateCountdown;
    }

    function updateCountdown(elapsedTime) {
        elapsedCountdown -= elapsedTime;
        player.update(elapsedTime);
        fire.update(elapsedTime);
        particleSystem.update(elapsedTime);

        // Once the countdown timer is down, switch to the playing state
        if (elapsedCountdown <= 0) {
            internalUpdate = updatePlaying;
            internalRender = renderPlaying;
        }
    }

    function updatePlaying(elapsedTime) {
        particleSystem.update(elapsedTime);

        // figure out who's hit and ax them.
        enemies.collideBullet(fire.playerFire);

        if(player.collideEnemy(enemies) || player.collideBullet(fire.enemyFire)){
            killPlayer();
        }

        fire.update(elapsedTime);
        player.update(elapsedTime);
        if(enemies.update(elapsedTime)){
            components.global.level++;
            internalUpdate = updateCountdown;
            
            if(components.global.level%3==1 && components.global.level!=1){
                sound.play('challenge-over');
                internalRender = renderChallengeStats;
                elapsedCountdown = 12000;
            }else{
                internalRender = renderCountdown;
                elapsedCountdown = 3000;
            }
            if(components.global.level%3==0){
                sound.play('challenge');
                enemies.setGameMode("challenge")
            }else{
                sound.play('stage');
                enemies.setGameMode("normal")
            }
        }
    }

    function updateGameOver(elapsedTime) {
        elapsedCountdown-=elapsedTime;
        particleSystem.update(elapsedTime);
        enemies.update(elapsedTime)
        enemies.collideBullet(fire.playerFire);
        fire.update(elapsedTime);

        if(elapsedCountdown<0){
            quit[0] = true;
        }
    }
    
    function killPlayer(){
        livesRemaining--;
        if(livesRemaining<0){
            elapsedCountdown = 20000;
            internalRender = renderGameOver;
            internalUpdate = updateGameOver;
            if(!attractMode){
                screens['high-scores'].saveScore(components.global);            
            }
        }else{
            player.enter(4000);
        }
    }

    function renderScore() {
        scoreLabel.text = "Current Score";
        scoreLabel.fill= 'rgba(200, 200, 200, 1)',
        scoreLabel.font = 'bold 30px courier',
        scoreLabel.pos = {
            x:width/2 - graphics.measureTextWidth(scoreLabel)/2,
            y:0,
        }; 
        graphics.drawText(scoreLabel);

        scoreText.text = Math.ceil(components.global.score)+'';
        scoreText.fill= 'rgba(100, 200, 50, 1)',
        scoreText.font = 'Bold 30px courier',
        scoreText.pos = {
            x:width/2 - graphics.measureTextWidth(scoreText)/2,
            y:graphics.measureTextHeight(scoreLabel)*3/2,
        };
        graphics.drawText(scoreText);
    } 

    function renderLivesRemaining() {
        for(let i=0;i<livesRemaining;i++){
            graphics.drawImage({
                img: player.img,
                pos: {
                    x:player.size*0.7/2+(player.size*0.7+5)*i,
                    y:height-(player.size*0.7)/2,
                },
                size: player.size*0.7,
            });
        }
    }

    function renderChallengeStats(){
        renderScore();
        renderLivesRemaining();
        player.render(graphics);
        particleSystem.render(graphics);

        // unique graphics
        if(elapsedCountdown<=12000){
            countdownText.text = 'Number of hits'
        }
        if(elapsedCountdown<11000){
            countdownText.text = 'Number of hits '+components.global.hitsThisRound;
        }
        countdownText.pos = {
            x:width/2 - graphics.measureTextWidth(countdownText)/2,
            y:height/2 - graphics.measureTextHeight(countdownText)/2,
        };
        graphics.drawText(countdownText);

        if(elapsedCountdown<=10000){
            countdownText.text = 'Bonus'
            if(elapsedCountdown<9000){
                countdownText.text = 'Bonus '+components.global.hitsThisRound*100;
            }
            countdownText.pos = {
                x:width/2 - graphics.measureTextWidth(countdownText)/2,
                y:height/2 + 3*graphics.measureTextHeight(countdownText)/2,
            };
            graphics.drawText(countdownText);
        }
        
        if(elapsedCountdown<=5000){
            components.global.score += components.global.hitsThisRound*100;
            internalRender = renderCountdown;
        }
    }

    function renderCountdown() {
        renderScore();
        renderLivesRemaining();
        player.render(graphics);
        particleSystem.render(graphics);

        if(components.global.level%3==0){
            countdownText.text = 'Challenge Stage';
        }else{
            countdownText.text = 'Stage '+components.global.level;
        }
        countdownText.pos = {
            x:width/2 - graphics.measureTextWidth(countdownText)/2,
            y:height/2 - graphics.measureTextHeight(countdownText)/2,
        };
        graphics.drawText(countdownText);
    }

    function renderPlaying() {
        renderScore();
        renderLivesRemaining();
        player.render(graphics);
        fire.render(graphics);
        enemies.render(graphics);
        particleSystem.render(graphics);
    }

    function renderGameOver() {
        renderScore();
        enemies.render(graphics);
        particleSystem.render(graphics);
        //// ending stats
        GameOverText.pos = {x:width/2 - graphics.measureTextWidth(GameOverText)/2, y:height/2-graphics.measureTextHeight(GameOverText)*2}
        graphics.drawText(GameOverText);

        let num = Math.round(components.global.hitsOverall/components.global.timesFired*1000)/10;
        let txt = isNaN(num)?0:num;
        statsText.text = "Hit-Miss Ratio "+ txt + "%";
        let yOffset = graphics.measureTextHeight(statsText)*2;
        let xOffset = width/2-graphics.measureTextWidth(statsText)/2;
        //// ending stats
        statsText.text = "Results:"
        statsText.pos = {x:xOffset, y:height/2}
        graphics.drawText(statsText);
        // shots fired
        statsText.text = "Shots Fired "+components.global.timesFired;
        statsText.pos = {x:xOffset, y:height/2+yOffset}
        graphics.drawText(statsText);
        // Number of hits
        statsText.text = "Number of hits "+components.global.hitsOverall;
        statsText.pos = {x:xOffset, y:height/2+yOffset*2}
        graphics.drawText(statsText);
        // Hit-Miss Ratio
        statsText.text = "Hit-Miss Ratio "+ txt + "%";
        statsText.pos = {x:xOffset, y:height/2+yOffset*3}
        graphics.drawText(statsText);
        // Exit
        exitText.pos = {x:width/2-graphics.measureTextWidth(exitText)/2, y:height/2+yOffset*5}
        graphics.drawText(exitText);

    }

    function processInput(elapsedTime) {
        keyboard.update(elapsedTime);
        AI.update(elapsedTime);
    }

    function update(elapsedTime) {  
        internalUpdate(elapsedTime);
        return quit[0];
    }

    function render() {
        internalRender();
    }

    return {
        isPlaying: isPlaying,
        initialize: initialize,
        processInput: processInput,
        update: update,
        render: render
    };
}(Game.components, Game.graphics, Game.input, Game.sound, Game.screens));
