let g, d;
let pattern=[];
function setup() {
  d = pixelDensity();
  createCanvas(800, 600);
  pattern = new Array(width*height);
  for (let i = 0; i < height; i++) {
    pattern[(i*width)+width/2] = 1;
  }
  g = new Game(width, height);
  background(0);
  frameRate(120);

  let ruleset = [int(random(0, 1.4)), int(random(0, 1.4)), int(random(0, 1.4)), int(random(0, 1.4)), int(random(0, 1.4)), int(random(0, 1.4)), int(random(0, 1.4)), int(random(0, 1.4))];
  for (let generation=0; generation<height; generation++) {
    let newcells = new Array(width);
    for (let i = 1; i < width-1; i++) {
      let left = pattern[i-1]||0;
      let middle = pattern[i]||0;
      let right = pattern[i+1]||0;
      let binaryNum = "" + str(left) + str(middle) + str(right);
      let index = int(binaryNum, 2);
      newcells[i] = ruleset[index];
    }
    for (let i = 0; i<newcells.length; i++) {
      pattern[(generation*width)+i] = newcells[i];
    }
  }
}

function draw() {

  g.nextGeneration();
  //g.display();
  fill(0);
  rect(0, 0, width/3, height/8);
  fill(255);
  text("hold any key to toggle invert mode. \n Hold the mouse to draw cells,\n you can only draw on active regions.\ninvert: "+keyIsPressed+"\ndraw: "+mouseIsPressed, 5, 10);
}


class Cell {
  constructor(_state) {
    this.age = 0;
    this.state = _state;
    this.added = false;
  }
}


class Game {
  constructor(_ncols, _nrows) {
    this.ncols = _ncols;
    this.nrows = _nrows;
    this.grid=new Array(this.ncols);
    for (let i=0; i<this.ncols; i++)this.grid[i]=new Array(this.nrows);
    this.capture=new Array(this.ncols);
    for (let i=0; i<this.ncols; i++)this.capture[i]=new Array(this.nrows);
    this.w = 1.0 * width / this.ncols;
    this.h = 1.0 * height / this.nrows;
    this.lookAtMe = new Array();
    for (let j = 0; j < this.nrows; j++) {
      for (let i = 0; i < this.ncols; i++) {
        this.grid[i][j] = new Cell(pattern[j*this.ncols + i]);
        this.capture[i][j]=this.grid[i][j].state;
        this.lookAtMe.push(j*this.ncols + i);
      }
    }
  }

  nextGeneration() {

    let newlookAtMe = new Array();

    for (let k in this.lookAtMe) {

      let i = this.lookAtMe[k] % this.ncols;
      let j = this.lookAtMe[k] / this.ncols;
      let numAlive = 0;
      for (let x = i-1; x <= i+1; x++) {
        for (let y = j-1; y <= j+1; y++) {
          if (x>=0 && y>=0 && x<this.ncols && y<this.nrows) numAlive += (this.grid[int(x)][int(y)].state||0);
        }
      }
      this.grid[int(i)][int(j)].newState = this.getNewState(this.grid[int(i)][int(j)].state, numAlive-(this.grid[int(i)][int(j)].state||0));

      if (this.grid[int(i)][int(j)].newState != this.grid[int(i)][int(j)].state) {
        for (let x = i-1; x <= i+1; x++) {
          for (let y = j-1; y <= j+1; y++) {
            if (x < 0 || y<0 || x>= this.ncols || y>= this.nrows) continue;
            if (this.grid[int(x)][int(y)].added == false) newlookAtMe.push(y*this.ncols + x);
            this.grid[int(x)][int(y)].added = true;
          }
        }
      }
    }
    if (mouseIsPressed) {
      this.grid[mouseX][mouseY].newState=1;
    }

    for (let k in this.lookAtMe) {
      let i = int(this.lookAtMe[k] % this.ncols);
      let j = int(this.lookAtMe[k] / this.ncols);
      this.grid[i][j].state = this.grid[i][j].newState;
    }
    this.lookAtMe=new Array();
    for(let n in newlookAtMe)this.lookAtMe.push(newlookAtMe[n]);
    console.log(this.lookAtMe);
    //this.lookAtMe = this.newlookAtMe;//this dosen't set lookatme?
  }
  getNewState(state, numAlive) {
      if (state == 0||(keyIsPressed&&state==1)) {
        if (numAlive == 3) return 1;
      }
      if (state == 1||(keyIsPressed&&state==0)) {
        if (numAlive == 2 || numAlive == 3) return 1;
      }
      return 0;
  }


  display() {
    let c, index;
    //console.log(this.grid);
    loadPixels();
    for (let k in this.lookAtMe) {
      let i = this.lookAtMe[k] % this.ncols;
      let j = this.lookAtMe[k] / this.ncols;
      console.log(this.grid[i][j]);
      if (this.grid[i][j].state == 1) c = color(255);
      else c = color(0);

      index=4*(i*d+(j*d)*width*j);
      pixels[index] = red(c);
      pixels[index+1] = green(c);
      pixels[index+2] = blue(c);
      pixels[index+3] = alpha(c);
      this.grid[i][j].added = false;
    }
    updatePixels();
  }
}
