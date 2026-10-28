let particles = [];
let particles2 = [];
let particles3 = [];
let particles4 = [];
let particles5 = [];
let particles6 = [];
let particles7 = [];
let particles8 = [];
let particles9 = [];
let mult = 0.005;
let edge;
let sBlur;
let blurEdge = 0;
let vec, vec2, vec3;
let chooserMult

let bW = 29;
let bB = 213;

// let xoff, yoff;
let noiseStop;
let triEdge;

let density, spaceX, spaceY;

let rectX1, rectY1, rectW1, rectH1, rectF1;
let rectX2, rectY2, rectW2, rectH2, rectF2;

let col;

// let rand;
let frm;

let colorPalettes;
let chooser, chooser2, chooser3;

let randMult1, randMult2, randMult3, randMult4;

let rand;
let yoff = 0;
let yoff2 = 0;
let aoff = 0;

let bgColor = 213;
let lineColor = 29;
let magRand = 0;
let magRand2 = 0;
let magRand3 = 0;

let alpha, alpha2, alpha3

let magR
let minus = 0;

let rad = 250;


let kareDaire;
let kareDaireIc;
let dikYatay;
let colorB, colorW;

let colorPal1, colorPal2


let bg;

let colorP;
let sizeMult;
let multMinus, multM;
let degreeM;
let sagSol;
let slect;
let an;

console.log(fxhash) // the 64 chars hex number fed to your algorithm
// console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

// window.addEventListener("DOMContentLoaded", (event) => {


// })


// function getColorPalette(value) {
//     if (value < 0.5) {
//         return "colorPalette1"
//     } else if (value > 0.5) {
//         return "colorPalette2"
//     }
// }


// console.log( getColorPalette() )
// let colpal = fxrand()
rand = fxrand();
chooser = fxrand();
chooser2 = fxrand();
chooser3 = fxrand();
bg = fxrand();

kareDaire = fxrand();
kareDaireIc = fxrand();
sizeMult = fxrand();
dikYatay = fxrand();
multM = fxrand()
degreeM = fxrand()
sagSol = fxrand()
slect = fxrand();



let colpal;
let invertedCP;



function colors() {
    // if (bg < 0.10) {
    colorB = color('#171717');
    colorW = color('#d1cfc2'); /// CP1
    if (inverted < 0.5) {
        bgColor = colorB
        lineColor = colorW
    } else if (inverted > 0.5) {
        bgColor = colorW
        lineColor = colorB
    }
    // }

}



function partics() {

    // if (dikYatay < 0.40) { ////////////////////// DİK ÜÇLÜ
    // angleMode(DEGREES)


    // if (kareDaire < 0.5) {
    density = 1000;
    space = width / density;
    spaceY = height / density;

    for (let x = 0; x < width - 0; x += width / 192) { // 1275
        for (let y = height / 10; y < height - 0; y += height) {
            let p = createVector(x, y)
            particles.push(p)
        }
    }



    for (let x = width / 2; x < width; x += width / 1) { // 1275
        for (let y = 0; y < height; y += height / 200) {
            let p = createVector(x, y)
            particles2.push(p)
        }
    }
    for (let x = width / 10; x < width; x += width / 1) { // 1275
        for (let y = 0; y < height; y += height / 200) {
            let p = createVector(x, y)
            particles3.push(p)
        }
    }






    for (let x = 0; x < width - 0; x += width / 192) { // 1275
        for (let y = height / 10; y < height - 0; y += height) {
            let p = createVector(x, y)
            particles4.push(p)
        }
    }



}


function setup() {
    // createCanvas(1000, 1000);

    createCanvas(windowWidth, windowHeight);


    // if(degreeM < 0.8){
    angleMode(DEGREES)
    // }else if(degreeM > 0.8){
    //     angleMode(DEGREES)
    // }


    rectMode(CENTER)

    // sBlur = 2000; //width/1.2;

    frameRate(60)








    noise = new OpenSimplexNoise(Date.now());

    reset()




}

