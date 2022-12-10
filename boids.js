const separationPerception = 50;
const alignmentPercetion = 100;
const cohesionPerception = 100;

class Boid {
  constructor() {
    this.position = new Victor(0,0).randomize(new Victor(0, canvas.height), new Victor(canvas.width, 0));
    this.velocity = new Victor(0,0).randomize(new Victor(-1*canvas.width, canvas.height), new Victor(canvas.width, -1*canvas.height));
    this.acceleration = new Victor(0,0);
    this.color = 'hsl(' + (180 + (40 * Math.random())) + ', 50%, 50%)';
    this.maxSeparationForce = .2;
    this.maxCohesionForce = .2;
    this.maxAlignmentForce = .2;
    this.maxSpeed = 2.0;
  }

  flock(flock) {
    let alignment = this.align(flock);
    let cohesion = this.cohesion(flock);
    let separation = this.separation(flock);
    this.acceleration.add(separation)
    this.acceleration.add(alignment)
    this.acceleration.add(cohesion)
  }

  separation(flock) {
    let steeringForce = new Victor(0,0);
    let numberOfNearbyBoids = 0;
    for (let otherBoid of flock) {
      const distance = this.position.distance(otherBoid.position);
      if (otherBoid != this && distance < separationPerception) {
        let diff = new Victor(this.position.x,this.position.y).subtract(otherBoid.position);
        if (distance > 0) {
          // diff.div(distance * distance);
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
    let steeringForce = new Victor(0,0);
    let numberOfNearbyBoids = 0;
    for (let otherBoid of flock) {
      if (otherBoid != this && this.position.distance(otherBoid.position) < cohesionPerception) {
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
    let steeringForce = new Victor(0,0);
    let numberOfNearbyBoids = 0;
    for (let otherBoid of flock) {
      if (otherBoid != this && this.position.distance(otherBoid.position) < alignmentPercetion) {
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