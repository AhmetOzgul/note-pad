const mongoose = require("mongoose");
const Counter = require('./Counter');

const noteSchema = new mongoose.Schema({
    noteId: { type: Number, unique: true },
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    userId: { type: Number, required: true }
}, {
    timestamps: true,
    versionKey: false
});


async function getNextSequence(name) {
    const counter = await Counter.findByIdAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

noteSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.noteId = await getNextSequence('noteId');
    }
    next();
});

class Note extends mongoose.Model { }

noteSchema.loadClass(Note);
module.exports = mongoose.model("Note", noteSchema);
