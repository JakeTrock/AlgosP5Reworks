let gbl;

function setup() {
  createCanvas(800,600);
  gbl = new Vehicle(createVector(width/2, height/2));
  background(245);
  text("Click to clear",10,10)
}


function draw() {
  if(mouseIsPressed)background(245);
  gbl.seek(createVector(mouseX,mouseY));
  gbl.display();
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

  display() {
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    rectMode(CENTER);
    // car body
    fill(150);
    noStroke();
    rect(0, 0, this.w, this.h);
    stroke(0);
    pop();
  }

  seek(target) {
    let desiredVelocity = p5.Vector.sub(target, this.location);
    desiredVelocity.limit(this.maxSpeed);
    let steer = p5.Vector.sub(desiredVelocity, this.velocity);
    steer.limit(this.maxForce);
    this.acceleration.set(p5.Vector.add(this.acceleration,steer.copy().div(this.mass)));
    this.velocity.set(p5.Vector.add(this.velocity,this.acceleration));
    this.location.set(p5.Vector.add(this.location,this.velocity));
    this.acceleration.set(p5.Vector.mult(this.acceleration,0));
  }
}
