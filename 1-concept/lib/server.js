'use strict';

const { createServer } = require('node:http');
const timers = require('node:timers/promises');
const {
  misc: { timestamp, inRange },
  http: { parseURL },
  palette: { dye, COLORS: { blue, green, red, yellow, cyan } },
} = require("naughty-util");

const codeColor = (code) => {
  if (inRange(code, 200, 299)) return green;
  if (inRange(code, 300, 399)) return blue;
  return red;
};

const codeLog = (code) => {
  if (inRange(code, 200, 299)) return 'log';
  if (inRange(code, 300, 399)) return 'info';
  return 'error';
};

const HEADERS = {
  json: { "content-type": "application/json", },
};

class Server {
  #instance = null;
  #name;
  #stopping = false;
  #port;

  constructor(name) {
    this.#name = name ?? "Unnamed http server";
  }

  async start(port) {
    if (this.#instance !== null) {
      console.warn("Server is already running");
      return;
    }
    const { promise, resolve } = Promise.withResolvers();
    const stop = timestamp();
    this.#instance = createServer((req, res) => {
      if (this.#stopping) {
        res.writeHead(503, HEADERS.json);
        res.end(JSON.stringify({
          status: 'Service Unavailable',
          server: this.#name
        }));
        return;
      }
      const { url, method, headers, socket, } = req;
      const ip = socket.remoteAddress;
      const { 1: port } = (headers?.host ?? "").split(':');
      const { pathname: path, searchParams } = parseURL(url);
      res.once('finish', () => {
        console[codeLog(res.statusCode)]([
          [dye(cyan, 'server: '), this.#name],
          [dye(yellow, 'path: '), path],
          [dye(codeColor(res.statusCode), 'code: '), res.statusCode],
          [dye(yellow, 'port: '), port ?? null],
          [dye(yellow, 'method: '), method],
          [dye(yellow, 'search: '), JSON.stringify(Object.fromEntries(searchParams))],
          [dye(yellow, 'ms: '), stop().seconds.toString()],
          [dye(yellow, 'ip: '), ip],
        ].map(entry => `${entry[0]}${entry[1]}`).join(' '));
      });
      res.writeHead(200, HEADERS.json);
      res.end(JSON.stringify({ status: 'ok', server: this.#name }));
    });
    this.#instance.listen(this.#port = port, () => {
      console.log(`Server ${dye(cyan, this.#name)} listening on port:`, port);
      resolve();
    });
    await promise;
  }

  async stop(ms = 5000) {
    if (this.#stopping) return;
    console.info(`Server ${dye(cyan, this.#name)} stopping`);
    this.#stopping = true;
    const server = this.#instance;
    let stopped = false;
    server.closeIdleConnections();
    server.close(err => {
      if (err) throw new Error('Server closing error');
      stopped = true;
    });
    await timers.setTimeout(ms);
    if (!stopped) server.closeAllConnections();
    this.#instance = null;
    this.#stopping = false;
    console.info(`Server ${dye(cyan, this.#name)} stopped \
on port: ${dye(yellow, this.#port)}`);
  }
}

module.exports = Server;
