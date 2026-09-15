'use strict';

const { misc } = require("naughty-util");
const config = require("../config");

void async function () {
  if (process.argv.length < 3) {
    throw new Error("Subservice name is required, see config.client");
  }
  if (!Reflect.has(config.booting, process.argv[2])) {
    throw new Error("Invalid subservice name");
  }
  const subservice = process.argv[2];
  const api = config.client[subservice];
  const size = api.length - 1;
  const port = config.balancer[subservice];
  const batch = parseInt(process.argv[3] ?? '20', 10);
  const calls = parseInt(process.argv[4] ?? '1000', 10);
  let i = 0;
  const url = req => `http://localhost:${port}/${req.service}/${req.url}`;
  while (i < calls) {
    let j = 0;
    const promises = [];
    while (j++ < batch) {
      const req = api[misc.random(size)];
      promises.push(fetch(url(req), { method: req.method, }));
    }
    await Promise.all(promises);
    i += j;
  }
}();