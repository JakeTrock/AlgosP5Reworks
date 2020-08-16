let car;
let target;

function setup() {
  createCanvas(800, 600);
  car = new Vehicle(createVector(width/2, height/2));
  target = new Target();
}


function draw() {
  background(245);

  target.update();
  car.seek(target.location);
  car.update();
  if (car.reached(target)) {
    target.randomize();
  }
}


class Target {

  constructor() {
    this.randomize();
  }

  randomize() {
    this.location = createVector(random(0.1*width, 0.9*width), random(0.1*height, 0.9*height));
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector(0, 0);
  }


  move() {
    this.velocity.set(p5.Vector.add(this.velocity, this.acceleration));
    this.location.set(p5.Vector.add(this.location, this.velocity));
    this.acceleration.mult(0);
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.location.x, this.location.y, 10, 10);
  }

  update() {
    this.move();
    this.display();
  }
}

class Vehicle {
  constructor(start) {
    this.location = start.copy();
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 1;
    this.maxSpeed = 3;
    this.maxForce = 0.06; 
    this.w = 50;
    this.h = 25;
  }

  reached(t) {
    if (p5.Vector.sub(t.location, this.location).mag() < 5) { 
      return true;
    } else {
      return false;
    }
  }


  display() {
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    rectMode(CENTER);
    // tires
    fill(0);
    rect(-0.3*this.w, 0.5*this.h, this.w*0.3, this.h*0.2);
    rect( 0.3*this.w, 0.5*this.h, this.w*0.3, this.h*0.2);
    rect(-0.3*this.w, -0.5*this.h, this.w*0.3, this.h*0.2);
    rect( 0.3*this.w, -0.5*this.h, this.w*0.3, this.h*0.2);
    // car body
    fill(150);
    noStroke();
    rect(0, 0, this.w, this.h);
    stroke(0);
    // headlights
    rect(this.w/2, -0.2*this.h, this.w*0.03, this.h*0.2);
    rect(this.w/2, 0.2*this.h, this.w*0.03, this.h*0.2);
    // lights for headlights
    fill(255, 255, 0, 100);
    noStroke();
    triangle(this.w/2, -0.2*this.h, this.w/2+this.w, -0.7*this.h, this.w/2+this.w, 0.3*this.h);
    triangle(this.w/2, 0.2*this.h, this.w/2+this.w, -0.3*this.h, this.w/2+this.w, 0.7*this.h);
    // flashy light siren thingy
    fill(255, 0, 0, map(this.siren, -1, 1, 0, 255));
    ellipse(0, 0, this.w*0.07, this.w*0.07);
    pop();
  }

  move() {
    this.velocity.set(p5.Vector.add(this.velocity, this.acceleration));
    this.location.set(p5.Vector.add(this.location, this.velocity));
    this.acceleration.mult(0);
  }

  applyForce(f) {
    this.acceleration.set(p5.Vector.add(this.acceleration, p5.Vector.div(f, this.mass)));
  }

  seek(target) {
    let desiredVelocity = p5.Vector.sub(target, this.location);
    desiredVelocity.limit(this.maxSpeed);
    let steer = p5.Vector.sub(desiredVelocity, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  update() {
    this.move();
    this.display();
    this.siren = sin(frameCount * this.velocity.mag() / 10.0);
  }
}
