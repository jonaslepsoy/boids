const canvas = document.getElementById("boids");
const context = canvas.getContext("2d");

const numberOfBoids = 200;
const boids = [];
/* number of vertices for polygon */
const sides = 12;
const radius = 10;
const speed = 1.5;
const turnRate = Math.PI / 10
const sightRange = 100;
const separationDistance = 100;
const viewAngle = Math.PI * 2/3;

/* angle between vertices of polygon */
const boidAngle = ((Math.PI * 2) / sides);

context.fillStyle = "#FF0000";

const createBoid = (id) => {
  return {
    id: id,
    x: parseInt(Math.random() * canvas.width),
    y: parseInt(Math.random() * canvas.height),
    direction: Math.random() * 2 * Math.PI,
    speed: speed,
    color: 'hsl(' + (180 + (40 * Math.random())) + ', 50%, 50%)'
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

function update() {
  boids.forEach((boid) => {
    // Find all nearby Boids that each Boid can see and store them for later processing
    boid.nearbyBoids = boids.filter((thatBoid) => {
      if(thatBoid.id === boid.id) {
        // Stop being so self-centered. This is yourself!
        return false;
      }
      return isWithinSomeArc(boid, thatBoid, sightRange, viewAngle, boid.direction);
    });
    // Sort other boids by distance
    boid.nearbyBoids.map((thatBoid) => {
      thatBoid.distance = distance(boid, thatBoid);
    })
    /*.sort(function(a, b) {
      if (a.distance < b.distance) {
        return -1;
      }
      if (a.distance > b.distance) {
        return 1;
      }
      // distance must be equal
      return 0;
    });*/
  });
  boids.forEach((boid) => {

    // Wrap around if necessary
    if (boid.x < 0) {
      boid.x = canvas.width;
    } else if (boid.x > canvas.width) {
      boid.x = 0;
    } else if (boid.y < 0) {
      boid.y = canvas.height;
    } else if (boid.y > canvas.height) {
      boid.y = 0;
    }


    if(boid.nearbyBoids.length > 0) {
      // Normalize direction according to nearby boids
      let x = 0, y = 0;
      boid.nearbyBoids.forEach((otherBoid) => {
        x += otherBoid.speed * Math.cos(otherBoid.direction);
        y += otherBoid.speed * Math.sin(otherBoid.direction);
      });
      x = x / boid.nearbyBoids.length;
      y = y / boid.nearbyBoids.length;
      if (x > Math.cos(boid.direction)) {
        boid.direction += turnRate / 20;
      } else {
        boid.direction -= turnRate / 20;
      }
      if (y > Math.sin(boid.direction)) {
        boid.direction += turnRate / 20;
      } else {
        boid.direction -= turnRate / 20;
      }

      // Try to get to center of swarm
      let avgX = 0, avgY = 0;
      boid.nearbyBoids.forEach((otherBoid) => {
        avgX += otherBoid.x;
        avgY += otherBoid.y;
      });
      const avgBoidInSwarm = {
        x: avgX / boid.nearbyBoids.length,
        y: avgY / boid.nearbyBoids.length
      }
      if(boid.id === 0) {
        boid.avgBoidInSwarm = avgBoidInSwarm;
      }
      if(isWithinSomeArc(boid, avgBoidInSwarm, separationDistance, Math.PI + boid.direction, Math.PI * 3/2 + boid.direction)) {
        // It's to the left, turn slightly right
        boid.direction += turnRate / 20;
      } else {
        // It's to the right, turn slightly left
        boid.direction -= turnRate / 20;
      }

      // TODO: Avoid close boids
      avgX = 0, avgY = 0;
      boid.nearbyBoids.forEach((otherBoid) => {
        avgX += otherBoid.x;
        avgY += otherBoid.y;
      });
      const avgNearbyBoid = {
        x: avgX / boid.nearbyBoids.length,
        y: avgY / boid.nearbyBoids.length
      }

      if(boid.id === 0) {
        boid.avgNearbyBoid = avgNearbyBoid;
      }

      if(isWithinSomeArc(boid, avgNearbyBoid, separationDistance, Math.PI + boid.direction, Math.PI * 3/2 + boid.direction)) {
        // It's to the left, turn slightly right
        boid.direction -= turnRate / (boid.nearbyBoids[0].distance / 2);
      } else {
        // It's to the right, turn slightly left
        boid.direction += turnRate / (boid.nearbyBoids[0].distance / 2);
      }
    } else {
      // Go straight!
    }

    if (boid.direction > 2*Math.PI) {
      boid.direction = 0;
    } else if (boid.direction < 0) {
      boid.direction = 2*Math.PI;
    }

    // We move along
    boid.x = boid.x + (boid.speed * Math.cos(boid.direction));
    boid.y = boid.y + (boid.speed * Math.sin(boid.direction));
  });
}


function distance(boid1, boid2) {
  const a = boid1.x - boid2.x;
  const b = boid1.y - boid2.y;

  return Math.sqrt( a*a + b*b );
}

function drawBoid(boid) {
    if(boid.id === 0) {
      context.beginPath();
      context.arc(boid.x, boid.y, sightRange, -1 * (viewAngle) + boid.direction,(viewAngle) + boid.direction);
      context.lineTo(boid.x, boid.y);
      context.closePath();
      context.fillStyle = 'hsl(' + (180 + (40 * Math.random())) + ', 0%, 30%)';
      context.fill();
      boid.nearbyBoids.forEach((nearbyBoid) => {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = '#ff0000';
        context.moveTo(boid.x, boid.y);
        context.lineTo(nearbyBoid.x, nearbyBoid.y);
        context.stroke();
        context.closePath();
      })
      if(boid.avgBoidInSwarm) {
        console.log('boid.avgBoidInSwarm: ', boid.avgBoidInSwarm)
        context.lineWidth = 2;
        context.fillStyle = '#00ff00';
        context.strokeStyle = '#00ff00';
        context.beginPath();
        context.moveTo(boid.x, boid.y);
        context.lineTo(boid.avgBoidInSwarm.x, boid.avgBoidInSwarm.y);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.arc(boid.avgBoidInSwarm.x, boid.avgBoidInSwarm.y, 10 , 0, Math.PI * 2);
        context.fill();
        context.closePath();
      }
      if(boid.avgNearbyBoid) {
        context.lineWidth = 2;
        context.fillStyle = '#0000ff';
        context.strokeStyle = '#0000ff';
        context.beginPath();
        context.moveTo(boid.x, boid.y);
        context.lineTo(boid.avgNearbyBoid.x, boid.avgNearbyBoid.y);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.arc(boid.avgNearbyBoid.x, boid.avgNearbyBoid.y, 10 , 0, Math.PI * 2);
        context.fill();
        context.closePath();
      }
    }

    context.beginPath();
    for (var i = 0; i < sides; i++) {
      // Funky way to draw a triangle?
      if(i===0 || i===5 || i===7) {
        context.lineTo(boid.x + radius * Math.cos(boidAngle*i+boid.direction), boid.y + radius * Math.sin(boidAngle*i+boid.direction));
      }
    }
    context.closePath();
    context.fillStyle = boid.color;
    context.fill();
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
