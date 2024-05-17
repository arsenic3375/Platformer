let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key == "Up" || e.key == "ArrowUp") {
        upPressed = true;
    }
    if(e.key == "Down" || e.key == "ArrowDown") {
        downPressed = true;
    }
    if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Up" || e.key == "ArrowUp") {
        upPressed = false;
    }
    if(e.key == "Down" || e.key == "ArrowDown") {
        downPressed = false;
    }
    if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Platform(x, y, s, type) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.type = type;
    this.color = 'rgb(0, 255, 255)';
    
    this.points = function() { return this.createPoints(this.x, this.y); }
    
    this.createPoints = function(x, y) {
        return [new Point(x-this.s/2, y-this.s/2),
                new Point(x+this.s/2 - 1, y-this.s/2),
                new Point(x+this.s/2 - 1, y+this.s/2 - 1),
                new Point(x-this.s/2, y+this.s/2 - 1)];
    }
    
    this.within = function(point) {
        if (point.x >= this.points()[0].x &&
            point.x <= this.points()[2].x &&
            point.y >= this.points()[0].y &&
            point.y <= this.points()[2].y) {
            return true;
        }
        return false;
    }
    
    this.pointsWithin = function(points) {
        for(let i = 0; i < points.length; i++) {
            if(this.within(points[i]) === true) { return true; }
        }
        return false;
    }

    this.create = function() {
        switch (this.type) {
            case "a":
                this.color = 'rgb(0, 255, 255)';
                break;
            case "b":
                this.color = 'rgb(255, 0, 255)';
                break;
            default:
                this.color = 'rgb(255, 255, 0)';
        }
    }

    this.draw = function() {
        ctx.beginPath();
        ctx.rect(this.x-this.s/2, this.y-this.s/2, this.s, this.s);
        ctx.fillStyle = this.color;
        ctx.fill();        
        ctx.closePath();
    }
}

function Player(x, y, s) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.vx = 1;
    this.vy = 1;
    this.color = 'rgb(255, 255, 0)';
    
    this.canJump = false;
    this.jumping = false;
    this.falling = false;
    this.jumpHeight = 50;
    
    this.jumpStartPoint = new Point(this.x,  this.y);
    
    this.setJumpStartPoint = function() {
        this.jumpStartPoint.x = this.x;
        this.jumpStartPoint.y = this.y;
    }
    
    this.points = function() { return this.createPoints(this.x, this.y); }
    
    this.createPoints = function(x, y) {
        return [new Point(x-this.s/2, y-this.s/2),
                new Point(x+this.s/2 - 1, y-this.s/2),
                new Point(x+this.s/2 - 1, y+this.s/2 - 1),
                new Point(x-this.s/2, y+this.s/2 - 1)];
    }
    
    this.pointsUp = function() { return this.createPoints(this.x, this.y - this.vy); }
    
    this.pointsDown = function() { return this.createPoints(this.x, this.y + this.vy); }
    
    this.pointsLeft = function() { return this.createPoints(this.x - this.vx, this.y); }
    
    this.pointsRight = function() { return this.createPoints(this.x + this.vx, this.y); }
    
    this.jump = function() {
        if(this.canJump === true) {
            this.setJumpStartPoint();
            this.jumping = true;
            this.falling = false;
        }
        const jumpPeak = this.jumpStartPoint.y - this.jumpHeight;
        if((this.jumping === true) && (this.y >= jumpPeak)) { this.y -= this.vy; }
        if (this.y < jumpPeak) {
            this.jumping = false;
            this.falling = true;
        }
        if (this.falling === true) { this.fall(); }
    }
    
    this.fall = function() {
        this.jumping = false;
        this.falling = true;
        this.y += this.vy;
    }

    this.left = function() { this.x -= this.vx; }
    
    this.right = function() { this.x += this.vx; }

    this.draw = function() {
        ctx.beginPath();
        ctx.rect(this.x-this.s/2, this.y-this.s/2, this.s, this.s);
        ctx.fillStyle = this.color;
        ctx.fill();        
        ctx.closePath();
    }
}

function Level(layout) {
    let unitSize = 25;
    this.layout = layout;
    this.player = new Player(0, 0, unitSize);
    this.level = [];
    
    this.background = function(color) {
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    
    this.collision  = function(points) {
        for(let i = 0; i < this.level.length; i++) {
            for(let j = 0; j < this.level[i].length; j++) {
                if (this.level[i][j] != null && this.level[i][j] != this.player) {
                    if (this.level[i][j].pointsWithin(points)== true) {
                       return true;
                    }
                }
            }
        }
        return false;
    }

    this.create = function() {
        for(let i = 0; i < this.layout.length; i++) {
            this.level[i] = [];
            for(let j = 0; j < this.layout[i].length; j++) {
                this.level[i][j] = null;
                if (this.layout[i][j] == "p") {
                    const offset = this.player.s / 2;
                    this.player.x = (j * this.player.s) + offset;
                    this.player.y = (i * this.player.s) + offset;
                    this.level[i][j] = this.player;
                }
                else if (this.layout[i][j] !== " ") {
                    const offset = unitSize / 2;
                    this.level[i][j] = new Platform((j * unitSize) + offset,
                                                    (i * unitSize) + offset,
                                                    unitSize,
                                                    this.layout[i][j]);
                    this.level[i][j].create();
                }
            }
        }
    }

    this.draw = function() {
        this.background('rgb(0, 0, 0)');
        for(let i = 0; i < this.level.length; i++) {
            for(let j = 0; j < this.level[i].length; j++) {
                if (this.level[i][j] != null) {
                    this.level[i][j].draw();
                }
            }
        }
    }
}

let layout = [
["a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a", "a", "a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", " ", "a", "a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", " ", "a", "a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", " ", " ", " ", " ", " ", "a", "a", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "a"],
["a", "p", " ", " ", " ", "a", "a", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "b", "a"],
["a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a"]
];

let level = new Level(layout);
level.create();

let levelChange = true;

function draw() {
    level.player.canJump = level.collision(level.player.pointsDown());

    if(upPressed === true) {
        if(level.collision(level.player.pointsUp()) === false) {
            level.player.jump();
            levelChange = true;
        }
    }
    else if(level.collision(level.player.pointsDown()) === false) {
        level.player.fall();
        levelChange = true;
    }
    
    if((level.collision(level.player.pointsUp()) === true) && (level.collision(level.player.pointsDown()) === false)) { 
        level.player.fall();
        levelChange = true;
    }

    if(leftPressed === true) {
        if(level.collision(level.player.pointsLeft()) === false) {
            level.player.left();
            levelChange = true;
        }
    }

    if(rightPressed === true) {
        if(level.collision(level.player.pointsRight()) === false) {
            level.player.right();
            levelChange = true;
        }
    }
    
    if (levelChange === true) {
        level.draw();
        levelChange = false;
    }
}

setInterval(draw, 10);