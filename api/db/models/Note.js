const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const noteSchema = new mongoose.Schema({
    noteId: { type: Number, unique: true },
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    }
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
