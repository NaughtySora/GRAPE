'use strict';

const Gateway = require('../lib/gateway.js');
const FrameWork = require('../lib/process.js');

void async function () {
  const { 2: mapping, 3: port, 4: name } = process.argv;
  const gateway = new Gateway(JSON.parse(mapping), name);
  await gateway.start(parseInt(port, 10));
  FrameWork.shutdown(async () => {
    try {
      await gateway.stop(1000);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}();