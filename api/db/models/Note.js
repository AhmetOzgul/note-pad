const mongoose = require("mongoose");

const schema = mongoose.Schema({
    title: String,
    content: String,
    createdBy: {
        type: mongoose.SchemaType.ObjectId,
        required: true
    }
});

class Note extends mongoose.Model {

}

schema.loadClass(Note);
module.exports = mongoose.model("note", schema);