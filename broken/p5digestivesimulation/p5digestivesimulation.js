let ff, ds, ns, cs, xOff=0, command=0;
let nfcX=[], nfcY=[], cells = [], nuggets=[], drips=[];

function setup() {
  createCanvas(800, 600);
  ff = new FlowField(15);
}
function draw() {
  background(203, 55, 55);
  backgroundScroll();
  fill(255);
  rect(0, 0, width/5, height/8);
  fill(0);
  text("Press the A key to switch to healthy food, s key for unhealthy food and d key for water, then click to deposit the food. Healthy food boosts the nutrient level of the cells the most, and if a cell is still light blue and healthy, it can even reproduce. Unhealthy food has some nutrients, but not much, if cells are undernurtered, they fade and die. Water kills the red malignant cells on contact, however they will come back. Stop them from destroying the digestor cells!", 0, 0, width/5, height/8);
  if (mouseIsPressed) {
    if (command == 2) drips.push(new Water(0, mouseY));
    if (command == 0) nuggets.push(new healthyFood(0, mouseY));
    if (command == 1) nuggets.push(new unhealthyFood(0, mouseY));
  }
  ds=drips.length;
  for (let i=0; i<ds; i++) {
    if (i>=1&&drips.length>1&&drips[i-1].markedForDestruction) {
      drips.remove(i-1);
      ds--;
      i=0;
    }
    drips[i].update();
  }
  ns=nuggets.length;
  for (let i=0; i<ns; i++) {
    if (i>=1&&nuggets.length>1&&nuggets[i-1].markedForDestruction) {
      nuggets.remove(i-1);
      ns--;
      i=0;
    }
    nuggets[i].update();
  }
  cs=cells.length;
  for (let i=0; i<cells.length; i++) {//implement cell death
    if (i>=1&&cells.length>1&&cells[i-1].markedForDestruction) {
      cells.remove(i-1);
      cs--;
      i=0;
    }
    if (cells[i].nice) {//mean cells don't play by the rules
      for (var n in nuggets) {
        cells[i].follow(n.f);
        cells[i].colliding(n);//food collision
      }
      cells[i].update();
    } else {
      cells[i].display();
      for (var w in drips) {
        cells[i].collidingW(w);
      }
    }
    cells[i].afunction(cells);//both types still use this, but in different ways
  }
  if (nfcX.length>0&&nfcY.length>0) {
    for (let i=nfcY.length-1; i>0; i--) {
      cells.push(new cell(createVector(nfcX[i]+randomGaussian(), nfcY[i]+randomGaussian())));//new cell next to old parent
      nfcY=shorten(nfcY);
      nfcX=shorten(nfcX);//remove stored position
    }
  }
  let mca=0;
  for (var r in cells)if (!r.nice)mca++;
  if (cells.length>10&&mca<10)cells.push(new meancell(createVector(random(0, width), random(0, height))));//spawn malignant cells
  if (frameCount % 2 == 0)if (randomGaussian()>0)cells.push(new cell(createVector(random(0, width), -10))); 
  else cells.push(new cell(createVector(random(0, width), height+10)));//spawn digestor cells on edge
}
function keyPressed() {
  if (key=='a'||key=='A') {
    command = 0;
  } else if (key=='s'||key=='S') {
    command = 1;
  } else if (key=='d'||key=='D') {
    command = 2;
  }
}
function backgroundScroll() {
  fill(242, 132, 185);
  for (let i=0; i<12; i++) {
    beginShape();
    vertex(i*width/6+xOff, 0);
    vertex(width/12+i*width/6+xOff, 0);
    vertex(width/7.5+i*width/6+xOff, height/2);
    vertex(width/12+i*width/6+xOff, height);
    vertex(i*width/6+xOff, height);
    vertex(width/9+i*width/6+xOff, height/2);
    endShape(CLOSE);
  }
  xOff-=10;
  if (xOff<-1*width)xOff=0;
}
class FlowField {
  constructor(r) {
    this.resolution = r;
    this.numrows = height/this.resolution;
    this.numcols = width/this.resolution;
    this.flow = [this.numrows][this.numcols];
    this.showFlow=false;
  }
  lookup(position) {
    let col = int(constrain(position.x/this.resolution, 0, this.numcols-1));
    let row = int(constrain(position.y/this.resolution, 0, this.numrows-1));
    return flow[row][col];
  }
}


class Food {
  constructor(_x, _y) {
    this.markedForDestruction=false;
    this.mf=1;
    this.location = createVector(_x, _y);
    this.diameter=int(random(30, 70));
    this.f = new FlowField(this.diameter);
  }
  update() {
  }
  setFlow(magFactor) {
    for (let row = 0; row < this.f.numrows; row++) {
      for (let col = 0; col < this.f.numcols; col++) {
        let rowx = row*this.diameter;
        let coly = col*this.diameter;
        this.f.flow[row][col] = 
        p5.Vector.sub(createVector(coly, rowx),this.location)
        .setMag(1*magFactor)
        .mult(-1);
      }
    }
  }
}
class unhealthyFood extends Food {//some attraction
  constructor(_x, _y) {
    super(_x, _y);
    this.diameter=int(random(30, 65));//change later
    this.mf=0.5;
    this.nv=int(random(0, 5));
  }
  update() {
    super.setFlow(1);//quick fix to make it have the same attraction as healthy foods
    noStroke();
    fill(255, 0, 0);
    ellipse(this.location.x, this.location.y, this.diameter, this.diameter);
    this.location.push((70-this.diameter)/4, randomGaussian()/3);
    if (this.location.x>width)this.location.set(0, this.location.y);
    if (this.diameter<this.nv)this.markedForDestruction=true;
  }
}
class healthyFood extends Food {//most attraction
  constructor(_x, _y) {
    super(_x, _y);
    this.diameter=int(random(30, 65));//change later
    this.mf=1;
    this.nv=int(random(0, 10));
  }
  update() {
    super.setFlow(this.mf);
    noStroke();
    fill(0, 255, 0);
    ellipse(this.location.x, this.location.y, this.diameter, this.diameter);
    this.location.push((70-this.diameter)/4, randomGaussian()/3);
    if (this.location.x>width)this.location.set(0, this.location.y);
    if (this.diameter<this.nv)this.markedForDestruction=true;
  }
}

