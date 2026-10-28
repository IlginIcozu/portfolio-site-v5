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
inverted = fxrand()
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

if (bg < 0.10) {
    colPal = "colorPalette1"
}
if (bg > 0.10 && bg < 0.20) {
    colPal = "colorPalette2"

}
if (bg > 0.20 && bg < 0.30) {
    colPal = "colorPalette3"
}
if (bg > 0.30 && bg < 0.40) {
    colPal = "colorPalette4"
}
if (bg > 0.40 && bg < 0.50) {
    colPal = "colorPalette5"
}
if (bg > 0.50 && bg < 0.60) {
    colPal = "colorPalette6"
}
if (bg > 0.60 && bg < 0.70) {
    colPal = "colorPalette7"

}
if (bg > 0.70 && bg < 0.83) {
    colPal = "colorPalette8"
}
if (bg > 0.83 && bg < 0.95) {
    colPal = "colorPalette9"
} else if (bg > 0.95) {
    colPal = "monoChrome"
}

let mNoise;
let diklik;
if (dikYatay < 0.40) { ////////////////////// DİK ÜÇLÜ
    diklik = "verticalLines - 3"
    if (chooser < 0.3) {
        mNoise = "Noise1"
    } else if (chooser > 0.3 && chooser < 0.5) {
        mNoise = "Noise2"
    } else if (chooser > 0.5 && chooser < 0.7) {
        mNoise = "Noise3"
    } else if (chooser > 0.7 && chooser < 0.85) {
        mNoise = "Noise4"
    } else if (chooser > 0.85) {
        mNoise = "Noise5"
    }
} else if (dikYatay < 0.80 && dikYatay > 0.40) { //////DİK İKİLİ
    diklik = "verticalLines - 2"
    mNoise = "None"
} else if (dikYatay > 0.80 && dikYatay < 0.85) { /////// YATAY ÜÇLÜ
    diklik = "horizontalLines - 3"
    if (chooser < 0.3) {
        mNoise = "Noise1"
    } else if (chooser > 0.3 && chooser < 0.5) {
        mNoise = "Noise2"
    } else if (chooser > 0.5 && chooser < 0.7) {
        mNoise = "Noise3"
    } else if (chooser > 0.7 && chooser < 0.85) {
        mNoise = "Noise4"
    } else if (chooser > 0.85) {
        mNoise = "Noise5"
    }
} else if (dikYatay > 0.85) { /////// YATAY İKİLİ
    diklik = "horizontalLines - 2"
    mNoise = "None"
}





let sNoise;
if (chooser2 < 0.3) {
    sNoise = "Noise1"
} else if (chooser2 > 0.3 && chooser2 < 0.5) {
    sNoise = "Noise2"
} else if (chooser2 > 0.5 && chooser2 < 0.7) {
    sNoise = "Noise3"
} else if (chooser2 > 0.7 && chooser2 < 0.85) {
    sNoise = "Noise4"
} else if (chooser2 > 0.85) {
    sNoise = "Noise5"
}



window.$fxhashFeatures = {

    "Color Palette": colPal,
    "Inverted": inverted > 0.5,
    "Placement": diklik,
    "Center Noise": mNoise,
    "Side Noise": sNoise

}

// function preset() {

// dikYatay = fxrand();


// if (bg < 0.5) {
//     colorPal1 = "colorPalette1"
// } else if (bg > 0.5) {
//     colorPal2 = "colorPalette2"
// }

// }

