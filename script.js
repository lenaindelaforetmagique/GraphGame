SVGNS = "http://www.w3.org/2000/svg";

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
};

colorGenerator = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}


class Universe {
  constructor() {
    this.container = document.getElementById("container");
    this.dom = document.createElementNS(SVGNS, "svg");
    this.container.appendChild(this.dom);
    this.viewBox = new ViewBox(this.dom);
    this.ub = document.getElementById("aup");
    this.db = document.getElementById("adown");
    this.legend = document.getElementById("legend");
    this.header = document.getElementById("header");
    this.footer = document.getElementById("footer");
    this.overlay = document.getElementById("overlay");

    this.selectedNode = null;
    this.nodes = [];
    this.edges = [];

    this.level = 4;
    this.levelMin = 4;
    this.levelMax = 4;

    if (localStorage["GraphGameLevelMax"]) {
      this.levelMax = JSON.parse(localStorage["GraphGameLevelMax"]);
    }



    this.counter = 0;
    this.levelFound = false;

    this.radius = 0.85 * Math.min(this.footer.offsetTop - (this.header.offsetTop + this.header.offsetHeight), this.viewBox.width) / 2;
    this.viewBox.translate(-this.viewBox.width / 2, -(this.footer.offsetTop + this.header.offsetTop + this.header.offsetHeight) / 2);

    this.init();
    this.addEvents();
    this.lastUpdate = Date.now();
  }

  init() {
    // clean everything
    while (this.dom.firstChild != null) {
      this.dom.removeChild(this.dom.firstChild);
    }

    this.overlay.style.left = "100%";
    this.counter = 0;
    this.levelFound = false;
    // this.circleDom = document.createElementNS(SVGNS, 'ellipse');
    // this.circleDom.setAttribute("class", "BoardLimit");
    // this.circleDom.setAttribute('rx', this.radius);
    // this.circleDom.setAttribute('ry', this.radius);
    // this.circleDom.setAttribute('cx', 0);
    // this.circleDom.setAttribute('cy', 0);
    // this.dom.appendChild(this.circleDom);

    this.edgesDom = document.createElementNS(SVGNS, 'g');
    this.dom.appendChild(this.edgesDom);

    this.nodesDom = document.createElementNS(SVGNS, 'g');
    this.dom.appendChild(this.nodesDom);

    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;

    this.legend.innerText = "Niveau " + this.level;


    for (let i = 0; i < this.level; i++) {
      this.addNewNode(-50 + Math.random() * 100, Math.random() * 100 - 50);
      // this.nodes.last().normalize(this.radius);
    }

    this.generateEdges();
    this.harmonizeNodes();
    this.updateDom();
  }

  refresh() {
    let now = Date.now();
    if (now - this.lastUpdate > 20) {
      this.lastUpdate = now;
      this.recalPos();
      this.updateDom();
    }
  }

  levelUp() {
    if (this.level < this.levelMax) {
      this.level += 1;
      this.init();
    }
  }

  levelDown() {
    if (this.level > this.levelMin) {
      this.level -= 1;
      this.init();
    }
  }

  gameEnded() {
    this.levelFound = true;
    this.levelMax = Math.max(this.levelMax, this.level + 1);
    localStorage["GraphGameLevelMax"] = JSON.stringify(this.levelMax);
    var a = this.counter;
    this.overlay.innerHTML = "Trouvé en " + a + (a > 1 ? " coups !" : " coup !!")
    this.overlay.style.left = (window.innerWidth - this.overlay.offsetWidth) / 2 + "px"
  }


  generateEdges() {
    // contour
    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.addNewEdge(this.nodes[i], this.nodes[i + 1]);
    }
    this.addNewEdge(this.nodes[0], this.nodes.last());

    let indices = [];
    for (let i = 0; i < this.nodes.length; i++) {
      indices.push(i);
    }

