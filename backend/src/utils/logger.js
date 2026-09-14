import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    bindings: (bindings) => ({})
  }
});

export default logger;