function colors(){
    // if (bg < 0.10) {
                colorB = color('#A53F2B');
                colorW = color('#CCC9A1'); /// CP1
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


    if (kareDaire < 0.5) {

        for (let x = 0; x < width - 0; x += space) { // 1275
            for (let y = height / 4; y < height - 0; y += height) {
                let p = createVector(x, y)
                particles.push(p)
            }
        }


        for (let x = width / 1.333333; x < width; x += width / 1) { // 1275
            for (let y = 0; y < height; y += space) {
                let p = createVector(x, y)
                particles2.push(p)
            }
        }

        for (let x = width / 4; x < width; x += width / 1) { // 1275
            for (let y = 0; y < height; y += space) {
                let p = createVector(x, y)
                particles3.push(p)
            }
        }


        for (let x = 0; x < width - 0; x += space) { // 1275
            for (let y = height / 1.33333; y < height - 0; y += height) {
                let p = createVector(x, y)
                particles4.push(p)
            }
        }
    } else if (kareDaire > 0.5) {


        for (let a = 0; a < 360; a += 0.40) {

            let x = width / 2 + cos(a) * rad;
            let y = height / 2 + sin(a) * rad;
            // stroke(0)
            // point(x, y)
            let p = createVector(x, y)
            particles.push(p)
        }



        // for (let x = 0; x < TWO_PI; x += radians(1)) { // 1275
        //     for (let y = 0; y < TWO_PI; y += radians(1)) {
        //         let r = 100;
        //         let p = createVector(cos(x) * r, sin(y) * r)
        //         particles.push(p)
        //     }
        // }


        for (let x = width / 1.333333; x < width - 0; x += width / 2) { // 1275
            for (let y = 0; y < height - 0; y += space) {
                let p = createVector(x, y)
                particles2.push(p)
            }
        }



        for (let x = width / 4; x < width - 0; x += width / 1) { // 1275
            for (let y = 0; y < height - 0; y += space) {
                let p = createVector(x, y)
                particles3.push(p)
            }
        }


        for (let x = 0; x < width - 0; x += space) { // 1275
            for (let y = height / 1.3333; y < width - 0; y += height) {
                let p = createVector(x, y)
                particles4.push(p)
            }
        }

    }


}


function setup() {
    createCanvas(1000, 1000);

    // createCanvas(windowWidth, windowHeight);


    // if(degreeM < 0.8){
    angleMode(RADIANS)
    // }else if(degreeM > 0.8){
    //     angleMode(DEGREES)
    // }


    rectMode(CENTER)

    // sBlur = 2000; //width/1.2;

    frameRate(60)




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



    colors()



    background(bgColor); //218
    noStroke();


    //     if(kareDaire > 0.5){
    //     push();
    //     rectMode(CENTER)
    //     noFill()
    //     stroke(lineColor, lineColor.setAlpha(50))
    //     rect(width/2, height/2, 600)
    //     pop()
    // }
    // push()
    // rectMode(CORNER)
    // fill(lineColor)
    // rect(0, 0, width, frm)
    // rect(0, 0, frm, height)
    // rect(0, height, width, -frm)
    // rect(width, 0, -frm, height)
    // pop()
    // let frm = 25

    noise = new OpenSimplexNoise(Date.now());

    density = 1000;
    space = width / density;
    spaceY = height / density;


    if (slect < 0.20) an = 1;
    if (slect > 0.20 && slect < 0.40) an = 2;
    if (slect > 0.40 && slect < 0.60) an = 3;
    if (slect > 0.60 && slect < 0.80) an = 4;
    if (slect > 0.80) an = 5;


    partics();



    console.log(chooser)
    console.log(chooser2)
    console.log(randMult1)



}

