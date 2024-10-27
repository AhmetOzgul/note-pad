const { format, transports, createLogger } = require('winston');

const { LOG_LEVEL } = require('../../config/Enum');

const formats = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.simple(),
    format.splat(),
    format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: [email:${info.message.email}] [procType:${info.message.procType}] [location:${info.message.location}] [log:${info.message.log}]`)
);


const logger = createLogger({
    level: LOG_LEVEL,
    format: formats,
    transports: [
        new (transports.Console)({ format: formats })
    ]
});

module.exports = logger;