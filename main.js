function fromAngle(e, t) {
    return void 0 === t && (t = 1), new Vector(t * Math.cos(e), t * Math.sin(e), 0)
}

function Particle(x, y, color, firework, size = 1, velX, velY) {
    this.pos = new Vector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.color = color;
    this.size = size;

    if (this.firework) {
        this.vel = new Vector(velX, velY);
    } else {
        this.vel = fromAngle(Math.random() * (Math.PI * 2));
        this.vel.multi(Canv.random(-10, 20));
    }
    this.acc = new Vector(0, 0);

    this.applyForce = function (force) {
        this.acc.add(force);
    }

    this.update = function () {
        if (!this.firework) {
            this.vel.multi(0.85);
            this.lifespan -= 5;
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.multi(0);
    }

    this.done = function () {
        if (this.lifespan < 0) {
            return true;
        }
    }

    this.show = function (canv) {
        const point = new Circle(this.pos.x, this.pos.y, this.size);
        if (!this.firework) {
            point.color = new Color(this.color.r, this.color.g, this.color.b, canv.map(this.lifespan, 0, 255, 0, 1));
        } else {
            point.color = new Color(this.color);
        }
        canv.add(point);

    }
}

function Firework(canv, x, y, velX, velY) {
    this.color = Color.random();
    this.firework = new Particle(x, y, this.color, true, 2, velX, velY);

    canv.playFireworkWhistle();

    this.exploded = false;
    this.particles = [];
    this.rainbow = Canv.random(0, 1);

    this.done = function () {
        if (this.exploded && this.particles.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    this.update = function (gravity) {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();

            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    this.explode = function () {
        canv.playFireworkPop();
        for (let i = 0; i < Canv.random(50, 150); i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.color, false, 1);
            if (this.rainbow) {
                p.color = Color.random();
            }
            this.particles.push(p);
        }
    }

    this.show = function () {
        if (!this.exploded) {
            this.firework.show(canv);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].show(canv);
        }
    }
}

const ny = new Canv('canvas', {
    fullscreen: true,
    debug: false,
    debugSeconds: 10,
    displayType: 1,
    fireworkDelay: 20,
    autoFireworks: true,
    fontSize: 40,
    tenSeconds: false,
    newYears: false,
    clicked: false,
    triggered: false,
    triggerDebug: false,
    auto: false,
    setup() {
        this.sounds = {
            crackling: new Howl({
                src: ['sounds/firework-crackling.mp3']
            }),
            pop: [
                new Howl({
                    src: ['sounds/firework-single-1.mp3']
                }),
                new Howl({
                    src: ['sounds/firework-single-2.mp3']
                }),
                new Howl({
                    src: ['sounds/firework-single-3.mp3']
                }),
                new Howl({
                    src: ['sounds/firework-single-4.mp3']
                }),
                new Howl({
                    src: ['sounds/firework-single-5.mp3']
                })
            ],
            whistle: [
                new Howl({
                    src: ['sounds/firework-whistle-1.wav'],
                    volume: 0.05
                }),
                new Howl({
                    src: ['sounds/firework-whistle-2.wav'],
                    volume: 0.05
                }),
                new Howl({
                    src: ['sounds/firework-whistle-3.wav'],
                    volume: 0.05
                }),
            ]
        }

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
            // this.bg.color = this.displayType ? new Color(0, 0, 0, 0.1) : new Color(255, 255, 255, 0.1);
            this.clicked = true;
            if (this.newYears) {
                this.addFirework(this.mouseX, this.mouseY);
            }
        });
    },

    resize() {
        this.bg.width = this.width;
        this.bg.height = this.height;
    },

    addFirework(x, y, velX, velY) {
        if (velX === undefined) {
            velX = Canv.random(-5, 5);
            velY = Canv.random(-12, -8);
        }
        this.fireworks.push(new Firework(this, x, y, velX, velY));
    },

    playFireworkPop() {
        const effect = Canv.random(this.sounds.pop);
        effect.play();
        // this.sounds.crackling.play();
    },

    playFireworkWhistle() {
        const effect = Canv.random(this.sounds.whistle);
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

        if (this.displayType === 1) {
            if (days < 10 && days > 0) {
                days = `0${days}`;
            }
            if (hours < 10 && hours > 0) {
                hours = `0${hours}`;
            }
            if (minutes < 10 && minutes > 0) {
                minutes = `0${minutes}`;
            }
            if (sec < 10 && sec > 0) {
                sec = `0${sec}`;
            }
        }

        if (this.tenSeconds) {
            return sec;
        } else {
            if (this.displayType === 0) {
                return `${days} days ${hours} hours ${minutes} minutes ${sec} seconds`;
            }
            if (this.displayType === 1) {
                return days + ":" + hours + ":" + minutes + ":" + sec;
            }

        }
    },

    triggerNewYears() {
        if (!this.triggered) {
            this.triggered = true;
            if (this.autoFireworks) {
                let j, i;

                const count = 20;
                const spacing = this.width / count;
                j = 0;
                i = 0;
                for (let i = 0; i < count; i++) {
                    setTimeout(() => {
                        this.addFirework((spacing) * (i + 1), this.height, 0, -12);
                    }, j * 250);
                    j++;
                }

                setTimeout(() => {
                    j = 0;
                    for (let i = -16; i < 16; i++) {
                        setTimeout(() => {
                            this.addFirework(this.halfWidth(), this.height, i, -12);

                            if (i === 15 && this.autoFireworks) {
                                this.auto = true;
                            }
                        }, j * 50);
                        j++;
                    }
                }, 5000);
            }
        }

        if (this.auto) {
            // if (this.frames % this.fireworkDelay === 0) {
            //     this.addFirework(this.randomWidth, this.height);
            // }
        }
    },

    setDebug(debugSeconds = 10) {
        this.debugSeconds = debugSeconds;
        this.triggerDebug = true;
        this.debug = true;
    },

    getCountdown() {
        let curDate = new Date;
        if (this.debug) {
            if (this.frames === 1 || this.triggerDebug) {
                this.triggerDebug = false;
                this.nyDate = new Date();
                this.nyDate.setSeconds(this.nyDate.getSeconds() + (this.debugSeconds + 1));
            }
        } else {
            this.nyDate = new Date("01-01-" + curDate.getFullYear());
        }

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

        this.clickText = new Text("(click for fireworks)", this.halfWidth(), this.countdown.y + this.countdown.fontSize, 14);
        this.clickText.textAlign = "center";
        this.clickText.color = color;

        if (this.tenSeconds === true && !this.newYears) {
            this.updatePole();
        }

        if (this.newYears) {
            this.triggerNewYears();
            this.countdown.string = "HAPPY NEW YEAR!!";

            if (this.getCountdown() < -200 && this.pole.stick.height > 1) {
                this.pole.stick.height -= 10;
                this.pole.ball.size--;
            }
        }

        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            this.fireworks[i].update(this.gravity);
            if (this.fireworks[i].done()) {
                this.fireworks.splice(i, 1);
            }
        }
    },

    draw() {
        this.add(this.bg);

        if (this.newYears) {
            this.fireworks.forEach(firework => {
                firework.show();
            })
        }

        if(!this.newYears) {
            this.add(this.pole);
        }

        if (this.newYears && this.auto) {
            this.add(this.clickText);
        }
        this.add(this.countdown);
    }
});