const mongoose = require("mongoose");
const Counter = require('./Counter');
const bcrypt = require("bcrypt");
const { PASS_LENGHT, HTTP_CODES } = require("../../config/Enum");
const is = require("is_js");
const CustomError = require("../../lib/Error");

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    currentToken: { type: String }
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
    try {
        if (this.isNew) {
            this.userId = await getNextSequence('userId');
        }
        if (this.isNew || this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        }
        next();
    } catch (error) {
        next(error);
    }
});

class User extends mongoose.Model {
    validatePassword(password) {
        return bcrypt.compare(password, this.password);
    }

    static validateFieldsBeforeAuth(email, password) {
        if (typeof password !== "string" || password.length < PASS_LENGHT || is.not.email(email)) {
            throw new CustomError(HTTP_CODES.UNAUTHORIZED, [], "Error! Wrong email or password!");
        }
        return null;
    }
}

userSchema.loadClass(User);
module.exports = mongoose.model("User", userSchema);
