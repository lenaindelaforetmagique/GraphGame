SVGNS = "http://www.w3.org/2000/svg";

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
};

colorGenerator = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}

hslaGenerator = function(hue = 0, saturation = 0, light = 0, alpha = 1) {
  return `hsla(${Math.floor(hue)}, ${Math.floor(saturation)}%, ${Math.floor(light)}%, ${alpha})`;
  // return `hsl(${Math.floor(hue)}, ${Math.floor(saturation)}%, ${Math.floor(light)}%)`;
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

    this.selectedNode = null;
    this.nodes = [];
    this.edges = [];

    this.level = 4;
    this.levelMin = 4;

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

    this.edgesDom = document.createElementNS(SVGNS, 'g');
    this.dom.appendChild(this.edgesDom);

    this.nodesDom = document.createElementNS(SVGNS, 'g');
    this.dom.appendChild(this.nodesDom);

    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;

    this.legend.innerText = this.level + " nœuds";

    for (let i = 0; i < this.level; i++) {
      this.addNewNode(-50 + Math.random() * 100, Math.random() * 100 - 50);
    }

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

  changeLevel(delta) {
    this.level += delta;
    this.level = Math.max(this.levelMin, this.level);
    this.init();
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
      edge.nodes[0].interractWith(edge.nodes[1], 45, 0.4325, 1);
      edge.nodes[1].interractWith(edge.nodes[0], 45, 0.4325, 1);
    }
    for (let node of this.nodes) {
      for (let other of this.nodes) {
        if (node != other) {
          node.interractWith(other, 0.001, -125, -1)
        }
      }
    }

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
          thiz.changeLevel(1);
          break;
        case "ARROWDOWN":
          thiz.changeLevel(-1);
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

      thiz.selectedNode = null;
      thiz.updateDom();
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
    this.ub.onclick = function(e) {
      thiz.changeLevel(1);
    };

    this.db.onclick = function(e) {
      thiz.changeLevel(-1);
    };

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


function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

let u_ = new Universe();

var updateCB = function(timestamp) {
  u_.refresh(timestamp);
  window.requestAnimationFrame(updateCB);
};
updateCB(0);