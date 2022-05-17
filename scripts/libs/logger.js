import pino from 'pino';

export const logger = pino({
  name: 'www.yadex205.com',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'hostname,pid',
      translateTime: true,
    },
  },
});