    while (indices.length > 3) {
      let i = Math.floor(Math.random() * indices.length);
      // console.log(indices);
      // console.log(i);
      let iStart = i - 1;
      let iEnd = i + 1;
      if (i == 0) {
        iStart = indices.length - 1;
      } else if (i == indices.length - 1) {
        iEnd = 0;
      }
      this.addNewEdge(this.nodes[indices[iStart]], this.nodes[indices[iEnd]]);
      indices.splice(i, 1);
    }
  }



  addNewNode(x_ = 0, y_ = 0) {
    let newNode = new Node(x_, y_, this);
    this.nodesDom.appendChild(newNode.dom);
    this.nodes.push(newNode)
  }

  addNewEdge(node1_, node2_) {
    let newEdge = new Edge(node1_, node2_);
    this.edgesDom.appendChild(newEdge.dom);
    this.edges.push(newEdge);
  }

  recalPos() {
    for (let node of this.nodes) {
      node.recalPos();
    }
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

  controlEdges() {
    var edgesNonOk = document.getElementsByClassName("segmentKO");
    return edgesNonOk.length < 1;
  }



  harmonizeNodes() {
    var ref = new Vector(1, 0);
    if (this.selectedNode != null) {
      ref = new Vector(this.selectedNode.x, this.selectedNode.y);
    }

    var compareNodes = function(node1, node2) {
      let angle1 = angle(ref, new Vector(node1.x, node1.y));
      let angle2 = angle(ref, new Vector(node2.x, node2.y));
      return angle1 - angle2;
    }
    this.nodes.sort(compareNodes);

    if (this.selectedNode != null) {
      // console.log(this.nodes[0] == this.selectedNode);
    }


    let angle0 = angle(new Vector(1, 0), new Vector(this.nodes[0].x, this.nodes[0].y));
    let deltaAngle = Math.PI * 2 / this.level;
    let i = 0;
    for (let node of this.nodes) {
      let theta = angle0 + i * deltaAngle;
      // console.log(theta);
      node.xTarget = this.radius * Math.cos(theta);
      node.yTarget = this.radius * Math.sin(theta);
      i += 1;

      // node.normalize(this.radius);
      // node.updateDom();
    }
  }

  addEvents() {
    let thiz = this;

    // KEYBOARD Events
    document.onkeydown = function(e) {
      // console.log(e.key);
      switch (e.key.toUpperCase()) {
        case "ENTER":
          thiz.addCurve();
          break;
        case ' ':
          thiz.init();
          break;
        case "ARROWUP":
          thiz.levelUp();
          break;
        case "ARROWDOWN":
          thiz.levelDown();
          break;
        default:
          break;
      }
    }

    // MOUSE events
    // this.container.addEventListener("mousedown", function(e) {
    //   e.preventDefault();
    //   thiz.hasMoved = false;
    //   if (!thiz.selectedNode) {
    //     // thiz.addNewNode(
    //     //   thiz.viewBox.realX(e.clientX),
    //     //   thiz.viewBox.realY(e.clientY)
    //     // );
    //   }
    // }, false);

    var handleMove = function(e) {
      e.preventDefault();
      if (thiz.selectedNode != null) {
        thiz.selectedNode.x = thiz.viewBox.realX(e.clientX);
        thiz.selectedNode.y = thiz.viewBox.realY(e.clientY);
        thiz.selectedNode.xTarget = thiz.selectedNode.x;
        thiz.selectedNode.yTarget = thiz.selectedNode.y;
        thiz.updateDom();
      }
    }

    document.addEventListener("mousemove", handleMove, false);

    var handleUp = function(e) {
      e.preventDefault();
      // thiz.harmonizeNodes();

      if (thiz.selectedNode != null) {
        if (!thiz.levelFound) {
          thiz.counter += 1;
        }
      }

      thiz.selectedNode = null;
      thiz.updateDom();

      if (thiz.controlEdges()) {
        thiz.gameEnded();
      }
    }
    document.addEventListener("mouseup", handleUp, false);

    document.addEventListener("wheel", function(e) {
      e.preventDefault();
      let k = 1.1;
      if (e.deltaY > 0) {
        k = 1 / k;
      }
      thiz.viewBox.scale(e.clientX, e.clientY, k);
    }, false);

    // TOUCH events
    document.addEventListener("touchstart", function(e) {
      e.preventDefault();
    }, false);

    // document.addEventListener("touchmove", handleMove, false);

    this.container.addEventListener("touchmove", function(e) {
      e.preventDefault();
      if (thiz.selectedNode != null) {
        thiz.selectedNode.x = thiz.viewBox.realX(e.changedTouches[0].clientX);
        thiz.selectedNode.y = thiz.viewBox.realY(e.changedTouches[0].clientY);
        thiz.selectedNode.xTarget = thiz.selectedNode.x;
        thiz.selectedNode.yTarget = thiz.selectedNode.y;
        thiz.updateDom();
      }
    }, false);


    this.container.addEventListener("touchend", handleUp, false);

    this.container.addEventListener("touchcancel", function(e) {
      e.preventDefault();
    }, false);

    this.container.addEventListener("touchleave", function(e) {
      e.preventDefault();
    }, false);


    // DOM OBJETS CLICK
    this.ub.onclick = function() {
      thiz.levelUp();
    };

    this.db.onclick = function() {
      thiz.levelDown();
    };

    this.overlay.onclick = function() {
      thiz.levelUp();
    }


    // OTHER events
    window.onresize = function(e) {
      thiz.viewBox.resize();
    }


    // window.onerror = function(msg, source, noligne, nocolonne, erreur) {
    //   let str = "";
    //   str += msg;
    //   str += " * ";
    //   str += source;
    //   str += " * ";
    //   str += noligne;
    //   str += " * ";
    //   str += nocolonne;
    //   str += " * ";
    //   // str += erreur;
    //   thiz.console(str);
    // }
  }

}

class ViewBox {
  constructor(parent_) {
    this.parent = parent_;
    this.xMin = 0;
    this.yMin = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.set();
  }

  repr() {
    return this.xMin + " " + this.yMin + " " + this.width + " " + this.height;
  }

  set() {
    this.parent.setAttributeNS(null, 'viewBox', this.repr());
  }

  realX(x) {
    // Returns the "real" X in the viewBox from a click on the parent Dom...
    let domRect = this.parent.getBoundingClientRect();
    return (x - domRect.left) / domRect.width * this.width + this.xMin;
  }

  realY(y) {
    // Returns the "real" Y in the viewBox from a click on the parent Dom...
    let domRect = this.parent.getBoundingClientRect();
    return (y - domRect.top) / domRect.height * this.height + this.yMin;
  }

  // Events
  resize() {
    this.height = this.width * window.innerHeight / window.innerWidth;
    this.set();
  }

  scale(x, y, fact = 1) {
    let coorX = this.realX(x);
    let coorY = this.realY(y);

    this.xMin = coorX - (coorX - this.xMin) / fact;
    this.yMin = coorY - (coorY - this.yMin) / fact;
    this.width /= fact;
    this.height /= fact;
    this.set();
  }

  translate(dx, dy) {
    let domRect = this.parent.getBoundingClientRect();
    this.xMin += dx / domRect.width * this.width;
    this.yMin += dy / domRect.height * this.height;
    this.set();
  }
}

let u_ = new Universe();

var updateCB = function(timestamp) {
  u_.refresh(timestamp);
  window.requestAnimationFrame(updateCB);
};
updateCB(0);