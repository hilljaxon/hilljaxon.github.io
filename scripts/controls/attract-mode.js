GalagaAI = function(end){
    'use strict'
    let that = {},
        internalUpdate = function(time){},
        player,
        enemies,
        fire;
    let attack = function(){
        console.log(Game.model.isPlaying());
        if(player.isPlaying() && Game.model.isPlaying()){
            fire.firePlayer(player.pos);
        }
    };
    function quit(){
        window.removeEventListener('keydown', quit);
        window.removeEventListener('mousemove', quit);
        window.removeEventListener('mousedown', quit);
        end[0] = true;
    }

    that.init = function(Player, Enemies, Fire){
        player = Player;
        enemies = Enemies;
        fire = Fire;
        internalUpdate = mainUpdate;
        // ready normal mode
        window.addEventListener("keydown", quit);
        window.addEventListener('mousemove', quit);
        window.addEventListener('mousedown', quit);
    }

    that.sleep = function(){
        internalUpdate = function(time){};
    };

    function avoidBullet(elapsedTime){
        for(let i=0;i<fire.enemyFire.length;i++){
            let bullet = fire.enemyFire[i];
            if(300>dist(player.pos,bullet.pos)){
                let angle = direction(player.pos,bullet.pos);
                if(angle>Math.PI/2 || angle<-Math.PI/2){
                    player.moveRight(elapsedTime);
                }else{
                    player.moveLeft(elapsedTime);
                }
                return true;
            }
        }
        return false;
    };

    function avoidEnemies(elapsedTime){
        for(let row=0;row<enemies.enemyFormation.length;row++){
            for(let col=0;col<enemies.enemyFormation[row].length;col++){
                let enemy = enemies.enemyFormation[row][col].entity;
                if(!isNone(enemy)){
                    if(200>dist(player.pos,enemy.pos)){
                        let angle = direction(player.pos,enemy.pos);
                        if(angle>Math.PI/2 || angle<-Math.PI/2){
                            player.moveRight(elapsedTime);
                        }else{
                            player.moveLeft(elapsedTime);
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    };

    function hunt(elapsedTime){
        for(let row=0;row<enemies.enemyFormation.length;row++){
            for(let col=0;col<enemies.enemyFormation[row].length;col++){
                let enemy = enemies.enemyFormation[row][col].entity;
                if(!isNone(enemy)){                        
                    if(enemy.pos.x-player.pos.x>=5){
                        player.moveRight(elapsedTime);
                    }else if(player.pos.x-enemy.pos.x>=5){
                        player.moveLeft(elapsedTime);
                    }
                    return;
                
                }
            }
        }
    }

    function mainUpdate(elapsedTime){
        if(avoidBullet(elapsedTime)) return;
        if(avoidEnemies(elapsedTime)) return;
        hunt(elapsedTime);
        attack();

    }

    that.update = function(elapsedTime){
        internalUpdate(elapsedTime);
    };

    return that;
};