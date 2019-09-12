const canvas = document.getElementById("boids");
const context = canvas.getContext("2d");

const numberOfBoids = 10;
const boids = [];
const sides = 12;
const radius = 10;
const speed = 1.5;
const turnRate = Math.PI / 10
const sightRange = 200;
const separationDistance = 100;
const viewAngle = Math.PI * 2/3;

let maxConsoleLogs = 100;

/* angle between vertices of polygon */
const boidAngle = ((Math.PI * 2) / sides);

context.fillStyle = "#FF0000";

function randomRange(min, max) {
  return (Math.random() * (max - min)) + min;
};

const topLeft = new Victor(0, canvas.height);
const bottomRight = new Victor(canvas.width, 0);

const createBoid = (id) => {
  return {
    id: id,
    position: new Victor(0,0).randomize(topLeft, bottomRight),
    direction: new Victor(0,0).randomize(new Victor(-2, 2), new Victor(2, -2)),
    speed: Math.random() * 1 + 1,
    color: 'hsl(' + (180 + (40 * Math.random())) + ', 50%, 50%)',
    nearbyBoids: []
  }
}

for (let i = 0;i < numberOfBoids; i++) {
  boids.push(createBoid(i));
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function deg2rad(degrees) {
    return (parseInt(degrees) / 180) * Math.PI;
}



function update() {
  boids.forEach((boid) => {

    if(boid.direction.length() === 0) {
      boid.direction = new Victor(0,0).randomize(new Victor(-1*2, 2), new Victor(2, -1*2))
    }

    // Wrap around if necessary
    if (boid.position.x < 0) {
      boid.position.addX(new Victor(canvas.width,0));
    } else if (boid.position.x > canvas.width) {
      boid.position.subtractX(new Victor(canvas.width,0));
    } else if (boid.position.y < 0) {
      boid.position.addY(new Victor(0, canvas.height));
    } else if (boid.position.y > canvas.height) {
      boid.position.subtractY(new Victor(0, canvas.height));
    }

    // Find nearby, visible Boids
    boid.nearbyBoids = [];
    boids.forEach((otherBoid) => {
      if(boid.position.clone().distance(otherBoid.position) < sightRange) {
        boid.nearbyBoids.push({id: otherBoid.id, position: otherBoid.position, direction: otherBoid.direction});
      }
    });
    boid.nearbyBoids = boid.nearbyBoids.filter((otherBoid) => {
      if(otherBoid.id === boid.id) {
        // Stop being so self-centered. This is yourself!
        return false;
      }
      return isWithinSomeArc(boid.position, otherBoid.position, sightRange, viewAngle, boid.direction.angle());
    });

    // Avoid TODO

    // Align
    if(boid.nearbyBoids.length > 0) {
      boid.meanPosition = boid.nearbyBoids.reduce( function(meanPosition, thisBoid) {
        return { x: meanPosition.x - thisBoid.position.x, y: meanPosition.y - thisBoid.position.y }
      }, {x: 0, y: 0});
      boid.meanPosition.x = boid.meanPosition.x / boid.nearbyBoids.length;
      boid.meanPosition.y = boid.meanPosition.y / boid.nearbyBoids.length;
      boid.direction.mix(boid.meanPosition, 0.00004).normalize();
    }

    // Attract TODO
    /*if(boid.nearbyBoids.length > 0) {
      boid.meanDirection = boid.nearbyBoids.reduce( function(meanDirection, thisBoid) {
        return { x: meanDirection.x - thisBoid.direction.x, y: meanDirection.y - thisBoid.direction.y }
      }, {x: 0, y: 0});
      boid.meanDirection.x = boid.meanDirection.x / boid.nearbyBoids.length;
      boid.meanDirection.y = boid.meanDirection.y / boid.nearbyBoids.length;
      boid.direction.mix(boid.meanDirection, 0.2).normalize();
    }*/

  });
  // We move along
  boids.forEach((boid) => {
    const speedChangeVector = new Victor(boid.direction.x * (boid.speed / boid.direction.length()), boid.direction.y * (boid.speed / boid.direction.length()));
    /*if(maxConsoleLogs > 0 && boid.id === 0) {
      console.log("speed is now: ", boid.speed.length());
      console.log("direction is now: ", boid.direction.length());
      maxConsoleLogs--;
    }*/
    boid.position.add(boid.direction.clone().add(speedChangeVector));
  });
}


function drawBoid(boid) {
    if(boid.id === 0) {
      context.beginPath();
      context.arc(boid.position.x, boid.position.y, sightRange, -1 * (viewAngle) + boid.direction.direction(),(viewAngle) + boid.direction.direction());
      context.lineTo(boid.position.x, boid.position.y);
      context.closePath();
      context.fillStyle = 'hsl(' + (180 + (40 * Math.random())) + ', 0%, 30%)';
      context.fill();

      boid.nearbyBoids.forEach((otherBoid) => {
        context.beginPath();
        context.moveTo(boid.position.x, boid.position.y);
        context.lineTo(otherBoid.position.x, otherBoid.position.y);
        context.strokeStyle = '#FF0000';
        context.lineWidth = 1;
        context.stroke();
        context.closePath();
      })
    }

    context.save();
    context.translate(boid.position.x, boid.position.y);
    context.rotate(boid.direction.direction());
    context.beginPath();
    context.moveTo(-6,0);
    context.lineTo(-8,-4);
    context.lineTo(8,0);
    context.lineTo(-8,4);
    context.closePath();
    context.fillStyle = boid.color;
    context.fill();
		context.restore();
}

function draw() {
  clearCanvas();
  boids.forEach((boid) => {
    drawBoid(boid);
  })
}

function mainLoop() {
    update();
    draw();
    requestAnimationFrame(mainLoop);
}

// Start things off
requestAnimationFrame(mainLoop);

function isWithinSomeArc(boid, otherBoid, radius, arc, direction) {
  let S = -1 * (arc) + direction;
  if (S < 0) {
    S += 2*Math.PI;
  } else if (S > 2*Math.PI) {
    S -= 2*Math.PI;
  }
  let E = arc + direction;
  if (E < 0) {
    E += 2*Math.PI;
  } else if (E > 2*Math.PI) {
    E -= 2*Math.PI;
  }
  const X = otherBoid.x;
  const Y = otherBoid.y;
  const CenterX = boid.x;
  const CenterY = boid.y;
  let A = Math.atan2(Y - CenterY, X - CenterX);
  if (A < 0) {
    A += 2*Math.PI;
  } else if (A > 2*Math.PI) {
    A -= 2*Math.PI;
  }
  const R = Math.sqrt((X - CenterX) * (X - CenterX) + (Y - CenterY) * (Y - CenterY));

  if(R < radius) {
    if (S < E && (S < A && A < E)) {
      return true;
    } else if (S > E) {
       if (A > S && A > E) {
         return true;
       } else if (A < S && A < E) {
         return true
       }
    }
  } else return false;
}
