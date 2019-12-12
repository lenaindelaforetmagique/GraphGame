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

    this.xTarget = x_;
    this.yTarget = y_;
    this.dx = 0;
    this.dy = 0;

    this.isFree = true;

    this.dom = document.createElementNS(SVGNS, 'ellipse');
    this.dom.setAttribute("class", "NodeFree");
    this.dom.setAttribute('rx', 7);
    this.dom.setAttribute('ry', 7);

    this.addEvents();
    this.updateDom();
  }

  interractWith(other, l0, fact, order = 1) {
    let u_ = new Vector(this.x - other.x, this.y - other.y);
    let l_ = u_.norm();
    u_.normalize();
    let intensity = -Math.pow(l_ - l0, order) * fact;
    u_.mult(intensity);
    this.dx += u_.x
    this.dy += u_.y
  }

  recalPos() {
    // let ka = 0.359;
    // let ax = (this.xTarget - this.x) * ka;
    // let ay = (this.yTarget - this.y) * ka;
    //
    // // integration
    // this.dx += ax;
    // this.dy += ay;

    // viscosity
    let kv = 0.59;
    this.dx *= kv;
    this.dy *= kv;

    // position
    if (this.isFree) {
      this.x += this.dx;
      this.y += this.dy;
    }
  }

  updateDom() {
    this.dom.setAttribute('cx', this.x);
    this.dom.setAttribute('cy', this.y);
    if (this.isFree) {
      // this.dom.setAttribute('fill', colorGenerator(255, 255, 255, 1));
      this.dom.setAttribute("class", "NodeFree");
    } else {
      // this.dom.setAttribute('fill', colorGenerator(175, 175, 175, 1));
      this.dom.setAttribute("class", "NodeNotFree");
    }
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

    var handleDown = function(e) {
      e.preventDefault();
      thiz.parent.raiseSelectedNode(thiz);
      thiz.isFree = false;

    }
    var handleUp = function(e) {
      e.preventDefault();
      thiz.parent.raiseSelectedNode(thiz);
      if (e.ctrlKey) {
        thiz.isFree = true;
      } else if (e.shiftKey) {
        thiz.parent.raiseKillTree();
      } else {
        thiz.isFree = false;
      }
    }

    this.dom.addEventListener("mousedown", handleDown, false);
    this.dom.addEventListener("touchstart", handleDown, false);
    this.dom.addEventListener("mouseup", handleUp, false);
  }

}

class Edge {
  constructor(node1_, node2_) {
    this.nodes = [node1_, node2_];
    // this.node1 = node1_;
    // this.node2 = node2_;

    this.dom = document.createElementNS(SVGNS, 'polyline');
    this.statusOK = true;
    this.colorKO = hslaGenerator(75 * (Math.random() - 0.5), 100, 40 * (Math.random() - 0.5) + 50, 1);
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
      this.dom.setAttribute('stroke', this.colorKO);
    }

    this.dom.setAttribute('points', pointList_to_string(this.nodes));
  }
}


class Tree {
  constructor(size_ = 1, parent_) {
    this.parent = parent_;
    this.nodes = [];
    this.edges = [];

    this.dom = document.createElementNS(SVGNS, 'g');

    this.edgesDom = document.createElementNS(SVGNS, 'g');
    this.dom.appendChild(this.edgesDom);

    this.nodesDom = document.createElementNS(SVGNS, 'g');
    this.dom.appendChild(this.nodesDom);


    for (let i = 0; i < size_; i++) {
      this.addNewNode(-50 + Math.random() * 100, Math.random() * 100 - 50);
    }
  }

  raiseSelectedNode(selectedNode_) {
    this.parent.selectNode(selectedNode_);
  }

  raiseKillTree() {
    this.parent.killTree(this);
  }

  updateDom() {
    for (let node of this.nodes) {
      // node.normalize(this.radius);
      node.updateDom();
    }

    for (let edge of this.edges) {
      edge.controlOthers(this.edges);
      edge.updateDom();
    }
  }

  addNewNode(x_ = 0, y_ = 0) {
    let newNode = new Node(x_, y_, this);
    if (this.nodes.length > 0) {
      let i = Math.floor(Math.random() * this.nodes.length);
      this.addNewEdge(newNode, this.nodes[i]);
    }
    this.nodesDom.appendChild(newNode.dom);
    this.nodes.push(newNode)
  }

  addNewEdge(node1_, node2_) {
    let newEdge = new Edge(node1_, node2_);
    this.edgesDom.appendChild(newEdge.dom);
    this.edges.push(newEdge);
  }

  recalPos() {
    for (let edge of this.edges) {
      edge.nodes[0].interractWith(edge.nodes[1], 45, 0.6, 1);
      edge.nodes[1].interractWith(edge.nodes[0], 45, 0.6, 1);
    }
    for (let node of this.nodes) {
      for (let other of this.nodes) {
        if (node != other) {
          node.interractWith(other, 0.0001, -20, -1)
        }
      }
    }

    for (let node of this.nodes) {
      node.recalPos();
    }
  }
}