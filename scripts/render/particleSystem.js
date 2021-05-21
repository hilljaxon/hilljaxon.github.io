function ParticleSystem(graphics) {
    'use strict';
    let that = {},
        particles = [];    // Set of all active particles

    //------------------------------------------------------------------
    //
    // Create a bunch of particles over the surface of the brick.
    //
    //------------------------------------------------------------------
    that.createEffect = function(spec) {
        // Create particles over the area of the brick
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                // Assign a unique name to each particle
                particles.push(makeParticle(spec));
            }
        }
    };

    function makeParticle(spec) {
        var p = {
            size: Math.random()*spec.size+3,
            pos: {x:spec.pos.x, y:spec.pos.y},
            dir: Math.random()*Math.PI*2,
            vel: Math.random()*spec.vel,
            rot: Math.random()*Math.PI*2,
            rotVel: Math.random()*Math.PI*2,
            lifetime: Math.random()*spec.lifetime+1000,    // How long the particle should live, in milliseconds
            fill: spec.fills[Math.floor(Math.random()*spec.fills.length)],
            stroke: spec.stroke,
        };
        return p;
    };


    that.update = function(elapsedTime) {
        for(let p =0;p<particles.length;p++){
            // Update how long it has been alive
            particles[p].lifetime -= elapsedTime;

            // If the lifetime has expired, identify it for removal
            if (particles[p].lifetime<=0) {
                particles.splice(p,1);
                p--;
                continue;
            }

            // Update its position
            particles[p].pos.x += elapsedTime * particles[p].vel * Math.cos(particles[p].dir);
            particles[p].pos.y += elapsedTime * particles[p].vel * Math.sin(particles[p].dir);

            // Rotate proportional
            particles[p].rot += particles[p].rotVel * elapsedTime;
        }
    };

    that.render = function() {
        for(let p=0;p<particles.length;p++) {
            graphics.drawRectangle(particles[p]);
        } 
    }

    return that;
}
