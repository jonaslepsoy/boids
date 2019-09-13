const canvas = document.getElementById("boids");
const context = canvas.getContext("2d");

const numberOfBoids = 100;
const flock = [];
const sightRange = 100;

Victor.prototype.setMagnitude = function(magnitude) {
  this.x = this.x * (magnitude / this.magnitude());
  this.y = this.y * (magnitude / this.magnitude());
}

Victor.prototype.div = function(dividend) {
  this.x = this.x / dividend;
  this.y = this.y / dividend;
}

Victor.prototype.limitMagnitude = function(maxMagnitude) {
  if (this.magnitude() > maxMagnitude) {
    this.setMagnitude(maxMagnitude);
  }
}

function setup() {
  for(let i = 0;i < numberOfBoids;i++) {
    const boid = new Boid();
    boid.velocity.setMagnitude(2+Math.random()*2);
    flock.push(boid);
  }
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  clearCanvas();
  for(let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.draw();
  }
}

function mainLoop() {
    draw();
    requestAnimationFrame(mainLoop);
}

// Start things off
setup();
requestAnimationFrame(mainLoop);
