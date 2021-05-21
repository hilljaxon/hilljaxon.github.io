// ------------------------------------------------------------------
//
// This namespace provides the rendering code for the game.
//
// ------------------------------------------------------------------
Game.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('canvas'),
        context = canvas.getContext('2d');

    //
    // Place a 'clear' function on the Canvas prototype, this makes it a part
    // of the canvas, rather than making a function that calls and does it.
    CanvasRenderingContext2D.prototype.clear = function() {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, canvas.width, canvas.height);
        this.restore();
    };

    //------------------------------------------------------------------
    //
    // Public method that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.clear();
    }

    //------------------------------------------------------------------
    //
    // Draws a rectangle
    //
    //------------------------------------------------------------------
    function drawRectangle(spec) {
        context.fillStyle = spec.fill;
        context.fillRect(spec.pos.x, spec.pos.y, spec.size, spec.size);

        context.strokeStyle = spec.stroke;
        context.strokeRect(spec.pos.x, spec.pos.y, spec.size, spec.size);
    }

    //------------------------------------------------------------------
    //
    // Returns the width of the specified text, in pixels.
    //
    //------------------------------------------------------------------
    function measureTextWidth(spec) {
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;
        if (spec.hasOwnProperty('stroke')) {
            context.strokeStyle = spec.stroke;
        }
        var width = context.measureText(spec.text).width;

        context.restore();

        return width;
    }

    //------------------------------------------------------------------
    //
    // Returns the height of the specified text, in pixels.
    //
    //------------------------------------------------------------------
    function measureTextHeight(spec) {
        var saveText = spec.text;

        spec.text = 'm';    // Clever trick to get font height
        context.save();

        context.font = spec.font;
        context.fillStyle = spec.fill;
        if (spec.hasOwnProperty('stroke')) {
            context.strokeStyle = spec.stroke;
        }
        var width = context.measureText(spec.text).width;
        spec.text = saveText;

        context.restore();

        return width;
    }

    //------------------------------------------------------------------
    //
    // Draw some text to the screen
    //
    //------------------------------------------------------------------
    function drawText(spec) {
        context.save();

        context.font = spec.font,
        context.fillStyle = spec.fill;
        if (spec.hasOwnProperty('stroke')) {
            context.strokeStyle = spec.stroke;
        }
        context.textBaseline = 'top';

        context.fillText(spec.text, spec.pos.x, spec.pos.y);
        context.strokeText(spec.text, spec.pos.x, spec.pos.y);

        context.restore();
    }

    //------------------------------------------------------------------
    //
    // Expose an ability to draw an image/texture on the canvas.
    //
    //------------------------------------------------------------------
    function drawImage(spec) {
        context.save();

        context.translate(spec.pos.x, spec.pos.y);
        context.rotate(spec.rot);
        context.translate(-spec.pos.x, -spec.pos.y);
        
        context.drawImage(
            spec.img,
            spec.pos.x - spec.size/2,
            spec.pos.y - spec.size/2,
            spec.size, spec.size
        );
        context.restore();
    }

    return {
        clear : clear,
        drawRectangle : drawRectangle,
        drawText: drawText,
        drawImage: drawImage,
        measureTextWidth: measureTextWidth,
        measureTextHeight: measureTextHeight
    };
}());
