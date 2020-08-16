let ff;//make lists of flow fields and vehicles
let vehicles = [];

let sx, sy, sz;
function setup() {
  //sx=int(random(100, 400));//create random playfield
  //sy=int(random(100, 400));
  //sz=int(random(100, 400));
  sx=sy=sz=400;
  createCanvas(800, 600, WEBGL);
  ff = new FlowField(15);
  for (let i=0; i<((sx+sy+sz)/30); i++) {
    vehicles.push(new Vehicle(createVector(int(random(0, sx)), int(random(0, sy)), int(random(0, sz)))));//make vehicles based on size
  }
}

function draw() {
  background(245);
  camera(100+mouseX, -400.0+mouseY, 420.0, 0, 0, 0, 0.0, 1.0, 0.0);

  if (frameCount % 10 == 0) ff.setFlow();//setflow every now and then
  ff.display();//display flowfield if possible

  for (var v in vehicles) {
    vehicles[v].follow(ff);//update all vehicle positions and representations
    vehicles[v].update();
  }
}

function keyPressed() {
  ff.showFlow =!ff.showFlow;//toggle flowfield
}

class FlowField {

  constructor(r) {
    this.resolution = r;
    this.numrows = int(sy/this.resolution);
    this.numcols = int(sx/this.resolution);//set cols and rows to w,h,d values
    this.numdepth = int(sz/this.resolution);
    this.flow = new Array(this.numrows);//predefine flowfield size(it won't change)
    for (let i=0; i<this.numrows; i++)this.flow[i]=new Array(this.numcols);
    for (let i=0; i<this.numrows; i++)for (let v=0; v<this.numcols; v++)this.flow[i][v]=new Array(this.numdepth);
    for (let i=0; i<this.numrows; i++)for (let v=0; v<this.numcols; v++)for (let b=0; b<this.numrows; b++)this.flow[i][v][b]=createVector(0,0,0);
    this.showFlow = true;//field starts as visible, can be toggled
  }

  setFlow() {
    for (let dep = 0; dep < this.numdepth; dep++) {
      for (let row = 0; row < this.numrows; row++) {//loop through the flow field's x, y, and z
        for (let col = 0; col < this.numcols; col++) {
          let phi = map(noise(row/10. + frameCount/150., col/10. + frameCount/160.), 0, 1, 0, PI);//generate 2 noise sources
          let theta = map(noise(row/10. + frameCount/150., col/10. + frameCount/160.), 0, 1, 0, 2*PI);
          this.flow[row][col][dep].set(cos(phi), cos(theta)*sin(phi), sin(theta)*sin(phi));//generate 3d angle from noise
          //if(this.flow[row][col][dep]==undefined)console.log(cos(phi)+" , "+cos(theta)*sin(phi)+" , "+sin(theta)*sin(phi));
        }
      }
    }
  }


  display() {
    noFill();
    push();
    translate((this.numrows/2)*this.resolution, (this.numcols/2)*this.resolution, (this.numdepth/2)*this.resolution);//create bounding box to serve as a vantage point much like a 2d canvas
    //box(numcols*resolution,numrows*resolution,numdepth*resolution);
    pop();
    if (!this.showFlow)return;//skips if user disables arrows
    stroke(200);
    for (let dep = 0; dep < this.numdepth; dep++) {
      for (let row = 0; row < this.numrows; row++) {//loops thru flowfield and shows its properties with arrows
        for (let col = 0; col < this.numcols; col++) {
          let p = this.flow[row][col][dep];
          //console.log(p.x);//undefined?
          push();
          translate(this.col*this.resolution, this.row*this.resolution, this.dep*this.resolution);
          rotateX(p.x);
          rotateY(p.y);//move and rotate to the values set in the flow array
          rotateZ(p.z);
          line(-0.3*this.resolution, 0, 0.3*this.resolution, 0);
          line(0.3*this.resolution, 0, 0.1*this.resolution, 0.2*this.resolution);//makes a little arrow
          line(0.3*this.resolution, 0, 0.1*this.resolution, -0.2*this.resolution);
          pop();
        }
      }
    }
  }

  lookup(position) {
    let col = int(constrain(position.x/this.resolution, 0, this.numcols-1));
    let row = int(constrain(position.y/this.resolution, 0, this.numrows-1));
    let dep = int(constrain(position.z/this.resolution, 0, this.numdepth-1));//allows vehicle class to lookup cel in flow array and set its rotation to that cel's value
    if(this.flow[row][col][dep]==undefined)console.log(row+" , "+col+" , "+dep+" , "+this.flow[row][col][dep]);
    return this.flow[row][col][dep];
  }
}





class Vehicle {
  constructor(start) {
    this.location = start.copy();//start where position is designated
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass = 1;
    this.maxSpeed = 5;
    this.maxForce = .08;
  }

  display() {
    let s = this.mass * 15;
    push();
    translate(this.location.x, this.location.y, this.location.z);
    rotateX(this.velocity.x);
    rotateY(this.velocity.y);
    rotateZ(this.velocity.z);    //move and render a triangle to follow flow fields
    fill(0);
    stroke(0);
    triangle(this.s/2, 0, -this.s/2, this.s*0.2, -this.s/2, -this.s*0.2);
    pop();
  }

  move() {
    this.velocity.set(p5.Vector.add(this.velocity, this.acceleration));
    this.location.set(p5.Vector.add(this.location, this.velocity));//apply forces
    this.acceleration.mult(0);
    if (this.location.x > sx) this.location.x = 0;
    if (this.location.x < 0) this.location.x = this.sx;//stay within bounding box
    if (this.location.y > sy) this.location.y = 0;
    if (this.location.y < 0) this.location.y = this.sy;
    if (this.location.z > sz) this.location.z = 0;
    if (this.location.z < 0) this.location.z = this.sz;
  }

  applyForce(f) {
    this.acceleration.add(f.copy().div(this.mass));//apply acceleration based on mass
  }


  update() {
    this.move();
    this.display();
  }

  follow(f) {
    let desiredVelocity = f.lookup(this.location);
    if(desiredVelocity==undefined)console.log(f.lookup(this.location));
    desiredVelocity.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desiredVelocity, this.velocity);//follow flow field by looking up direction at location and conforming to that given direction
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }
}
