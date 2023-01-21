const util = require('util');
const fs = require('fs');

// This package will be used to generate our unique ids. https://www.npmjs.com/package/uuid
const uuidv1 = require('uuid/v1'); //uuid that will give notes unique id

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Store {
  read() {
    return readFileAsync('db/db.json', 'utf8');
  }

  write(note) {
    return writeFileAsync('db/db.json', JSON.stringify(note));
  }

  getNotes() {
    return this.read().then((notes) => {
      let parsedNotes;

      // If notes cannot be concat into an array, retrns and empty array
      try {
        parsedNotes = [].concat(JSON.parse(notes));
      } catch (err) {
        parsedNotes = [];
      }

      return parsedNotes;
    });
  }

  addNote(note) {
    const { title, text } = note;

    if (!title || !text) {
      throw new Error("Note 'title' and 'text' cannot be blank");
    }

    // Gives note a unique id 
    const newNote = { title, text, id: uuidv1() };

    
    return this.getNotes() // Get all notes
      .then((notes) => [...notes, newNote])
      .then((updatedNotes) => this.write(updatedNotes)) //writes all updated notes
      .then(() => newNote); //returns the newNote
  }

  removeNote(id) {
    return this.getNotes()
      .then((notes) => notes.filter((note) => note.id !== id)) //removes note with given id
      .then((filteredNotes) => this.write(filteredNotes)); //writes the filtered notes
  }
}

module.exports = new Store();
