let beachballs = [];
let pl;
function setup() {
  createCanvas(800, 600, WEBGL);
  pl = new ocean(width/2, height/2, -100, 500, 200, 500);
  noStroke();
}
function draw() {
  background(255);
  camera(100, -400.0+mouseY, 420.0, pl.x, pl.y, pl.z, 0.0, 1.0, 0.0);
  arrows(createVector(pl.x, pl.y, pl.z));
  lights();
  fill(0);
  pl.update();
  if (mouseIsPressed&&beachballs.length<15&&frameCount%30==0) {
    beachballs.push(new beachBall(createVector(pl.x+mouseX-250, pl.y-pl.h, pl.z+mouseY-250)));
  }
  //begin cursor
  push();
  if ((pl.x+mouseX)>pl.x&&(pl.x+mouseX)<pl.x+500&&(pl.z+mouseY)>pl.z&&(pl.z+mouseY)<pl.z+500)fill(0, 255, 0);
  else fill(255, 0, 0);
  translate(pl.x+mouseX-250, pl.y-pl.h, pl.z+mouseY-250);
  box(40);
  noFill();
  stroke(0);
  box(40, pl.y, 40);
  noStroke();
  pop();
  stroke(0, 0, 255);
  line(pl.x+mouseX-250, pl.y-pl.h, pl.z+mouseY-250, pl.x, pl.y-pl.h, pl.z);
  stroke(0, 255, 0);
  line(pl.x+mouseX-250, pl.y-pl.h, pl.z+mouseY-250, pl.x, pl.y, pl.z);
  noStroke();
  //end cursor
  let gravity = createVector(0, 0.1, 0);
  for (var b in beachballs) {
    if (beachballs.length>1)beachballs[b].scan();
    if (beachballs[b].watercollision(pl)) {
      let drag=beachballs[b].velocity.copy().normalize().rotate(radians(180));
      drag.mult(0.00005*pl.l*(beachballs[b].density*beachballs[b].density)*beachballs[b].velocity.mag()*beachballs[b].velocity.mag());
      beachballs[b].applyForce(drag);
    } else {
      gravity.copy().mult(beachballs[b].mass);
      beachballs[b].applyForce(gravity);
    }
    beachballs[b].update();
  }
}
class beachBall {
  constructor(start) {
    this.cl=color(random(0, 255), random(0, 255), random(0, 255));
    this.location=start.copy();
    this.velocity=createVector(0, 0, 0);
    this.acceleration=createVector(0, 0, 0);
    this.density=random(10, 15);
    this.mass=this.density/2;
    this.radius=20;
  }
  update() {
    push();
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
    fill(0, 255, 0);
    translate(this.location.x, this.location.y, this.location.z);
    sphere(2*this.radius);
    pop();
  }
  watercollision(p) {
    let x = this.location.x;
    let y = this.location.y;
    let z = this.location.z;
    if (x>p.x-p.l && x<p.x+p.l&&y>p.y-p.w && y<p.y+p.w&& z>p.z-p.h &&z<p.z+p.h)return true;
    return false;
  }
  scan() {
    for (var b in beachballs) {
      let distVect = p5.Vector.sub(beachballs[b].location, this.location);
      if (distVect.mag() < 2*this.radius) {
        let offset = distVect.copy().normalize().mult((2*this.radius-distVect.mag())/2.0);
        beachballs[b].location.add(offset);
        p5.Vector.sub(this.location, offset);
        let sinHead = sin(distVect.heading());
        let cosHead = cos(distVect.heading());
        let ov=beachballs[b].velocity;
        let PosTempOther=createVector(cosHead * distVect.x + sinHead * distVect.y, cosHead * distVect.y - sinHead * distVect.x);
        let VelTempThis = createVector(cosHead * this.velocity.x + sinHead * this.velocity.y, cosHead * this.velocity.y - sinHead * this.velocity.x); 
        let VelTempOther = createVector(cosHead * ov.x + sinHead * ov.y, cosHead * ov.y - sinHead * ov.x);
        let VecFinThis = createVector(((this.mass - beachballs[b].mass) * VelTempThis.x + 2 * beachballs[b].mass * VelTempOther.x) / (this.mass + beachballs[b].mass), VelTempThis.y);
        let VecFinOther = createVector(((beachballs[b].mass - this.mass) * VelTempOther.x + 2 * this.mass * VelTempThis.x) / (this.mass + beachballs[b].mass), VelTempOther.y);
        let posFinOther=createVector(cosHead * PosTempOther.x+VecFinOther.x - sinHead * PosTempOther.y, cosHead * PosTempOther.y + sinHead * PosTempOther.x+VecFinOther.x);
        beachballs[b].location.add(posFinOther.x, posFinOther.y);
        this.location.add(cosHead * -1 * sinHead, cosHead * sinHead * VecFinThis.x);
        this.velocity.set(cosHead * VecFinThis.x - sinHead * VecFinThis.y, cosHead * VecFinThis.y + sinHead * VecFinThis.x);
        ov.set(cosHead * VecFinOther.x - sinHead * VecFinOther.y, cosHead * VecFinOther.y + sinHead * VecFinOther.x);
      }
    }
  }
  applyForce(force) {
    this.acceleration.add(force.copy().div(this.mass));
  }
}
class ocean {
  constructor(_x, _y, _z, _l, _w, _h) {
    this.x=_x;
    this.y=_y;
    this.z=_z;
    this.l=_l;
    this.w=_w;
    this.h=_h;
  }
  update() {
    push();
    noFill();
    stroke(0);
    translate(this.x, this.y-100, this.z);
    box(this.l, this.w, this.h);
    noStroke();
    pop();
  }
}
function arrows(origin) {
  background(255);
  push();
  translate(origin.x, origin.y);
  stroke(255, 0, 0);
  line(-origin.x, 0, origin.x, 0);
  stroke(0, 255, 0);
  line(0, origin.y, 0, -origin.y);
  stroke(0, 0, 255);
  line(0, 0, origin.z, 0, 0, -origin.z);
  pop();
  noStroke();
}
