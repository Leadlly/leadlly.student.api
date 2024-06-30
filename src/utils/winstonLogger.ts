import winston from "winston";

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export const logger = winston.createLogger({
  levels: logLevels,
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.cli(),
  ),
  transports: [new winston.transports.Console()],
});
