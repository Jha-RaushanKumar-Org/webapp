const {
  createLogger,
  format,
  transports
} = require("winston");
var appRoot = require('app-root-path');
var winston = require("winston");
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
var options = {
  file: {
    filename: `${appRoot}/application.log`,
    handleExceptions: true,
    json: true,
  },
};

var logger = new winston.createLogger({
  format: format.combine(format.timestamp(), format.json()),
  levels: logLevels,
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

module.exports = logger;