'use strict';

const Balancer = require('./lib/balancer.js');
const FrameWork = require('./lib/process.js');

void async function () {
  const { 2: sources, 3: port, 4: name } = process.argv;
  const balancer = new Balancer(JSON.parse(sources), name);
  await balancer.start(parseInt(port, 10));
  FrameWork.shutdown(async () => {
    try {
      await balancer.stop(1000);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}();