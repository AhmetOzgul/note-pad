module.exports = {
    PORT: process.env.PORT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CONNECTION_STRING: process.env.CONNECTION_STRING,
    JWT: {
        SECRET: process.env.JWT_SECRET,
        EXPIRE_TIME: !isNaN(parseInt(process.env.JWT_EXPIRE_TIME)) ? parseInt(process.env.JWT_EXPIRE_TIME) : 31556926
    }
}
