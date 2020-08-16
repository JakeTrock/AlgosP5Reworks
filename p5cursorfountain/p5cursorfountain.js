let balls = [];
let water;

let gravity;
function setup() {
  createCanvas(800, 600);
  water={
  "x":  
  0, 
  "y":  
  0.7*height, 
  "w":  
  width, 
  "h":  
  0.3*height
};
gravity= createVector(0, 0.2);
}
function draw() {
  background(245);
  fill(0, 0, 255, 150);
  rectMode(CORNER);
  noStroke();
  rect(water.x, water.y, water.w, water.h);
  if (frameCount % 12 == 0) {
    let start = createVector(mouseX, mouseY);
    let vel = createVector(randomGaussian(), -(2+abs(2*randomGaussian())));
    balls.push(new Ball(start, vel));
    if (balls.length>30)balls=balls.slice(1);
  }
  for (var b in balls) {
    balls[b].applyForce(gravity.copy().mult(balls[b].mass));
    if (balls[b].inside(water)) {
      let drag=balls[b].velocity.copy().normalize().rotate(radians(180));
      drag.mult(0.05*water.l*(balls[b].d*balls[b].d)*balls[b].velocity.mag()*balls[b].velocity.mag());
      balls[b].applyForce(drag);
    }
    balls[b].update();
  }
}
class Ball {
  constructor(start, velocity) {
    this.c=color(random(0, 255), random(0, 255), random(0, 255));
    this.location=start.copy();
    this.velocity=velocity.copy();
    this.acceleration=createVector(0, 0);
    this.d=random(5, 15);
    this.mass=this.d/2;
  }
  applyForce(force) {
    this.acceleration.set(p5.Vector.add(this.acceleration, force.copy().div(this.mass)));
  }
  move() {
    this.velocity.set(p5.Vector.add(this.velocity, this.acceleration));
    this.location.set(p5.Vector.add(this.location, this.velocity));
    this.acceleration.mult(0);
  }
  checkedges() {
    if (this.location.x<0)this.location.x=width;
    if (this.location.y>height) {
      this.location.y=height;
      this.velocity.y=-0.5*this.velocity.y;
    }
  }
  display() {
    fill(this.c);
    ellipse(this.location.x, this.location.y, this.d, this.d);
  }
  inside(l) {
    let x = location.x;
    let y = location.y;
    if (x>l.x && x<l.w+l.w && y>l.y && y<l.y+l.h)return true;
    return false;
  }
  update() {
    this.move();
    this.display();
    this.checkedges();
  }
}
