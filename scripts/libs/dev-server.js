import * as crypto from 'crypto';
import * as path from 'path';

import fastifyFactory from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import * as mime from 'mime-types';

import { logger } from './logger.js';

export class DevServer {
  #server = fastifyFactory();
  /** @type Set<import('ws') */
  #sockets = new Set();
  /** @type Map<string, Uint8Array> */
  #files = new Map();
  /** @type Map<string, string> */
  #digests = new Map();

  constructor() {
    const fastify = this.#server;
    fastify.register(fastifyWebSocket);

    fastify.setNotFoundHandler((_req, res) => {
      res.code(404).type('text/plain').send('404 Not Found');
    });

    fastify.get('/__dev-server-client.js', (_req, res) => {
      res.code(200).type('text/javascript').send('// noop');
    });

    fastify.get('/__websocket', { websocket: true }, ({ socket: ws }, req) => {
      const { remoteAddress, remotePort } = req.socket;
      const userAgent = req.headers['user-agent'] || '';

      this.#sockets.add(ws);
      logger.info(`Dev server: Connected from ${remoteAddress}:${remotePort} (${userAgent})`);

      ws.on('close', () => {
        this.#sockets.delete(ws);
        logger.info(`Dev server: Closed connection with ${remoteAddress}:${remotePort} (${userAgent})`);
      });
    });

    fastify.get('/*', (req, res) => {
      const requestedPathname = new URL(req.url || '', `http://${req.headers.host}`).pathname;
      const candidatePathnames = [requestedPathname, path.join(requestedPathname, 'index.html')];

      for (const candidatePathname of candidatePathnames) {
        const contents = this.#files.get(candidatePathname);
        if (!contents) {
          continue;
        }

        res
          .code(200)
          .headers({ 'Content-Type': mime.contentType(path.extname(candidatePathname)) || 'application/octet-stream' })
          .send(contents);
        return;
      }

      res.callNotFound();
    });
  }

  start = () => {
    const fastify = this.#server;
    fastify.listen(3000, (error, address) => {
      if (error) {
        throw error;
      }

      logger.info(`Dev server: Server is listening at ${address}`);
    });
  };

  /** @param {{ contents: Uint8array; pathname: string }[]} files */
  pushFiles = (files) => {
    /** @type string[] */
    const updateTargets = [];

    files.forEach((file) => {
      const hash = crypto.createHash('md5');
      const prevDigest = this.#digests.get(file.pathname);
      const nextDigest = hash.update(file.contents).digest('base64');

      if (prevDigest !== nextDigest) {
        this.#files.set(file.pathname, file.contents);
        updateTargets.push(file.pathname);
        this.#digests.set(file.pathname, nextDigest);
      }
    });

    const updateEvent = {
      createdAt: Date.now(),
      event: 'update',
      targets: updateTargets,
    };

    this.#sendEventToClient(updateEvent);
  };

  /** @param {unknown} event */
  #sendEventToClient = (event) => {
    const serializedEvent = JSON.stringify(event);

    this.#sockets.forEach((ws) => {
      ws.send(serializedEvent);
    });
  };
}
