const mongoose = require("mongoose");

const Counter = mongoose.models.Counter || mongoose.model('Counter', new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
}));


const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
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

userSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.userId = await getNextSequence('userId');
    }
    if (this.isNew || this.isModified('password')) {
        try {
            const hashedPassword = await bcrypt.hash(this.password, SALT_ROUNDS);
            this.password = hashedPassword;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

class User extends mongoose.Model { }

userSchema.loadClass(User);
module.exports = mongoose.model("User", userSchema);
