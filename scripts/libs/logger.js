import pino from 'pino';

export const logger = pino({
  name: 'verkut.yadex205.com',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'hostname,pid',
      translateTime: true,
    },
  },
});
