class Boid {
  constructor() {
    this.position = new Victor(0,0).randomize(new Victor(0, canvas.height), new Victor(canvas.width, 0));
    this.velocity = new Victor(0,0).randomize(new Victor(-1*canvas.width, canvas.height), new Victor(canvas.width, -1*canvas.height));
    this.acceleration = new Victor(0,0);
    this.color = 'hsl(' + (180 + (40 * Math.random())) + ', 50%, 50%)';
    this.maxSeparationForce = .2;
    this.maxCohesionForce = .2;
    this.maxAlignmentForce = .2;
    this.maxSpeed = 4;
  }

  flock(flock) {
    let alignment = this.align(flock);
    let cohesion = this.cohesion(flock);
    let separation = this.separation(flock);
    this.acceleration.add(separation)
    //this.acceleration.add(alignment)
    //this.acceleration.add(cohesion)
  }

  separation(flock) {
    const perception = 100;
    let steeringForce = new Victor(0,0);
    let numberOfNearbyBoids = 0;
    for (let otherBoid of flock) {
      const distance = this.position.distance(otherBoid.position);
      if (otherBoid != this && distance < perception) {
        let diff = new Victor(this.position.x,this.position.y).subtract(otherBoid.position);
        if(distance > 0) {
          diff.div(distance * distance);
          steeringForce.add(diff);
          numberOfNearbyBoids++;
        }
      }
    }
    if(numberOfNearbyBoids > 0) {
      steeringForce.div(numberOfNearbyBoids);
      steeringForce.setMagnitude(this.maxSpeed);
      steeringForce.subtract(this.velocity);
      steeringForce.limitMagnitude(this.maxSeparationForce);
    }
    return steeringForce;
  }

  cohesion(flock) {
    const perception = 100;
    let steeringForce = new Victor(0,0);
    let numberOfNearbyBoids = 0;
    for (let otherBoid of flock) {
      if (otherBoid != this && this.position.distance(otherBoid.position) < perception) {
        numberOfNearbyBoids++
        steeringForce.add(otherBoid.position);
      }
    }
    if(numberOfNearbyBoids > 0) {
      steeringForce.div(numberOfNearbyBoids);
      steeringForce.subtract(this.position);
      steeringForce.setMagnitude(this.maxSpeed);
      steeringForce.subtract(this.velocity);
      steeringForce.limitMagnitude(this.maxCohesionForce);
    }
    return steeringForce;
  }

  align(flock) {
    const perception = 50;
    let steeringForce = new Victor(0,0);
    let numberOfNearbyBoids = 0;
    for (let otherBoid of flock) {
      if (otherBoid != this && this.position.distance(otherBoid.position) < perception) {
        numberOfNearbyBoids++
        steeringForce.add(otherBoid.velocity);
      }
    }
    if(numberOfNearbyBoids > 0) {
      steeringForce.div(numberOfNearbyBoids);
      steeringForce.setMagnitude(this.maxSpeed);
      steeringForce.subtract(this.velocity);
      steeringForce.limitMagnitude(this.maxAlignmentForce);
    }
    return steeringForce;
  }

  draw() {
      /*if(boid.id === 0) {
        context.beginPath();
        context.arc(this.position.x, this.position.y, sightRange, -1 * (viewAngle) + this.velocity.direction(),(viewAngle) + this.velocity.direction());
        context.lineTo(this.position.x, this.position.y);
        context.closePath();
        context.fillStyle = 'hsl(' + (180 + (40 * Math.random())) + ', 0%, 30%)';
        context.fill();

        boid.nearbyBoids.forEach((otherBoid) => {
          context.beginPath();
          context.moveTo(this.position.x, this.position.y);
          context.lineTo(otherBoid.position.x, otherBoid.position.y);
          context.strokeStyle = '#FF0000';
          context.lineWidth = 1;
          context.stroke();
          context.closePath();
        })
      }*/

      context.save();
      context.translate(this.position.x, this.position.y);
      context.rotate(this.velocity.direction());
      context.beginPath();
      context.moveTo(-12,0);
      context.lineTo(-16,-8);
      context.lineTo(16,0);
      context.lineTo(-16,8);
      context.closePath();
      context.fillStyle = this.color;
      context.fill();
  		context.restore();
  }

  edges() {
    // Wrap around if necessary
    if (this.position.x < 0) {
      this.position.addX(new Victor(canvas.width,0));
    } else if (this.position.x > canvas.width) {
      this.position.subtractX(new Victor(canvas.width,0));
    } else if (this.position.y < 0) {
      this.position.addY(new Victor(0, canvas.height));
    } else if (this.position.y > canvas.height) {
      this.position.subtractY(new Victor(0, canvas.height));
    }
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limitMagnitude(this.maxSpeed);
    this.acceleration.multiply(new Victor(0,0));
  }
};

/*
const canvas = document.getElementById("boids");
const context = canvas.getContext("2d");

const numberOfBoids = 100;
const boids = [];
const sightRange = 200;
const viewAngle = Math.PI * 2/3;

context.fillStyle = "#FF0000";

function randomRange(min, max) {
  return (Math.random() * (max - min)) + min;
};

const topLeft = new Victor(0, canvas.height);
const bottomRight = new Victor(canvas.width, 0);

const createBoid = (id) => {
  return {
    id: id,
    position: new Victor(canvas.width/2,canvas.height/2),
    velocity: new Victor(0,0).randomize(new Victor(-1*canvas.width, canvas.height), new Victor(canvas.width, -1*canvas.height)).normalize() ,
    acceleration: new Victor(0,0),
    steering: new Victor(0,0),
    maxForce: 1,
    maxSpeed: 4,
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
        boid.nearbyBoids.push({id: otherBoid.id, position: otherBoid.position, velocity: otherBoid.velocity});
      }
    });
    boid.nearbyBoids = boid.nearbyBoids.filter((otherBoid) => {
      if(otherBoid.id === boid.id) {
        // Stop being so self-centered. This is yourself!
        return false;
      }
      return isWithinSomeArc(boid.position, otherBoid.position, sightRange, viewAngle, boid.velocity.angle());
    });

    // Avoid TODO
    if(boid.nearbyBoids.length > 0) {
    }

    // Align TODO
    if(boid.nearbyBoids.length > 0) {
      const desiredVelocity = new Victor(0,0);
      boid.nearbyBoids.forEach((otherBoid) => {
        desiredVelocity.add(otherBoid.velocity);
      })
      desiredVelocity.x = desiredVelocity.x / boid.nearbyBoids.length;
      desiredVelocity.y = desiredVelocity.y / boid.nearbyBoids.length;
      desiredVelocity.multiply(boid.maxSpeed / desiredVelocity.length());
      boid.steering = desiredVelocity.subtract(boid.velocity).limit(boid.maxForce, 0.01);
    }

    // Attract TODO
    if(boid.nearbyBoids.length > 0) {

    }

  });
  // We move along
  boids.forEach((boid) => {
    boid.position.add(boid.velocity).add(boid.steering);
  });
}


function drawBoid(boid) {
    if(boid.id === 0) {
      context.beginPath();
      context.arc(boid.position.x, boid.position.y, sightRange, -1 * (viewAngle) + boid.velocity.clone().add(boid.steering).direction(),(viewAngle) + boid.velocity.direction());
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
    context.rotate(boid.velocity.direction());
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

function isWithinSomeArc(boid, otherBoid, radius, arc, velocity) {
  let S = -1 * (arc) + velocity;
  if (S < 0) {
    S += 2*Math.PI;
  } else if (S > 2*Math.PI) {
    S -= 2*Math.PI;
  }
  let E = arc + velocity;
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
*/
