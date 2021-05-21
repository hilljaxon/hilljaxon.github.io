let dist = function(p1,p2){
    return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2))
}
let direction = function(p1,p2){
    return Math.atan2(p2.y-p1.y,p2.x-p1.x);
}

Game.components = (function(graphics, sound){ 
    'use strict'

    let canvas = document.getElementById('canvas');

    let global = {
        particleSystem: ParticleSystem(graphics),
        width: canvas.width,
        height: canvas.height,
        rowSize: 10,
        enemySize: 50,
        marchOffset: {x:0,y:0},
        score: 0,
        level:1,
        hitsOverall:0,
        timesFired:0,
        hitsThisRound:0,
    };

    function Bullet(img, pos, dir){       
        let that = {
            pos: {x:pos.x,y:pos.y},
            vel: 0.7,
            size: 25,
            dir: dir,
        };

        that.offscreen = function(){
            if(that.pos.x<0) return true;
            if(that.pos.x>global.width) return true;
            if(that.pos.y<0) return true;
            if(that.pos.y>global.height) return true;
            return false;
        }

        that.update = function(elapsedTime){ // returns true if needed to be removed removed
            let destruct = that.offscreen();
            that.pos.x += (that.vel*Math.cos(dir)*elapsedTime);
            that.pos.y += (that.vel*Math.sin(dir)*elapsedTime);
            return destruct;
        }

        that.render = function(graphics) {
            graphics.drawImage({
                img: img,
                pos: {x:that.pos.x,y:that.pos.y},
                size: that.size,
                rot: dir+Math.PI/2,
            });
        };

        return that;
    }

    function Bullets(player){
        let that = {
            playerFire: [],
            enemyFire: [],
            playerTimer: 0,
            enemyTimer: 0,
        },
        playerBulletImg = new Image(),
        enemyBulletImg = new Image();
        playerBulletImg.src='static/galaga-missile_1.png';
        enemyBulletImg.src='static/galaga-missile_2.png';

        that.firePlayer = function(pos){
            if(that.playerTimer > player.fireRate){
                sound.play('shot', true)
                global.timesFired++;
                this.playerFire.push(Bullet(playerBulletImg, pos,-Math.PI/2));
                that.playerTimer = 0;
            }
        };
        that.fireEnemy = function(pos){
            if(this.enemyFire.length<3){
                if(that.enemyTimer>1000){
                    that.enemyTimer = 0;
                    if(Math.random()<0.1){
                        sound.play('shot', true)
                        that.enemyFire.push(Bullet(enemyBulletImg,pos,direction(pos, player.pos)));
                    }
                }
            }
        };
        that.render =function(graphics){
            for(let i=0;i<that.playerFire.length;i++){
                that.playerFire[i].render(graphics);
            }
            for(let i=0;i<that.enemyFire.length;i++){
                that.enemyFire[i].render(graphics);
            }            
        }
        that.update = function(elapsedTime){
            that.playerTimer += elapsedTime;
            that.enemyTimer += elapsedTime;
            // remove out of bounds bullets
            let i =0;
            while(i<that.playerFire.length){
                if(that.playerFire[i].update(elapsedTime)){
                    that.playerFire.splice(i,1);
                }else i++;
            }
            i = 0;
            while(i<that.enemyFire.length){
                if(that.enemyFire[i].update(elapsedTime)){
                    that.enemyFire.splice(i,1);
                }else i++;
            }
        }

        return that;
    }

    function enemySpriteFactory (type,home,images){  // images needs to be an array of animations
        let img = new Image();
        img.src = images[0];
        return{
            type: type,
            imgNames:images,
            health: 1,
            home: {x:home.x, y:home.y},
            pos: {x:global.width/2,y:global.height-50},
            dir: 0,
            timer: 0,  // for stepping out of march
            animationFrame:0,
            animationTimer:0,
            moveSpeed:0.5,
            hitbox:25,
            loaded: true, // for challenge mode
            bounds: {
                x0: global.enemySize,
                x1: global.width-50,
                y0: 0,
                y1: global.height
            },
            offset:{x:0,y:0},
            img: img
        };
    }
    function makeBee(home, fire){
        return Enemy(enemySpriteFactory("bee", home, ["static/bee_1.png","static/bee_2.png"]),fire);
    }
    function makeButterfly(home, fire){
        return Enemy(enemySpriteFactory("butterfly", home, ["static/butterfly_1.png","static/butterfly_2.png"]),fire);
    }
    function makeBoss(home, fire){
        let boss = Enemy(enemySpriteFactory("boss", home, [
            "static/boss-f_1.png","static/boss-f_2.png",
            "static/boss-h_1.png","static/boss-h_2.png",
        ]),fire);
        boss.health = 2;
        return boss;
    }
    function makeTonbo(home, fire){
        return Enemy(enemySpriteFactory("tonbo", home, ["static/tonbo.png","static/tonbo.png"]),fire);
    }
    function makeMoniji(home, fire){
        return Enemy(enemySpriteFactory("moniji", home, ["static/momiji.png","static/momiji.png"]),fire);
    }
    function makeEnterprise(home, fire){
        return Enemy(enemySpriteFactory("enterprise", home, ["static/enterprise.png","static/enterprise.png"]),fire);
    }

    function Enemy(spec, fire){
        let that = {
            get size(){ return global.enemySize; },
            get pos(){ return spec.pos; },
            set health(value) {spec.health = value },
            get health() { return spec.health },
            set home(value) {spec.health = {x:value.x,y:value.y};},
            get home() { return {x:spec.home.x, y:spec.home.y};},
            get type() { return spec.type },
            get loaded() { return spec.loaded },
        },
            internalUpdate,
            internalRender;

        that.enter = function(path, delay){
            path.push(that.home);
            spec.path = path;
            spec.pos = path[0];
            spec.timer = -delay;
            internalUpdate = preUpdate;
            internalRender = unRender;
        };

        that.streak = function(path, delay){
            spec.path = path;
            spec.pos = path[0];
            spec.timer = -delay;
            internalUpdate = preStreak;
            internalRender = unRender;
        }

        function preStreak(elapsedTime){
            spec.timer+= elapsedTime;
            if(spec.timer>0){
                internalUpdate = streakUpdate;
                internalRender = mainRender;
            }
        }

        function streakUpdate(elapsedTime){
            // update direction
            spec.dir = direction(spec.pos, spec.path[0])

            // move the ship
            spec.pos.x += spec.moveSpeed * elapsedTime * Math.cos(spec.dir);
            spec.pos.y += spec.moveSpeed * elapsedTime * Math.sin(spec.dir);
            
            // update path var
            if(10>dist(spec.pos,spec.path[0])){
                if(spec.path.length>1){
                    spec.path.splice(0,1);
                }else{
                    spec.loaded = false;
                    internalUpdate = function(){};
                    internalRender = function(){};
                }
            }  
        }

        that.goBoom = function(){
            score();
            sound.play('enemy-boom', true)
            let pallet = [];
            if(spec.type == "bee"){
                pallet=['#f70006','#f7fd00','#0065d9'];
            }
            else if(spec.type == "butterfly"){
                pallet=['#f70102','#0d64d3','#dddcdf'];
            }
            else if(spec.type == "boss"){
                if(spec.health>1){
                    pallet=['#0198a6','#fcfe08','#d84908'];
                }else{
                    pallet=['#9700de','#fe00dd','#0961da'];
                }
            }else{
                pallet = ['#e4e4e2','#0564d8','#e30804'];
            }
            global.particleSystem.createEffect({
                size: 2,
                pos: spec.pos,
                vel: 0.05,
                lifetime: 1000,
                fills: pallet,
                stroke: 'rgba(0,0,0,0)',
            })
        };

        that.collidePlayer = function(player) {
            return (spec.hitbox+player.hitbox) > dist(player.pos, spec.pos);
        };

        that.collideBullet = function(bullet) {
            if(spec.hitbox>dist(bullet.pos, spec.pos)){
                spec.health--;
                if(spec.type == "boss"){
                    spec.imgNames.splice(0,2);
                    spec.img.src = spec.imgNames[1];
                }
                if(spec.health<=0){ 
                    that.goBoom();
                }
                global.hitsOverall++;
                return true;
            }
            return false;
        };

        function score(){
            if(spec.type == "bee"){
                if(internalUpdate == entranceUpdate){
                    global.score += 100;
                }else{
                    global.score += 50;
                }
            }else if(spec.type == "boss"){
                if(internalUpdate == entranceUpdate){
                    global.score += 400;
                }else{
                    global.score += 150;
                } 
            }else{
                if(internalUpdate == entranceUpdate){
                    global.score += 160;
                }else{
                    global.score += 80;
                }
            }
        }

        function preUpdate(elapsedTime){
            spec.timer+= elapsedTime;
            if(spec.timer>0){
                internalUpdate = entranceUpdate;
                internalRender = mainRender;
            }
        };

        function entranceUpdate(elapsedTime){ // go to next path node
            // potentially fire
            if(spec.pos.y<global.height/2){
                fire.fireEnemy(spec.pos);
            }
            // update direction
            spec.dir = direction(spec.pos, spec.path[0])

            // move the ship
            spec.pos.x += spec.moveSpeed * elapsedTime * Math.cos(spec.dir);
            spec.pos.y += spec.moveSpeed * elapsedTime * Math.sin(spec.dir);
            
            // update path var
            if(10>dist(spec.pos,spec.path[0])){
                if(spec.path.length>1){
                    spec.path.splice(0,1);
                }else{
                    internalUpdate = transitionUpdate;
                }
            }   
        };

        function transitionUpdate(elapsedTime){
            let target = {
                x: spec.home.x + global.marchOffset.x,
                y: spec.home.y + global.marchOffset.y
            };
            spec.dir = direction(spec.pos, target);
            // move the ship
            spec.pos.x += spec.moveSpeed/2 * elapsedTime * Math.cos(spec.dir);
            spec.pos.y += spec.moveSpeed/2 * elapsedTime * Math.sin(spec.dir);
            // update path var
            if(10>dist(spec.pos,target)){
                spec.pos = spec.path[0];
                spec.dir = Math.PI/2;
                spec.timer = 10000+Math.random()*(7-global.level)*10000
                internalUpdate = formationUpdate;
            } 
        };

        function formationUpdate(elapsedTime){
            spec.timer-=elapsedTime;
            spec.pos.x = spec.home.x + global.marchOffset.x;
            spec.pos.y = spec.home.y + global.marchOffset.y;
            if(spec.timer<0){
                spec.path = plotAttack({
                    x:that.home.x + global.marchOffset.x,
                    y:that.home.y + global.marchOffset.y
                })
                internalUpdate = entranceUpdate;
                sound.play('dive')
            }
        };   

        function animate(elapsedTime){
            spec.animationTimer += elapsedTime;
            if(spec.animationTimer>750 && spec.animationFrame == 0){
                spec.animationTimer = 0;
                spec.img.src = spec.imgNames[1];
                spec.animationFrame = 1;
            }else if(spec.animationTimer>500 && spec.animationFrame == 1){
                spec.animationTimer = 0;
                spec.img.src = spec.imgNames[0];
                spec.animationFrame = 0;
            }
        };

        that.update = function(elapsedTime){
            internalUpdate(elapsedTime);
            animate(elapsedTime);
        };

        function unRender(graphics){};
        function mainRender(graphics){
            graphics.drawImage({
                img: spec.img,
                pos: {x:spec.pos.x,y:spec.pos.y},
                size: global.enemySize,
                rot: spec.dir+Math.PI/2,
            }); 
        }

        that.render = function(graphics) {
            internalRender(graphics);
        };
        return that;
    }

    function Slot(row,col,fire){
        let that = {
            entity: NaN,
            id: row*global.rowSize + col,
            row: row, //Math.floor(id/global.rowSize),
            col: col, //Math.floor(id%global.rowSize),
            home: {
                x: global.width/2-(global.enemySize+20)*(global.rowSize-1)/2 + col *(global.enemySize+20),
                y: 0+(global.enemySize+5)*(2+row),
            },
        };
        that.isOccupied = function(){
            return !isNone(that.entity);
        }
        that.fill = function(path, delay, mode="normal"){
            let myPath = JSON.parse(JSON.stringify(path));
            if(that.row == 0){
                that.entity = makeBoss(that.home, fire);
            }else if(that.row < 3){
                that.entity = makeButterfly(that.home, fire);
            }else if(that.row < 5){
                that.entity = makeBee(that.home, fire);
            }else if(that.row < 7){
                that.entity = makeTonbo(that.home, fire);
            }else if(that.row < 9){
                that.entity = makeMoniji(that.home, fire);
            }else if(that.row < 11){
                that.entity = makeEnterprise(that.home, fire);
            }

            if(mode=="normal"){
                that.entity.enter(myPath, delay);
            }else if(mode == "streak"){
                that.entity.streak(myPath, delay);
            }
        }
        that.clear = function(){
            return that.entity = NaN;
        }
        that.collidePlayer = function(player){
            if(!isNone(that.entity)){
                return that.entity.collidePlayer(player);
            }
            return false;
        }
        that.collideBullet = function(bullet){
            let result = false;
            if(!isNone(that.entity)){
                result = that.entity.collideBullet(bullet);
                if(that.entity.health<=0){
                    that.safe = false;
                    that.clear();
                }
            }
            return result;
        }
        that.update = function(time){
            if(!isNone(that.entity)){
                that.entity.update(time);
            }
        }
        that.render = function(graphics){
            if(!isNone(that.entity)){
                that.entity.render(graphics);
            }
        }

        return that;
    }

    function Enemies(fire){
        let internalUpdate,
            enemyFormation= [],
            waveCounter,
            waveTimer,
            marchTimer,
            marchPos,
            marchDir,
            preHitsSnapshot,
            flexTimer = 0;
        for(let r=0;r<11;++r){
            let row = [];
            for(let c=0;c<global.rowSize;++c){
                row.push(Slot(r,c,fire));
            };
            enemyFormation.push(row);
        };

        function setGameMode(mode){
            if(mode == "normal"){
                marchTimer = -15000;
                waveCounter = 0;
                waveTimer = 0;
                marchTimer = 0;
                marchPos = 0;
                marchDir = -1;
                internalUpdate = levelUpdate;
            }else if(mode == "challenge") {
                preHitsSnapshot = global.hitsOverall,
                global.hitsThisRound = 0;
                waveCounter = 0;
                internalUpdate = challengeUpdate;
            }
        }

        function isStageClear(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
            for(let r=0;r<11;++r){
                for(let c=0;c<global.rowSize;++c){
                    // if(enemyFormation[r][c].isOccupied() || enemyFormation[r][c].entity.loaded){
                    if(enemyFormation[r][c].entity.loaded){
                            return false;
                    }
                }
            }
            return true;
        }
        function wipeEnemies(){
            for(let r=0;r<11;++r){
                for(let c=0;c<global.rowSize;++c){
                    enemyFormation[r][c].clear();
                }
            }
        };

        function addWave(num){ // helper for making a normal formation
            // based on level
            let path = plotEntrance();
            if(num == 0){ // bee and butter
                enemyFormation[1][4].fill(path, 0); // butter
                enemyFormation[1][5].fill(path, 500); // butter
                enemyFormation[2][4].fill(path, 1000); // butter
                enemyFormation[2][5].fill(path, 1500); // butter
                enemyFormation[3][4].fill(path, 250); // bee
                enemyFormation[3][5].fill(path, 750); // bee
                enemyFormation[4][4].fill(path, 1250); // bee
                enemyFormation[4][5].fill(path, 1750); // bee
            }else if(num == 1){ // boss and butter
                enemyFormation[1][3].fill(path, 0); // butter
                enemyFormation[1][6].fill(path, 500); // butter
                enemyFormation[2][3].fill(path, 1000); // butter
                enemyFormation[2][6].fill(path, 1500); // butter
                enemyFormation[0][4].fill(path, 250); // boss
                enemyFormation[0][5].fill(path, 750); // boss
                enemyFormation[0][3].fill(path, 1250); // boss
                enemyFormation[0][6].fill(path, 1750); // boss
            }else if(num == 2){// butter
                enemyFormation[1][2].fill(path, 0); // butter
                enemyFormation[1][7].fill(path, 500); // butter
                enemyFormation[2][2].fill(path, 1000); // butter
                enemyFormation[2][7].fill(path, 1500); // butter
                enemyFormation[1][1].fill(path, 250); // butter
                enemyFormation[1][8].fill(path, 750); // butter
                enemyFormation[2][1].fill(path, 1250); // butter
                enemyFormation[2][8].fill(path, 1750); // butter
            }else if(num == 3){ // bee
                enemyFormation[3][3].fill(path, 0); // bee
                enemyFormation[3][6].fill(path, 500); // bee
                enemyFormation[4][3].fill(path, 1000); // bee
                enemyFormation[4][6].fill(path, 1500); // bee
                enemyFormation[3][2].fill(path, 250); // bee
                enemyFormation[3][7].fill(path, 750); // bee
                enemyFormation[4][2].fill(path, 1250); // bee
                enemyFormation[4][7].fill(path, 1750); // bee
            }else if(num == 4){ // bee
                enemyFormation[3][1].fill(path, 0); // bee
                enemyFormation[3][8].fill(path, 500); // bee
                enemyFormation[4][1].fill(path, 1000); // bee
                enemyFormation[4][8].fill(path, 1500); // bee
                enemyFormation[3][0].fill(path, 250); // bee
                enemyFormation[3][9].fill(path, 750); // bee
                enemyFormation[4][0].fill(path, 1250); // bee
                enemyFormation[4][9].fill(path, 1750); // bee
            }

        };

        function mockUpWave(num){
            let path = plotStreak();
            if(num ==0){ // tonbo  5,6
                for(let i=0;i<8;i++){
                    enemyFormation[5][i].fill(path, 250*i, "streak");
                }
            }else if(num ==1){ // momiji  7,8
                for(let i=0;i<8;i++){
                    enemyFormation[7][i].fill(path, 250*i, "streak");
                }
            }else if(num ==2){ // enterprise  9,10
                for(let i=0;i<8;i++){
                    enemyFormation[9][i].fill(path, 250*i, "streak");
                }
            }else if(num ==3){ // bee
                for(let i=0;i<8;i++){
                    enemyFormation[3][i].fill(path, 250*i, "streak");
                }
            }else if(num ==4){ // butterfly
                for(let i=0;i<8;i++){
                    enemyFormation[1][i].fill(path, 250*i, "streak");
                }
            }else if(num ==5){ // butter & bee
                for(let i=0;i<4;i++){
                    enemyFormation[5][i].fill(path, 500*i, "streak");
                    enemyFormation[3][i].fill(path, 500*i+250, "streak");
                }
            }else if(num ==6){ // butter & boss
                for(let i=0;i<4;i++){
                    enemyFormation[1][i].fill(path, 500*i, "streak");
                    enemyFormation[0][i].fill(path, 500*i+250, "streak");
                }
            }else if(num ==7){ // double tonbo
                let path2 = plotStreak();
                for(let i=0;i<8;i++){
                    enemyFormation[5][i].fill(path, 250*i, "streak");
                    enemyFormation[6][i].fill(path2, 250*i, "streak");
                }
            }else if(num ==8){ // double bee
                let path2 = plotStreak();
                for(let i=0;i<8;i++){
                    enemyFormation[7][i].fill(path, 250*i, "streak");
                    enemyFormation[8][i].fill(path2, 250*i, "streak");
                }
            }else if(num ==9){ // double butter
                let path2 = plotStreak();
                for(let i=0;i<8;i++){
                    enemyFormation[9][i].fill(path, 250*i, "streak");
                    enemyFormation[10][i].fill(path2, 250*i, "streak");
                }
            }
        }

        function handleWaves(elapsedTime){
            waveTimer-=elapsedTime;
            if(waveTimer<=0){
                waveTimer=3000;
                if(waveCounter<5){
                    addWave(waveCounter);
                    waveCounter++;
                }
            }
        };

        function handleChallengeWaves(elapsedTime){
            if(waveCounter<6 && isStageClear() ){
                wipeEnemies();
                mockUpWave(Math.floor(Math.random()*10));
                waveCounter++;
            }
        }

        function march(elapsedTime){
            marchTimer+=elapsedTime;
            if(Math.floor(marchTimer/1000) == 1){
                marchTimer = 0;
                if(Math.abs(marchPos)>5) marchDir *= -1;
                marchPos += marchDir;
                global.marchOffset.x = global.enemySize/4 * marchPos;
            }
        }

        function flexSize(elapsedTime){
            flexTimer += elapsedTime;
            if(flexTimer>100){
                flexTimer=0;
                // global.enemySize++;
            }
        }

        function collideBullet(bullets){
            for(let r=0;r<enemyFormation.length;r++){
                for(let i=0;i<enemyFormation[r].length;i++){
                    for(let b = 0;b<bullets.length;b++){
                        if(enemyFormation[r][i].collideBullet(bullets[b])){
                            bullets.splice(b,1);
                            b--;                            
                            break;
                        }
                    }
                }
            }
        };

        function collidePlayer(player){
            for(let r=0;r<enemyFormation.length;r++){
                for(let c=0;c<enemyFormation[r].length;c++){
                    if(enemyFormation[r][c].collidePlayer(player)){
                        return true;
                    }
                }
            }
            return false;
        }

        function levelUpdate(elapsedTime){
            handleWaves(elapsedTime);
            march(elapsedTime);
            flexSize(elapsedTime);
            for(let r=0;r<enemyFormation.length;r++){
                for(let c=0;c<enemyFormation[r].length;c++){
                    enemyFormation[r][c].update(elapsedTime);
                }
            }
            return isStageClear();
        }

        function challengeUpdate(elapsedTime){
            handleChallengeWaves(elapsedTime);
            for(let r=0;r<enemyFormation.length;r++){
                for(let c=0;c<enemyFormation[r].length;c++){
                    enemyFormation[r][c].update(elapsedTime);
                }
            }
            global.hitsThisRound = global.hitsOverall - preHitsSnapshot;
            return isStageClear() && waveCounter>=6; // && waveCounter>=6;
        }
        
        function update(elapsedTime){
            return internalUpdate(elapsedTime);
        };

        function render(graphics){
            for(let r=0;r<enemyFormation.length;r++){
                for(let c=0;c<enemyFormation[r].length;c++){
                    enemyFormation[r][c].render(graphics);
                }
            }
        };

        return{
            enemyFormation: enemyFormation,
            setGameMode: setGameMode,
            collideBullet: collideBullet,
            collidePlayer: collidePlayer,
            update: update,
            render: render,
        };

    };

    function PlayerShip(spec){
        let that = {
            get img() { return spec.img; },
            get pos() { return spec.pos; },
            get size() { return spec.size;},
            get fireRate() { return spec.fireRate; },
            blinkTimer: 0,
        },
            internalRender,
            internalUpdate; 
        that.isPlaying = function(){
            return (spec.iframeTimer>spec.iframeDuration);
        }
        that.enter = function(delay=0){
            that.blinkTimer = -1*delay;
            spec.iframeTimer = -1*delay;
            internalUpdate = iUpdate;
            internalRender = iRender;
        }
        that.moveRight = function(elapsedTime) {
            spec.pos.x += spec.moveSpeed * elapsedTime;
            if (spec.pos.x > (spec.bounds.x1)) { // cap to right bound
                spec.pos.x = spec.bounds.x1;
            }
        }
        that.moveLeft = function(elapsedTime) {
            spec.pos.x -= spec.moveSpeed * elapsedTime;
            if (spec.pos.x < (spec.bounds.x0)) { // cap to right bound
                spec.pos.x = spec.bounds.x0;
            }
        }
        that.goBoom = function(){
            sound.play('player-boom')
            global.particleSystem.createEffect({
                size: 2,
                pos: spec.pos,
                vel: 0.05,
                lifetime: 1000,
                fills: ['#dfdddd','#1e5fb2','#f90202'],
                stroke: 'rgba(0,0,0,0)',
            });
        };

        that.collideBullet = function(bullets) {
            if(spec.iframeTimer<spec.iframeDuration) return false;
            for(let i=0;i<bullets.length;++i){
                if(spec.hitbox>dist(bullets[i].pos,spec.pos)){
                    that.goBoom();
                    limbo();
                    return true;
                }
            }
            return false;
        };

        that.collideEnemy = function(Enemies){
            if(spec.iframeTimer<spec.iframeDuration) return false;
            if(Enemies.collidePlayer(spec)){
                that.goBoom();
                limbo();
                return true;
            }
            return false;
        };

        function iUpdate(elapsedTime){
            that.blinkTimer += elapsedTime;
            spec.iframeTimer += elapsedTime;
            if(that.isPlaying()){
                internalUpdate = mainUpdate;
                internalRender = mainRender;
            }
        }
        function mainUpdate(elapsedTime){};

        function iRender(graphics){
            if(that.blinkTimer>125){
                if(that.blinkTimer>250){
                    that.blinkTimer = 0;
                }
            }else if(that.blinkTimer>=0){
                graphics.drawImage({
                    img: spec.img,
                    pos: {x:spec.pos.x,y:spec.pos.y},
                    size: spec.size,
                    rot: 0,
                });
            }
        }
        function mainRender(graphics){
            graphics.drawImage({
                img: spec.img,
                pos: {x:spec.pos.x,y:spec.pos.y},
                size: spec.size,
                rot: 0,
            });
        }
        function limbo(){
            spec.iframeTimer = 0;
            internalUpdate = function(){};
            internalRender = function(){};
        }

        that.update = function(elapsedTime){
            internalUpdate(elapsedTime);
        };
        that.render = function(graphics) {
            internalRender(graphics);
        };
        //default
        return that;
    }

    return {
        global: global,
        PlayerShip: PlayerShip,
        Bullets: Bullets,
        Enemy: Enemy,
        Enemies: Enemies
    }
})(Game.graphics, Game.sound);