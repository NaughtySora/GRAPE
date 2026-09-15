'use strict';

const http = require("node:http");
const timers = require("node:timers/promises");
const {
  palette: { dye, COLORS: { yellow, cyan } }
} = require("naughty-util");

const REQUEST_LIMIT = 0xFFFF;

class Balancer {
  #sources = null;
  #instance = null;
  #requests = 0;
  #stopping = false;
  #port;
  #name;

  constructor(sources, name) {
    this.#sources = sources.map(s => new URL(s));
    this.#name = name ?? "Unnamed balancer";
  }

  async start(port) {
    if (this.#instance !== null) {
      return void console.warn("Balancer is already running");
    }
    const server = this.#instance = http.createServer((req, res) => {
      if (this.#stopping) {
        res.writeHead(503, { "content-type": "text/plain", });
        res.end('Service Unavailable');
        return;
      }
      ++this.#requests;
      this.#requests &= REQUEST_LIMIT;
      const target = this.#sources[this.#requests % this.#sources.length];
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
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Target is unreachable');
      });
      req.pipe(request);
    });
    server.listen(this.#port = port, () => {
      console.log(`Balancer ${dye(cyan, this.#name)} listening on port:`, port);
    });
  }

  async stop(ms = 5000) {
    if (this.#stopping) return;
    console.info(`Balancer ${dye(cyan, this.#name)} stopping`);
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
    console.info(`Balancer ${dye(cyan, this.#name)} stopped \
on port: ${dye(yellow, this.#port)}`);
  }
}

module.exports = Balancer;

// test request.on('error');
// process.nextTick(() => {
//   request.destroy(new Error('Simulated client-side failure'));
// });