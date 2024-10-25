const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    level: String,
    email: String,
    location: String,
    procType: String,
    log: mongoose.SchemaTypes.Mixed,
}, {
    versionKey: false,
    timestamps: true
});

class AuditLogs extends mongoose.Model { }

schema.loadClass(AuditLogs);
module.exports = mongoose.model("AuditLogs", schema);