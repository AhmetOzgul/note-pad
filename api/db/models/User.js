const mongoose = require("mongoose");

const schema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});

class User extends mongoose.Model {

}

schema.loadClass(User);
module.exports = mongoose.model("user", schema);