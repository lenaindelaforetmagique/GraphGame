class Vector {
  constructor(x_ = 0, y_ = 0) {
    this.x = x_;
    this.y = y_;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  norm() {
    let res = Math.sqrt(this.x ** 2 + this.y ** 2);
    return res;
  }

  normalize() {
    let norm_ = this.norm();
    if (norm_ > 0) {
      this.x /= norm_;
      this.y /= norm_;
    }
  }

  add(other) {
    this.x += other.x;
    this.y += other.y;
  }

  sub(other) {
    this.x -= other.x;
    this.y -= other.y;
  }

  mult(scal) {
    this.x *= scal;
    this.y *= scal;
  }

  div(scal) {
    this.x /= scal;
    this.y /= scal;
  }

  limitNorm(maxNorm) {
    let norm_ = this.norm();
    if (norm_ > maxNorm) {
      this.mult(maxNorm / norm_);
    }
  }

  dotProduct(other) {
    let res = 0;
    res += this.x * other.x;
    res += this.y * other.y;
    return res;
  }

  crossProduct(other) {
    let res = 0;
    res += this.x * other.y;
    res -= this.y * other.x;
    return res;
  }

  rotate(angle) {
    let new_x = this.x * Math.cos(angle) + this.y * Math.sin(angle);
    let new_y = this.x * Math.sin(angle) - this.y * Math.cos(angle);
    this.x = new_x;
    this.y = new_y;
  }
}

createVector = function(x = 0, y = 0) {
  return new Vector(x, y);
}

createRandomVector = function(dx = 0, dy = 0, norm = 0) {
  let res = null;
  if (norm > 0) {
    res = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    res.normalize();
    res.mult(norm);
  } else {
    res = new Vector(Math.random() * dx, Math.random() * dy);
  }
  return res;
}

distance = function(vect1, vect2) {
  let res = new Vector(vect1.x, vect1.y);
  res.sub(vect2);
  return res.norm();
}