module.exports = {
    PORT: process.env.PORT || "3000",
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",
    CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://localhost:27017/note-pad",
    JWT: {
        SECRET: process.env.JWT_SECRET || "secret",
        EXPIRE_TIME: !isNaN(parseInt(process.env.JWT_EXPIRE_TIME)) ? parseInt(process.env.JWT_EXPIRE_TIME) : 86400
    }
}