function draw() {
    noStroke();

    for (let i = 0; i < particles.length; i = i + 1) {

        let mu = 2

        noiseStop = map(noise.noise2D(particles[i].x * mult, i * mult), -0.6, 1, 0.2, 84);





        var angle = map(noise.noise2D(particles[i].x * mult, particles[i].x * mult), 0, 1, 0, (720 * randMult1) * multMinus);
        var angle2 = map(sin(particles2[i].x * mult * i), -1, 1, 0, (720 * randMult1) * multMinus);
        var angle3 = map(noise.noise2D(particles3[i].x * mult, particles3[i].y * mult), 0, 1, 0, (720 * 2 * randMult1) * multMinus);

        var angle4 = map(noise.noise2D(particles3[i].y * mult, particles3[i].y * mult), 0, 1, 0, (720 / 20 * randMult1) * multMinus);
        var angle5 = map(tan(particles[i].x * mult * i), -1, 1, 0, (720 * randMult1) * multMinus);
        var angle6 = map(cos(particles3[i].y * mult * particles3[i].y * mult * i * mult), 0, 1, 0, (720 / 20 * randMult1) * multMinus);


        var angleA1 = map(noise.noise2D(particles[i].x * mult, particles[i].y * mult), 0, 1, 0, 720 / 4);

        if (sagSol < 0.2) {
            var angleA2 = map(sin(particles[i].y), -1, 1, 0, 5); // 32
        } else {
            var angleA2 = map(sin(particles[i].x), -1, 1, 0, 32); // 32
        }


        var angleA3 = map(noise.noise2D(tan(particles[i].y), tan(particles[i].x)), -1, 1, 0, an);

        var angleA4 = map(noise.noise2D(particles[i].x * mult, particles[i].y * mult), 0, 1, 0, (720 * 1.2));

        var angleA5 = map(noise.noise2D(particles[i].x * mult, particles[i].y * mult), 0, 1, 0, 2) * map(tan(particles[i].x * mult * i), -1, 1, 0, 2);


        var angleB1 = map(noise.noise2D(particles3[i].x * mult, particles3[i].y * mult), 0, 1, 0, (720) );

        var angleB2 = map(noise.noise2D(particles3[i].x * mult, particles2[i].y * mult), 0, 1, 0, 2) * sin(cos(particles[i].y * mult * i), -1, 1, 0, 4);

        var angleB3 = map(cos(particles[i].y * mult * particles4[i].y * mult * i * mult), 0, 1, 0, (720 / 20));

        var angleB4 = map(noise.noise3D(particles[i].x * mult, particles[i].y * mult, i ), 0, 1, 0, (720 * 1.2));



        if (kareDaire < 0.5) {
            if (chooser < 0.3) {
                vec = createVector(sin(angle * (i / 100)), cos(angle));
                vec2 = vec
                vec3 = vec
                vec4 = vec;
    
                vec1_1 = createVector(cos(angleA5), sin(angleA4));
                vec2_1 = vec1_1;
                vec3_1 = vec1_1;
                vec4_1 = vec1_1;
          
            } else if (chooser > 0.3 && chooser < 0.5) {
                vec = createVector(sin(angleB2), cos(angleB2)); 
                vec2 = vec
                vec3 = vec
                vec4 = vec;
    
                vec1_1 = createVector(sin(angleA5), cos(angleA2));
                vec2_1 = vec1_1;
                vec3_1 = vec1_1;
                vec4_1 = vec1_1;
           
            } else if (chooser > 0.5 && chooser < 0.7) {
                vec = createVector(sin(angleB3), cos(angleB3)); 
                vec2 = vec
                vec3 = vec
                vec4 = vec;
    
                vec1_1 = createVector(sin(angleB2), cos(angleA1));
                vec2_1 = vec1_1;
                vec3_1 = vec1_1;
                vec4_1 = vec1_1;
           
            } else if (chooser > 0.7 && chooser < 0.85) {
                vec = createVector(sin(angleA3), cos(angleA1));
                vec2 = vec
                vec3 = vec
                vec4 = vec;
    
                vec1_1 = createVector(sin(angleA5), cos(angleA2));
                vec2_1 = vec1_1;
                vec3_1 = vec1_1;
                vec4_1 = vec1_1;
            // vec = createVector(sin(angle5 * 2), cos(angle6 * (i / 100))); // bu da güzel
            // vec4 = vec
            } else if (chooser > 0.85) {
                vec = createVector(sin(angleA4), cos(angleA4));
                vec2 = vec
                vec3 = vec
                vec4 = vec;
    
                vec1_1 = createVector(sin(angleB2), cos(angleB2)); 
                vec2_1 = vec1_1;
                vec3_1 = vec1_1;
                vec4_1 = vec1_1;
            // vec = createVector(cos(angle3 * 2), sin(angle2 * 200));
            // vec4 = vec
            }

            // if (chooser2 < 0.3) {
            // vec2 = createVector(sin(angle3 * 2), cos(angle / 200)); // bu dursun
            // vec3 = vec2;
            // } else if (chooser2 > 0.3 && chooser2 < 0.5) {
            //     vec2 = createVector(sin(angle4 * 2), tan(angle6 * 2));
            //     vec3 = vec2;
            // } else if (chooser2 > 0.5 && chooser2 < 0.7) {
            //     vec2 = createVector(sin(angle2 * (i / 100)), sin(angle4 * (i / 100)));
            //     vec3 = vec2;
            // } else if (chooser2 > 0.7 && chooser2 < 0.85) {
            //     vec2 = createVector(sin(angle5 * 2), tan(angle3 * 2 * (i / 100))); // bu da güzel
            //     vec3 = vec2;
            // } else if (chooser2 > 0.85) {
            //     vec2 = createVector(cos(angle2 * 2), sin(angle2 * 200));
            //     vec3 = vec2;
            // }


            vec.setMag(0.5);
            vec2.setMag(0.5);
            vec3.setMag(0.5);
            vec4.setMag(0.5);
            vec1_1.setMag(0.5);
            vec2_1.setMag(0.5);
            vec3_1.setMag(0.5);
            vec4_1.setMag(0.5);

            // particles[i].add(vec);
            // particles2[i].add(vec2);
            // particles3[i].add(vec3);
            // particles4[i].add(vec4);


            if (dist(width/2, height/2,particles[i].x, particles[i].y) > 150) particles[i].add(vec); else particles[i].add(vec1_1);
            if (dist(width/2, height/2,particles2[i].x, particles2[i].y) > 150) particles2[i].add(vec2); else particles2[i].add(vec2_1);
            if (dist(width/2, height/2,particles3[i].x, particles3[i].y) > 150) particles3[i].add(vec3); else particles3[i].add(vec3_1);
            if (dist(width/2, height/2,particles4[i].x, particles4[i].y) > 150) particles4[i].add(vec4); else particles4[i].add(vec4_1);

             

            // particles[i].add(vec);
            // particles2[i].add(vec2);
            // particles3[i].add(vec3);
            // particles4[i].add(vec4);


        } else if (kareDaire > 0.5) {
            
            if (chooser < 0.3) {
                vec = createVector(sin(angleA1), cos(angleA1 ));
                vec2 = createVector(tan(angle2 * 2), tan(angle2 * 200));
                vec2.setMag(0.5);
            } else if (chooser > 0.3 && chooser < 0.5) {
                vec = createVector(sin(angleA2), cos(angleA2));
                vec2 = createVector(sin(angle2), cos(angle2));
                vec2.setMag(0.5);
            } else if (chooser > 0.5 && chooser < 0.7) {
                vec = createVector(sin(angleA3), cos(angleA3));
                vec2 = createVector(sin(angle), cos(angle2));
                vec2.setMag(0.5);
            } else if (chooser > 0.7 && chooser < 0.85) {
                vec = createVector(sin(angleA4), cos(angleA4));
                vec2 = createVector(cos(angle2 * 2), sin(angle2 * 200));
                vec2.setMag(0.5);
            } else if (chooser > 0.85) {
                vec = createVector(sin(angleA5), cos(angleA5));
                vec2 = createVector(cos(angle2 * 2), sin(angle2 * 200));
                vec2.setMag(0.5);
            }

            vec.setMag(0.5);
            
            // particles[i].add(vec);

            if (particles[i].x < width/2.5 || particles[i].x > width/1.66666667 || particles[i].y > height/1.66666667 || particles[i].y < height/2.5) {
                particles[i].add(vec);
                
            } else {
                particles[i].add(vec2);
            }


        }












        // if (kareDaire > 0.5) { /// DAİRE



        // } else if (kareDaire < 0.5) { /// KARE


        alpha = lineColor.setAlpha(map(dist(width / 2, height / 2, particles[i].x, particles[i].y), width / 2.2222222, 0, 150, 0));
        alpha2 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles2[i].x, particles2[i].y), width / 2.2222222, 0, 150, 0));
        alpha3 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles3[i].x, particles3[i].y), width / 2.2222222, 0, 150, 0));
        alpha4 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles4[i].x, particles4[i].y), width / 2.2222222, 0, 150, 0));

        alphaA1 = lineColor.setAlpha(map(dist(width / 2, height / 2, particles[i].x, particles[i].y), width / 2.2222222, 0, 150, 20));




        if (kareDaire < 0.5) {
            if (dist(width / 2, height / 2, particles[i].x, particles[i].y) < width/2.5) {
                if (particles[i].x > (width / 4) && particles[i].x < (width / 1.333333)) {
                    if(particles[i].y < height/1.33333){
                    // if (particles[i].x < 400 || particles[i].x > 600 || particles[i].y > 600 || particles[i].y < 400) {
                        fill(lineColor, alpha - minus) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                        ellipse(particles[i].x, particles[i].y, 1)
                    }
                    // }
                }
            }

            if (dist(width / 2, height / 2, particles2[i].x, particles2[i].y) < width/2.5) {
                // if (particles2[i].x > (width / 2) && particles2[i].x < (width / 1.111111)) {
                    if(particles2[i].y > (height/4) && particles2[i].y < (height / 1.333333)){
                    // if (particles2[i].x < 400 || particles2[i].x > 600 || particles2[i].y > 600 || particles2[i].y < 400) {
                        fill(lineColor, alpha2 - minus) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                        ellipse(particles2[i].x, particles2[i].y, 1)
                     }
                // }
            }

            if (dist(width / 2, height / 2, particles3[i].x, particles3[i].y) < width/2.5) {
                // if (particles3[i].x > (width / 10) && particles3[i].x < (width / 2)) {
                    if(particles3[i].y > (height/4) && particles3[i].y < (height / 1.333333)){
                    // if (particles3[i].x < 400 || particles3[i].x > 600 || particles3[i].y > 600 || particles3[i].y < 400) {
                        fill(lineColor, alpha3 - minus) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                        ellipse(particles3[i].x, particles3[i].y, 1)
                     }
                // }
            }

            if (dist(width / 2, height / 2, particles4[i].x, particles4[i].y) < width/2.5) {
                if (particles4[i].x > (width / 4) && particles4[i].x < (width / 1.333333)) {
                    // if (particles4[i].x < 400 || particles4[i].x > 600 || particles4[i].y > 600 || particles4[i].y < 400) {
                    fill(lineColor, alpha4 - minus) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                    ellipse(particles4[i].x, particles4[i].y, 1)
                    // }
                }
            }
        }


        if (kareDaire > 0.5) {
            if (particles[i].x > width/10 && particles[i].x < width/1.1111111111 && particles[i].y < height/1.1111111111 && particles[i].y > height/10) {
                if(particles4[i].y > height/4){
                // if(dist(width/2, height/2, particles[i].x, particles[i].y) > 100){
                // if(particles[i].x < 400 || particles[i].x > 600 || particles[i].y > 600 || particles[i].y < 400){
                fill(lineColor, alpha - minus) //map(dist(width / 2, height / 2, particles[i].y, particles[i].y), 0, height/2, lineColor, bgColor)
                ellipse(particles[i].x, particles[i].y, 1)
                // }
                }

            }

        }


    }

    if (frameCount >= 1080) {
        // noLoop();
        minus += 0.5;
        if (minus == 200) {
            noLoop();
        }
    }

    // let cx = width/2
    // let cy = height/2

    // for (let a = 0; a < 360; a +=0.25) {
    //     r = map(noise.noise2D(a*0.1, frameCount),0,1,200,250);
    //     let x = cx + cos(a) * r;
    //     let y = cy + sin(a) * r;
    //     stroke(0)
    //     point(x,y)
    //   }

    // getColorPalette()
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


function keyPressed() {
    if (key == 's') {
        saveCanvas('HOP', 'png');
    }
}