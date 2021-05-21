Game.sound = (function() {
    'use strict'
    let sounds = {};

    // function background(){
    //     let sound = new Audio();
    //     sound.src = "static/PurpleHaze-Trim.mp3"
    //     sound.loop = true;

    //     function play(){
    //         sound.currentTime = 0;
    //         // sound.play();
    //     }
    //     function pause(){
    //         sound.pause();
    //     }

    //     return{
    //         play: play,
    //     };
    // };

    //------------------------------------------------------------------
    //
    // This function performs the one-time game initialization.
    //
    //------------------------------------------------------------------
    (function initialize() {
        'use strict';

        function loadSound(source) {
            let sound = new Audio();
            // sound.addEventListener('canplay', function() {
            //     console.log(`${source} is ready to play`);
            // });
            // sound.addEventListener('play', function() {
            //     let elementButton = document.getElementById(idButton);
            //     elementButton.innerHTML = label + ' - Pause!'
            //     console.log(`${source} started playing`);
            // });
            // sound.addEventListener('pause', function() {
            //     console.log(`${source} paused`);
            // });
            // sound.addEventListener('canplaythrough', function() {
            //     console.log(`${source} can play through`);
            // });
            // sound.addEventListener('progress', function() {
            //     console.log(`${source} progress in loading`);
            // });
            // sound.addEventListener('timeupdate', function() {
            //     console.log(`${source} time update: ${this.currentTime}`);
            // });
            sound.src = source;
            return sound;
        }

        function loadAudio() {
            sounds['background'] = loadSound('audio/PurpleHaze-Trim.mp3');
            sounds['background'].loop = true;
            changeVolume("background", 2);

            sounds['shot'] = loadSound('audio/shot.mp3');
            changeVolume("shot", 5);

            sounds['dive'] = loadSound('audio/dive.mp3');
            changeVolume("dive", 10);

            sounds['player-boom'] = loadSound('audio/player_boom.mp3');
            changeVolume("player-boom", 10);

            sounds['enemy-boom'] = loadSound('audio/enemy_boom.mp3');
            changeVolume("enemy-boom", 10);

            sounds['intro'] = loadSound('audio/stage_intro.mp3');
            changeVolume("intro", 10);

            sounds['stage'] = loadSound('audio/stage.mp3');
            changeVolume("stage", 10);

            sounds['challenge'] = loadSound('audio/challenging_stage.mp3');
            changeVolume("challenge", 10);

            sounds['challenge-over'] = loadSound('audio/challenging_stage_over.mp3');
            changeVolume("challenge-over", 10);

            // Game.sounds['audio/bensound-extremeaction'] = loadSound('audio/bensound-extremeaction.mp3', 'Music', 'id-play3');
        }

        console.log('initializing...');

        loadAudio();
    })();

    //------------------------------------------------------------------
    //
    // Pauses the specified audio
    //
    //------------------------------------------------------------------
    function pause(whichSound) {
        sounds[whichSound].pause();
    }

    function mute(){
        Object.keys(sounds).forEach(sound => {
            pause(sound);
        });
    }

    //------------------------------------------------------------------
    //
    // Plays the specified audio
    //
    //------------------------------------------------------------------
    function play(whichSound, fresh = false) {
        if(fresh) sounds[whichSound].currentTime = 0;
        sounds[whichSound].play();
    }

    //------------------------------------------------------------------
    //
    // Allow the music volume to be changed
    //
    //------------------------------------------------------------------
    function changeVolume(whichSound, value) {
        sounds[whichSound].volume = value / 100;
    }

    return {
        mute: mute,
        pause: pause,
        play:play,
        changeVolume: changeVolume
    }
    
}());