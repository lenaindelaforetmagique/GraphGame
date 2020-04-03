// Family Tree objects
// Nodes
// Edges

class Person {
  constructor(node_, uniqueID_, name_, surname_, dateofbirth_, dateofdeath_, parent1_, parent2_) {
    // uniqueID
    // Name
    // Surname
    // dob, mob, yob
    // dod, mod, yod
    // parent1_ID
    // parent2_ID

    // console.log("*" + uniqueID_);
    this.node = node_;
    this.uniqueID = uniqueID_;
    this.name = name_;
    this.surname = surname_;
    this.dateofbirth = dateofbirth_;
    this.dateofdeath = dateofdeath_;
    this.parent1 = parent1_;
    this.parent2 = parent2_;
  }

  repr() {
    return this.name; // + " " + this.surname;
  }

}


class FamilyTree {
  constructor(parent_, treeFile_) {
    this.parent = parent_;
    this.persons = [];

    this.tree = new Tree(this.parent);

    treeFile_ = treeFile_.split('\n');
    for (let line of treeFile_) {
      this.addNewPerson(line);
    }
  }

  addNewPerson(personLine_) {

    let infos = personLine_.split(' ');
    if (infos.length == 7) {
      let newNode = this.tree.addNewNode();
      let parent1 = this.findPerson(infos[5]);
      let parent2 = this.findPerson(infos[6]);
      let newPerson = new Person(newNode, infos[0], infos[1], infos[2], new Date(infos[3]), new Date(infos[4]), parent1, parent2);

      newNode.txtLabel = newPerson.repr();
      if (parent1 != null) {
        this.tree.addNewEdge(newNode, parent1.node);
      }
      if (parent2 != null) {
        this.tree.addNewEdge(newNode, parent2.node);
      }

      if (parent1 == null && parent2 == null) {
        console.log(infos[1]);
      }

      this.persons.push(newPerson);
    }

  }

  findPerson(personID) {
    let i = 0;
    while (i < this.persons.length) {
      if (this.persons[i].uniqueID == personID) {
        break;
      } else {
        i++;
      }
    }
    if (i == this.persons.length) {
      return null;
    } else {
      return this.persons[i];
    }
  }
}