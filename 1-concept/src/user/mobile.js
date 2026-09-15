'use strict';

const Server = require('../lib/server.js');
const FrameWork = require('../lib/process.js');

void async function () {
  const { 2: name, 3: port } = process.argv;
  const http = new Server(name);
  await http.start(parseInt(port, 10));
  FrameWork.shutdown(async () => {
    try {
      await http.stop(1000);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}();