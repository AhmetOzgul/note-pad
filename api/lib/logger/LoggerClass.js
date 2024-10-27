const logger = require('./logger');
let instance = null;

class LoggerClass {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    createLogObject(email, procType, location, log) {
        return {
            email: email,
            procType: procType,
            location: location,
            log: log
        };
    }
    info(email, procType, location, log) {
        logger.info(this.createLogObject(email, procType, location, log));
    }
    warn(email, procType, location, log) {
        logger.warn(this.createLogObject(email, procType, location, log));
    }
    error(email, procType, location, log) {
        logger.error(this.createLogObject(email, procType, location, log));
    }
    debug(email, procType, location, log) {
        logger.debug(this.createLogObject(email, procType, location, log));
    }
    verbose(email, procType, location, log) {
        logger.verbose(this.createLogObject(email, procType, location, log));
    }
    silly(email, procType, location, log) {
        logger.silly(this.createLogObject(email, procType, location, log));
    }
    http(email, procType, location, log) {
        logger.http(this.createLogObject(email, procType, location, log));
    }

}

module.exports = new LoggerClass();