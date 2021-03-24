import * as winston from 'winston';

const { printf, combine, colorize, timestamp } = winston.format;

const format = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), format)
    })
  ]
});

export default logger;
