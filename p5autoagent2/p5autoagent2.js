let car;

function setup() {
  createCanvas(800,600);
  car = new Vehicle(createVector(width/2, height/2));
}


function draw() {
  background(245);

  car.wander();
  car.update();
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
    this.p = p5.Vector.random2D();
  }

  display() {
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    rectMode(CENTER);
    //carrot on stick
    noFill();
    stroke(0, 0, 255);
    line(0, 0, 200, 0);
    stroke(255, 0, 0);
    line(0,0,this.newTarget.copy().limit(30).x,this.newTarget.copy().limit(30).y);
    stroke(0, 255, 0);
    line(this.newTarget.copy().limit(30).x,this.newTarget.copy().limit(30).y,200,0);
    stroke(0);
    ellipseMode(CENTER);
    ellipse(200, 0, 60, 60);
    ellipseMode(CORNER);
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
    if (this.location.x > width) this.location.x = 0;
    if (this.location.x < 0) this.location.x = width;
    if (this.location.y > height) this.location.y = 0;
    if (this.location.y < 0) this.location.y = height;
  }

  applyForce(f) {
    this.acceleration.set(p5.Vector.add(this.acceleration,f.copy().div(this.mass)));
  }

  seek(target) {
    let desiredVelocity = p5.Vector.sub(target,this.location);
    desiredVelocity.limit(this.maxSpeed);
    let steer = p5.Vector.sub(desiredVelocity,this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

 wander() {
    let z=500, r=10;
    this.oldTarget = p5.Vector.add(this.location ,this.velocity.copy().setMag(z));  
    this.p.rotate(0.1*randomGaussian()).setMag(r);
    this.newTarget = p5.Vector.add(this.oldTarget,this.p);
    this.seek(this.newTarget);
  }

  update() {
    this.move();
    this.display();
    this.siren = sin(frameCount * this.velocity.mag() / 10.0);
  }
}
