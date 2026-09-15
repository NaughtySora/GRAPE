'use strict';

const api = require('./api.js');
const config = require('../config/index.js');
const Framework = require('../lib/process.js');
const shutdown = require('../lib/shutdown.js');

const URL = "http://localhost";

module.exports = async (services, subservice) => {
  const fw = new Framework();
  const exit = await api(services, subservice);
  const balancerGroup = `${subservice}.balancer`;
  await fw.spawn(
    balancerGroup,
    config.balancer.path,
    [
      JSON.stringify([`${URL}:${config.gateway[subservice]}`]),
      config.balancer[subservice],
      balancerGroup
    ]
  );
  shutdown(async () => {
    try {
      await fw.disconnect(balancerGroup);
      await exit();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
};