class Water {//no attraction, also I had to remove this class's extension of food, it shared no properties other than those that were visual. 
  constructor(_x, _y) {
    this.location=createVector(_x, _y);
    this.diameter=int(random(30, 65));
    this.markedForDestruction=false;
  }
  update() {
    noStroke();
    fill(0, 0, 255);
    ellipse(this.location.x, this.location.y, this.diameter, this.diameter);
    this.location.push((70-this.diameter)/4, 0);
    if (this.location.x>width)this.location.set(0, this.location.y);
    if (frameCount%20==0)this.diameter--;
    if (this.diameter<1)this.markedForDestruction=true;
  }
}

class cell {
  constructor(start) {
    this.nice=true;
    this.location = start.copy();
    this.velocity = createVector(0, -1);
    this.acceleration = createVector(0, 0);
    this.mass = 1;
    this.nutrients=this.mass*2;
    this.maxSpeed = 5;
    this.maxForce = 0.08;
    this.markedForDestruction=false;
    this.reproducing=false;
    this.canParent=true;
  }

  display() {
    let s = this.mass * 15;
    push();
    translate(this.location);
    rotate(this.velocity.heading());
    stroke(0, 135*this.nutrients, 135*this.nutrients);
    strokeWeight(10);
    line(s-3*this.mass, s-3*this.mass, s, s);
    strokeWeight(1);
    pop();
  }
  move() {
    this.velocity.set(p5.Vector.add(this.velocity, this.acceleration));
    this.location.set(p5.Vector.add(this.location, this.velocity));
    this.acceleration.mult(0);
  }

  applyForce(f) {
    this.acceleration.set(p5.Vector.add(this.acceleration, f.copy().div(this.mass)));
  }

  update() {
    if (!this.reproducing)this.move();
    else this.reproduce();
    this.display();
    if (this.location.x>width)this.location.set(0, this.location.y);
  }
  colliding(f) {
    if (this.location.copy().sub(this.f.location).mag()<this.f.diameter) {//extracts nutrients from food
      this.f.diameter-=f.nv*2;
      this.nutrients+=f.nv;
    }
    if (this.nutrients>10*this.mass&&this.canParent) {//second boolean to implement the one child policy
      this.reproducing = true;
    }
  }
  reproduce() {
    this.nfcX=append(this.nfcX, this.location.x);
    this.nfcY=append(this.nfcY, this.location.y);
    this.nutrients-=10*this.mass;
    this.canParent=this.reproducing = false;
  }
  afunction(afunction) {
    let total = createVector(0, 0);
    for (var v in afunction) {
      let d = p5.Vector.sub(this.location, v.location);
      if (d.mag() > 0 && d.mag() < 100) {
        let f = d.setMag(3*this.mass / d.mag());
        f.limit(this.maxForce);//afunctions friend cells
        total.add(f);
      }
    }
    this.applyForce(total);
  }
  follow(f) {
    if (this.nutrients>0) {
      let desiredVelocity = f.lookup(this.location);
      desiredVelocity.setMag(this.maxSpeed);
      let steer = PVector.sub(desiredVelocity, this.velocity);
      steer.limit(this.maxForce);
      this.applyForce(steer);
      if (frameCount % 10 == 0)this.nutrients-=this.mass/100;//like real cells, energy is only expended to a noticable degree when they correct course
    } else {
      this.markedForDestruction=true;
    }
  }
  collidingW(w) {
  }//placeholder class
} 
class meancell extends cell {//vampire cell, steals nutrients
  constructor(start) {
    super(start);
    this.nice=false;
    this.maxSpeed = 3;
    this.maxForce = 0.06;
  }
  afunction(afunction) {//override afunction to make it target victims instead
    if (this.prey==null) {
      for (var v in afunction) {
        if (v.getClass()==cell.class&&v.location.copy().sub(this.location.copy()).mag()<createVector(100, 100).mag())this.prey=v;//find closest
      }
    } else {
      if (this.prey.markedForDestruction==true) {
        this.prey=null;
        return;
      }
      let desiredVelocity = p5.Vector.sub(this.prey.location, this.location);
      desiredVelocity.limit(this.maxSpeed);
      let steer = p5.Vector.sub(desiredVelocity, this.velocity);
      steer.limit(this.maxForce);
      this.acceleration.push(steer.copy().div(this.mass));
      this.velocity.push(this.acceleration);
      this.location.push(this.velocity);
      this.acceleration.mult(0);
      if (this.caught(this.prey)) {
        this.nutrients+=this.prey.nutrients;//kills it and steals nutrients
        this.prey.markedForDestruction=true;
        this.prey=null;
      }
    }
  }
  caught(t) {
    let d = p5.Vector.sub(t.location, this.location).mag();
    if (d < 5) return true;
    return false;
  }
  collidingW(f) {
    if (this.location.copy().sub(f.location).mag()<f.diameter) {
      this.markedForDestruction=true;
    }
  }
  display() {
    let s = this.mass * 15;
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    stroke(255*this.nutrients, 0, 0);
    strokeWeight(10);
    line(s-3*this.mass, s-3*this.mass, s, s);
    strokeWeight(1);
    pop();
  }
}
