const mongoose = require("mongoose");
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

userSchema.pre('save', async function (next) {
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