function reset() {

    inverted = random(1)
    
    frm = width / 100;

    edge = 20

    // preset();
    magRand = map(fxrand(), 0, 1, 0.1, 0.5);
    magRand2 = map(fxrand(), 0, 1, (-0.3), 0.5);
    magRand3 = map(fxrand(), 0, 1, (-0.3), 0.5);

    randMult1 = map(0.16, 0, 1, 0.1, 1);

    noiseSeed(fxrand())

    // windowResized();

    minus = 0;

    if (multM < 0.5) {
        multMinus = 1;
    } else multMinus = -1;
    chooserMult = random([1, 100])
    colors()



    background(bgColor); //218
    noStroke();
    if (slect < 0.20) an = 1;
    if (slect > 0.20 && slect < 0.40) an = 2;
    if (slect > 0.40 && slect < 0.60) an = 3;
    if (slect > 0.60 && slect < 0.80) an = 4;
    if (slect > 0.80) an = 5;


    partics();


}

function draw() {
    noStroke();

    for (let i = 0; i < particles.length; i = i + 1) {

        let mu = 2

        noiseStop = map(noise.noise2D(particles[i].x * mult, i * mult), -0.6, 1, 0.2, 84);


        var angle = map(noise.noise3D(particles4[i].y * mult, particles2[i].x * mult, i), 0, 1, 0, 30);

        var angle2 = map(noise.noise3D(particles[i].y * mult, particles3[i].y * mult, i), 0, 1, 0, 10);


        // var angle2 = map(sin(particles4[i].x / mult + particles[i].x * mult), 0, 1, 0, 1);
        // var angle2 = map(cos(particles4[i].x / mult + particles[i].x * mult), 0, 1, 0, 720);

        // var angle2 = map(tan(particles[i].x * mult + particles4[i].x * mult), -1, 1, 0, (720 * randMult1));
        var angle3 = map(noise.noise2D(particles3[i].x * mult, particles3[i].y * mult), 0, 1, 0, (720 * 2 * randMult1) * multMinus);

        var angle4 = map(noise.noise2D(particles2[i].y * mult, particles2[i].y * mult), 0, 1, 0, (720 / 20 * randMult1) * multMinus);
        var angle5 = map(tan(particles[i].x * mult * i), -1, 1, 0, (720 * randMult1) * multMinus);
        var angle6 = map(cos(particles3[i].y * mult * particles3[i].y * mult * i * mult), 0, 1, 0, (720 / 20 * randMult1) * multMinus);


        var angleA1 = map(noise.noise2D(particles[i].x * mult, particles[i].y * mult), 0, 1, 0, 720 / 4);

        // if (sagSol < 0.2) {
        //     var angleA2 = map(sin(particles[i].y), -1, 1, 0, 5); // 32
        // } else {
        //     var angleA2 = map(sin(particles[i].x), -1, 1, 0, 32); // 32
        // }


        var angleA3 = map(noise.noise2D(tan(particles[i].y), tan(particles[i].x)), -1, 1, 0, an);

        var angleA4 = map(noise.noise2D(particles3[i].x * mult, particles3[i].y * mult), 0, 1, 0, (720 * 1.2));

        var angleA5 = map(noise.noise2D(particles[i].x * mult, particles[i].y * mult), 0, 1, 0, 2) * map(tan(particles[i].x * mult * i), -1, 1, 0, 2);


        var angleB1 = map(noise.noise2D(particles3[i].x * mult, particles3[i].y * mult), 0, 1, 0, (720));

        var angleB2 = map(noise.noise2D(particles3[i].x * mult, particles2[i].y * mult), 0, 1, 0, 2) * sin(cos(particles[i].y * mult * i), -1, 1, 0, 4);

        var angleB3 = map(cos(particles[i].y * mult * particles4[i].y * mult * i * mult), 0, 1, 0, (720 / 20));

        var angleB4 = map(noise.noise3D(particles[i].x * mult, particles[i].y * mult, i), 0, 1, 0, (720 * 1.2));



        // if (kareDaire < 0.5) {
        // if (chooser < 0.3) {
        vec = createVector(sqrt(angle * (i / 100)), cos(angle * (i / 100))); // düz  createVector(sin(angle2 * (i / 100)), cos(angle2 * (i / 100)));

        vec2 = createVector(sq(angle2 * (i / 100)), sin(angle2 * (i / 100))); // yamuk  createVector(tan(angle * (i / 100)), tan(angle * (i / 100)));
        vec3 = createVector(sq(angle * (i / 100)), tan(angle * (i / 100)));


        if (particles2[i].x > width / 2 - height/6.46 && particles2[i].x < width / 2 + height/6.46 && particles2[i].y > height / 2 - height/6.46 && particles2[i].y < height / 2 + height/6.46) {
            vec2 = createVector(cos(angle4 * (i / 100)), cos(angle4 * (i / chooserMult)));
        }
        if (particles3[i].x > width / 2 - height/6.46 && particles3[i].x < width / 2 + height/6.46 && particles3[i].y > height / 2 - height/6.46 && particles3[i].y < height / 2 + height/6.46) {
            vec3 = createVector(cos(angle4 * (i / 100)), cos(angle4 * (i / chooserMult)));
        }




        vec4 = vec

        vec1_1 = createVector(cos(angleA5), tan(angleA4));
        vec2_1 = vec1_1;
        vec3_1 = vec1_1;
        vec4_1 = vec1_1;



        vec.setMag(0.5);
        vec2.setMag(1);
        vec3.setMag(1);
        vec4.setMag(0.5);
        vec1_1.setMag(0.5);
        vec2_1.setMag(0.5);
        vec3_1.setMag(0.5);
        vec4_1.setMag(0.5);



        particles[i].add(vec);

        particles2[i].add(vec2);

        particles3[i].add(vec3);

        particles4[i].add(vec4);




        alpha = lineColor.setAlpha(map(dist(width / 2, height / 2, particles[i].x, particles[i].y), width / 2.2222222, 0, 150, 0));
        alpha2 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles2[i].x, particles2[i].y), width / 2.2222222, 0, 150, 0));
        alpha3 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles3[i].x, particles3[i].y), width / 2.2222222, 0, 150, 0));
        alpha4 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles4[i].x, particles4[i].y), width / 2.2222222, 0, 150, 0));

        alphaA1 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles[i].x, particles[i].y), width / 2.2222222, 0, 150, 20));

        if (particles[i].x > (width / 4) && particles[i].x < (width / 1.333333)) {
            if (particles[i].y < height / 1.10) {
                //             // if (particles[i].x < 400 || particles[i].x > 600 || particles[i].y > 600 || particles[i].y < 400) {
                fill(lineColor, lineColor.setAlpha(random(200))) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                if (particles[i].x > width / 2) {
                    // ellipse(particles[i].x, particles[i].y, 1)
                }

            }
        }

        if (particles2[i].x > (width / 2) && particles2[i].x < (width / 1.10)) {
            if (particles2[i].y > (height / 10) && particles2[i].y < (height / 1.10)) {
                //         // if (particles2[i].x < 400 || particles2[i].x > 600 || particles2[i].y > 600 || particles2[i].y < 400) {
                fill(lineColor, lineColor.setAlpha(random(200))) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                ellipse(particles2[i].x, particles2[i].y, 1)
            }
        }
        if (particles3[i].x > (width / 10) && particles3[i].x < (width / 2)) {
            if (particles3[i].y > (height / 10) && particles3[i].y < (height / 1.10)) {

                fill(lineColor, lineColor.setAlpha(random(200))) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                ellipse(particles3[i].x, particles3[i].y, 1)
            }

        }

        if (particles4[i].x < (width / 4) && particles4[i].x > (width / 10)) {
            if (particles[i].y < height / 1.10) {
                fill(lineColor, lineColor.setAlpha(random(200)))
            }
        }
    }



}


// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
//     particles.length = 0;
//     particles2.length = 0;
//     particles3.length = 0;
//     particles4.length = 0;
//     particles5.length = 0;
//     particles6.length = 0;
//     particles7.length = 0;
//     particles8.length = 0;
//     particles9.length = 0;
//     colors()
//     background(bgColor)
//     partics();
// }


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
   


    particles.length = 0;
    particles2.length = 0;
    particles3.length = 0;
    particles4.length = 0;

    reset()


}

function mousePressed() {

    chooserMult = random([1, 100])


    particles.length = 0;
    particles2.length = 0;
    particles3.length = 0;
    particles4.length = 0;

    reset()


}


function keyPressed() {
    if (key == 's') {
        saveCanvas('HOP', 'png');
    }
}