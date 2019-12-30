function fromAngle(e,t) {
    return void 0===t&&(t=1),new Vector(t*Math.cos(e),t*Math.sin(e),0)
}

function Particle(x, y, color, firework) {
    this.pos = new Vector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.color = color;

    if(this.firework) {
        this.vel = new Vector(Canv.random(-5, 5), Canv.random(-12, -8));
    } else {
        this.vel = fromAngle(Math.random()* (Math.PI * 2));
        this.vel.multi(Canv.random(-10, 20));
    }
    this.acc = new Vector(0, 0);

    this.applyForce = function(force) {
        this.acc.add(force);
    }

    this.update = function() {
        if(!this.firework) {
            this.vel.multi(0.85);
            this.lifespan -= Canv.random(2, 5);
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.multi(0);
    }

    this.done = function() {
        if(this.lifespan < 0) {
            return true;
        }
    }

    this.show = function(canv) {
        const point = new Circle(this.pos.x, this.pos.y, 1);
        if(!this.firework) {
            point.color = new Color(this.color.r, this.color.g, this.color.b, canv.map(this.lifespan, 0, 255, 0, 1));
        } else {
            point.color = new Color(this.color);
        }
        canv.add(point);
        
    }
}

function Firework(canv, x, y) {
    this.color = Color.random();
    this.firework = new Particle(x, y, this.color, true);
    this.exploded = false;
    this.particles = [];

    this.done = function() {
        if(this.exploded && this.particles.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    this.update = function(gravity) {
        if(!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();

            if(this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }

        for(let i = this.particles.length-1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
            if(this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    this.explode = function() {
        canv.playFireworkSound();
        for(let i = 0; i < Canv.random(50, 150); i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.color, false);
            this.particles.push(p);
        }
    }

    this.show = function() {
        if(!this.exploded) {
            this.firework.show(canv);
        }

        for(let i = this.particles.length-1; i >= 0; i--) {
            this.particles[i].show(canv);
        }
    }
}

const ny = new Canv('canvas', {
    fullscreen: true,
    debug: true,
    debugSeconds: 20,
    displayType: 1,
    fireworkDelay: 10,
    setup() {
        this.sounds = {
            fireworks: [
                new Howl({ src: ['sounds/firework-single-1.mp3'] }),
                new Howl({ src: ['sounds/firework-single-2.mp3'] }),
                new Howl({ src: ['sounds/firework-single-3.mp3'] }),
                new Howl({ src: ['sounds/firework-single-4.mp3'] }),
                new Howl({ src: ['sounds/firework-single-5.mp3'] })
            ]
        }


        this.fontSize = 40;
        this.tenSeconds = false;
        this.newYears = false;
        this.triggered = false;
        this.pole = new ShapeGroup({
            ball: new Circle(-100, -100),
            stick: new Rect(-100, -100),
            ground: new Rect(-100, -100)
        });

        this.gravity = new Vector(0, 0.2);
        this.fireworks = [];


        this.bg = new Rect(0, 0, this.width, this.height);
        this.bg.color = new Color(0, 0, 0, 0.1);
        this.bg.addEventListener("click", () => {
            this.displayType = this.displayType ? 0 : 1;
        });
    },

    addFirework() {
        this.fireworks.push(new Firework(this, this.randomWidth, this.height));
    },

    playFireworkSound() {
        const effect = Canv.random(this.sounds.fireworks);
        effect.play();
    },

    playCountdownSound(number) {
        
    },

    dhm(ms) {
        days = Math.floor(ms / (24 * 60 * 60 * 1000));
        daysms = ms % (24 * 60 * 60 * 1000);
        hours = Math.floor((daysms) / (60 * 60 * 1000));
        hoursms = ms % (60 * 60 * 1000);
        minutes = Math.floor((hoursms) / (60 * 1000));
        minutesms = ms % (60 * 1000);
        sec = Math.floor((minutesms) / (1000));

        if(this.displayType === 1) {
            if (days < 10 && days > 0) {
                days = "0" + days;
            }
            if (hours < 10 && hours > 0) {
                hours = "0" + hours;
            }
            if (minutes < 10 && minutes > 0) {
                minutes = "0" + minutes;
            }
            if (sec < 10 && sec > 0) {
                sec = "0" + sec;
            }
        }

        if (this.tenSeconds) {
            return sec;
        } else {
            if(this.displayType === 0) {
                return `${days} days ${hours} hours ${minutes} minutes ${sec} seconds`;
            }
            if(this.displayType === 1) {
                return days + ":" + hours + ":" + minutes + ":" + sec;
            }

        }
    },

    triggerNewYears() {
        if(!this.triggered) {
            this.triggered = true;

            alert("Happy New Years!");
        }
    },

    getCountdown() {
        if (this.debug) {
            if (this.frames === 1) {
                this.nyDate = new Date();
                this.nyDate.setSeconds(this.nyDate.getSeconds() + (this.debugSeconds+1));
            }
        } else {
            this.nyDate = new Date("01-01-2020");
        }

        let curDate = new Date;
        let ms = this.nyDate.getTime() - curDate.getTime();
        if (ms <= 11000) {
            this.tenSeconds = true;
        }
        if (ms <= 1000) {
            this.newYears = true;
        }
        return ms;
    },

    updatePole() {
        const poleWidth = 5;
        const groundSize = 50;
        const ballSize = 30;

        this.pole.stick.color = new Color(100);
        this.pole.stick.width = poleWidth;
        this.pole.stick.height = this.height - (groundSize);
        this.pole.stick.x = this.halfWidth(poleWidth);
        this.pole.stick.y = 0;

        this.pole.ball.size = ballSize;
        this.pole.ball.color = Color.random();
        this.pole.ball.x = this.halfWidth();
        this.pole.ball.y = this.map(this.getCountdown(), 11000, 1000, this.pole.stick.y, this.pole.stick.y + this.pole.stick.height);

        this.pole.ground.color = new Color(80);
        this.pole.ground.x = 0;
        this.pole.ground.y = this.height - groundSize;
        this.pole.ground.width = this.width;
        this.pole.ground.height = groundSize;
    },

    update(frames) {
        this.countdown = new Text("DATE", this.halfWidth(), this.halfHeight() - this.fontSize, this.fontSize);
        this.countdown.textAlign = "center";
        const color = this.bg.color.lightOrDark() === "dark" ? new Color(255) : new Color(0);
        this.countdown.color = color;
        this.countdown.string = this.dhm(this.getCountdown());
        if (this.tenSeconds === true && !this.newYears) {
            this.updatePole();
        }

        if (this.newYears) {
            this.triggerNewYears();
            this.countdown.string = "HAPPY NEW YEARS";
            this.countdown.moveX(Canv.random(-5, 5));

            if (this.getCountdown() < -200 && this.pole.stick.height > 1) {
                this.pole.stick.height -= 10;
                this.pole.ball.size--;
            }
        }

        if(this.newYears && this.frames % this.fireworkDelay === 0 && Canv.random(0, 1) === 0) {
            this.addFirework();
        }

        for(let i = this.fireworks.length-1; i>=0; i--) {
            this.fireworks[i].update(this.gravity);
            if(this.fireworks[i].done()) {
                this.fireworks.splice(i, 1);
            }
        }
    },

    draw() {
        this.add(this.bg);

        this.fireworks.forEach(firework => {
            firework.show();
        })

        this.add(this.pole);
        this.add(this.countdown);
    }
});