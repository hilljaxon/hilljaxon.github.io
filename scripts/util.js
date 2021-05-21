function isNone(obj){
    return (typeof obj === 'number') && isNaN(obj) // true
}




function quadraticBezier(p0, p1, p2, t){
    let pFinal = {};
    pFinal.x = Math.pow(1 - t, 2) * p0.x + 
                (1 - t) * 2 * t * p1.x + 
                t * t * p2.x;
    pFinal.y = Math.pow(1 - t, 2) * p0.y + 
                (1 - t) * 2 * t * p1.y + 
                t * t * p2.y;
    return pFinal;
};

function multiplot(points){
    let p0, p1, p2, mid = points[0], plots = [];
    for(let i = 0; i < points.length-3; i += 1) {
        p0 = mid;
        p1 = points[i +1];
        p2 = points[i +2];
        mid = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        };
        for(let i = 0;i<1;i+=0.1){
            plots.push(quadraticBezier(p0,p1,mid,i));
        };
    }
    p0 = mid;
    p1 = points[points.length -2];
    p2 = points[points.length -1];
    for(let i = 0;i<=1;i+=0.1){
        plots.push(quadraticBezier(p0,p1,p2,i))
    }
    plots.push(p2);
    return plots;
};

function plotEntrance(){ // makes a list of points via baizeia that result in the looping trajectory of the enemies.
    let canvas = document.getElementById('canvas');
    let points = [],
        w = canvas.width,
        h = canvas.height,
        dir = Math.floor(Math.random()*2)==0;
        let starts = [
            {x:dir ? w/2*Math.random():0,     y:dir ? 0:h/2*Math.random()},
            {x:dir ? w/2+w/2*Math.random():w, y:dir ? 0:h/2*Math.random()},
            {x:0, y:h/2+h/2*Math.random()},
            {x:w, y: h/2+h/2*Math.random()},
        ]
        end = {x:w/2,y:h/2},
        flip = Math.floor(Math.random()*2)==0,
        start = starts[Math.floor(Math.random()*4)];

    points.push(start)                                                  // start
    points.push(flip ? {x:end.x,y:start.y} : {x:start.x,y:end.y})       // p2 = p6
    points.push(end)                                                    // p3 = end
    points.push(flip ? {x:start.x,y:end.y} : {x:end.x,y:start.y})       // mid
    points.push(start)                                                  // p5 = start
    points.push(points[1])                                              // p6 = p2
    points.push(end)                                                    // end
    return multiplot(points);
};

function plotAttack(home){ // makes a list of points via baizeia that result in the looping trajectory of the enemies.
    let canvas = document.getElementById('canvas');
    let points = [],
        w = canvas.width,
        h = canvas.height;
    
    let p1 = home                       
        p2 = {x:Math.random()*w,y:Math.random()*h/2}
        p3 = {x:w-p2.x,y:p2.y+Math.random()*h/4}
        p4 = {x:w-p3.x,y:3*h/4}
        p5 = {x:Math.floor(Math.random()*2)==1?0:w,y:h}
        p6 = {x:p5.x==0?w:0,y:h-50}
        p7 = home

    points.push(p1)
    points.push(p2)
    points.push(p3)
    points.push(p4)
    points.push(p5)
    points.push(p6)
    points.push(p7)
    return multiplot(points);
};

function plotStreak(){
    let canvas = document.getElementById('canvas');
    let points = [],
        w = canvas.width,
        h = canvas.height-150,
        dir = Math.floor(Math.random()*2)==0,

        p1 = {x:dir? 0:w, y:Math.random()*h},  // start
        p2 = {x:Math.random()*w,y:Math.random()*h},  // p2 = p6
        p3 = {x:Math.random()*w,y:Math.random()*h},  // p3 = p7
        p4 = {x:Math.random()*w,y:Math.random()*h},  // mid
        p5 = {x:Math.random()*w,y:Math.random()*h},  // p5 = p1
        p6 = {x:Math.random()*w,y:Math.random()*h},  // p6 = p2
        p7 = {x:dir?w+50:-50, y:Math.random()*h};  // end                                                  // end

    points.push(p1);
    points.push(p2);
    points.push(p3);
    points.push(p4);
    points.push(p5);
    points.push(p6);
    points.push(p7);

    return multiplot(points);
};