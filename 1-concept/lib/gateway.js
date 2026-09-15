'use strict';

const http = require('node:http');
const timers = require('node:timers/promises');
const {
  palette: { dye, COLORS: { yellow, cyan } },
} = require("naughty-util");

const ROUTING_PREFIX = /^\/(?<route>[^\/]+)\/?/;

class Gateway {
  #name;
  #mapping
  #instance = null;
  #stopping = false;
  #port;

  constructor(mapping, name) {
    const map = {};
    for (const entry of Object.entries(mapping)) {
      map[entry[0]] = new URL(entry[1]);
    }
    this.#mapping = map;
    this.#name = name ?? "Unnamed gateway";
  }

  #map(route) {
    if (!Reflect.has(this.#mapping, route)) return;
    return this.#mapping[route];
  }

  async start(port) {
    const server = this.#instance = http.createServer((req, res) => {
      if (this.#stopping) {
        res.writeHead(503);
        res.end('Service is Unavailable');
        return;
      }
      const match = req.url.match(ROUTING_PREFIX);
      if (match === null) {
        res.writeHead(404);
        res.end('Resource not found');
        return;
      }
      const route = match.groups.route;
      const target = this.#map(route);
      if (target === undefined) {
        res.writeHead(404);
        res.end('Resource not found');
        return;
      }
      const socket = req.socket;
      const options = {
        hostname: target.hostname,
        port: target.port,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          'ip': socket.remoteAddress,
          'host': target.host
        },
      };
      const request = http.request(options, response => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      });
      request.on('error', (err) => {
        console.error(err);
        res.writeHead(502);
        res.end('Target is unreachable');
      });
      req.pipe(request);
    });
    server.listen(this.#port = port, () => {
      console.log(`Gateway ${dye(cyan, this.#name)} listening on port:`, port);
    });
  }

  async stop(ms = 2000) {
    if (this.#stopping) return;
    console.info(`Gateway ${dye(cyan, this.#name)} stopping`);
    this.#stopping = true;
    const server = this.#instance;
    let stopped = false;
    server.closeIdleConnections();
    server.close(err => {
      if (err) throw new Error('Gateway closing error');
      stopped = true;
    });
    await timers.setTimeout(ms);
    if (!stopped) server.closeAllConnections();
    this.#instance = null;
    this.#stopping = false;
    console.info(`Gateway ${dye(cyan, this.#name)} stopped \
on port: ${dye(yellow, this.#port)}`);
  }
}

module.exports = Gateway;


