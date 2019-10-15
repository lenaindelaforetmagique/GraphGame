// Graph Objects
// Nodes
// Edges

pointList_to_string = function(points_) {
  let list = "";
  for (let point of points_) {
    list += (point.x) + ',' + (point.y) + ' ';
  }
  return list;
}


class Node {
  constructor(x_ = 0, y_ = 0, parent_) {
    this.x = x_;
    this.y = y_;
    this.parent = parent_;

    this.dom = document.createElementNS(SVGNS, 'ellipse');
    this.dom.setAttribute("class", "Node");
    this.dom.setAttribute('rx', 5);
    this.dom.setAttribute('ry', 5);

    this.addEvents();
    this.updateDom();
  }

  updateDom() {
    this.dom.setAttribute('cx', this.x);
    this.dom.setAttribute('cy', this.y);
  }

  normalize(radius) {
    let norm = Math.pow(this.x, 2) + Math.pow(this.y, 2);
    norm = Math.sqrt(norm);
    norm = radius / norm;
    this.x *= norm
    this.y *= norm;
  }

  addEvents() {
    var thiz = this;
    this.dom.addEventListener("mousedown", function(e) {
      e.preventDefault();
      thiz.parent.selectedNode = thiz;
    }, false);
  }

}


class Edge {
  constructor(node1_, node2_) {
    this.nodes = [node1_, node2_];
    // this.node1 = node1_;
    // this.node2 = node2_;

    this.dom = document.createElementNS(SVGNS, 'polyline');
    this.statusOK = true;
    this.updateDom();
  }

  mayCross(other) {
    let vectAB = new Vector(0, 0);
    vectAB.add(this.nodes[1]);
    vectAB.sub(this.nodes[0]);

    let vectAC = new Vector(0, 0);
    vectAC.add(other.nodes[0]);
    vectAC.sub(this.nodes[0]);

    let vectAD = new Vector(0, 0);
    vectAD.add(other.nodes[1]);
    vectAD.sub(this.nodes[0]);

    return (vectAB.crossProduct(vectAC) * vectAB.crossProduct(vectAD) < 0);
  }

  controlOthers(listOfOthers) {
    this.statusOK = true;
    for (let other of listOfOthers) {
      if (this.mayCross(other) && other.mayCross(this)) {
        this.statusOK = false;
      }
    }
  }


  updateDom() {
    if (this.statusOK) {
      this.dom.setAttribute('class', 'segmentOK');
    } else {
      this.dom.setAttribute('class', 'segmentKO');
    }

    this.dom.setAttribute('points', pointList_to_string(this.nodes));
  }
}