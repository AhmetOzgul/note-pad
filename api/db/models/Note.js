const mongoose = require("mongoose");

const schema = mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },

    /* createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         required: false
     }*/

}, {
    timestamps: true,
    versionKey: false
});

class Note extends mongoose.Model {

}

schema.loadClass(Note);
module.exports = mongoose.model("Note", schema);
