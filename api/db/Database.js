const mongoose = require('mongoose');

let instance = null;

class Database {
    constructor() {
        if (!instance) {
            this.mongoConnection = null;
            instance = this;
        }
        return instance;
    }

    async connect(options) {
        try {
            console.log('DB CONNECTING');
            let db = await mongoose.connect(options.CONNECTION_STRING);
            this.mongoConnection = db;
            console.log('DB CONNECTED');
        } catch (err) {
            console.error('Database connection error:', err);
            process.exit(1);
        }
    }
}

module.exports = Database;
