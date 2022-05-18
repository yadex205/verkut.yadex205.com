import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import fastifyFactory from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import * as mime from 'mime-types';

import { logger } from './logger.js';

const devServerClientJsContents = fs.readFileSync('scripts/libs/dev-server-client.js');

export class DevServer {
  #server = fastifyFactory();
  /** @type Set<import('ws') */
  #sockets = new Set();
  /** @type Map<string, Uint8Array> */
  #files = new Map();
  /** @type Map<string, string> */
  #digests = new Map();
  /** @type string[] */
  #updatedFiles = [];
  #reloadTimer = 0;

  constructor() {
    const fastify = this.#server;
    fastify.register(fastifyWebSocket);

    fastify.setNotFoundHandler((_req, res) => {
      res.code(404).type('text/plain').send('404 Not Found');
    });

    fastify.get('/__dev-server-client.js', (_req, res) => {
      res.code(200).type('text/javascript').send(devServerClientJsContents);
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
          .send(Buffer.from(contents));
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

  /** @param {{ contents: Uint8array | string; pathname: string }[]} files */
  pushFiles = (files) => {
    files.forEach((file) => {
      const hash = crypto.createHash('md5');
      const prevDigest = this.#digests.get(file.pathname);
      const nextDigest = hash.update(file.contents).digest('base64');

      if (prevDigest !== nextDigest) {
        this.#files.set(file.pathname, file.contents);
        this.#updatedFiles.push(file.pathname);
        this.#digests.set(file.pathname, nextDigest);
      }
    });

    clearTimeout(this.#reloadTimer);
    this.#reloadTimer = setTimeout(() => {
      this.#reload();
    }, 500);
  };

  #reload = () => {
    this.#sendEventToClient({
      createdAt: Date.now(),
      event: 'update',
      targets: this.#updatedFiles,
    });

    this.updatedFiles = [];
  };

  /** @param {unknown} event */
  #sendEventToClient = (event) => {
    const serializedEvent = JSON.stringify(event);

    this.#sockets.forEach((ws) => {
      ws.send(serializedEvent);
    });
  };
}
