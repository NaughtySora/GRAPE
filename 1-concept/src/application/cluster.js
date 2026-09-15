'use strict';

const config = require('../config/index.js');
const FrameWork = require('../lib/process.js');

const error = (message) => { throw new Error(message) };

const URL = "http://localhost";

module.exports = async (service, subservice) => {
  const fw = new FrameWork();
  const sources = [], promises = [];
  const { instances } = config.services.find(s => s.name === service)
    ?? error("Invalid service name");
  const { path, ports, balancer } =
    instances.find(s => s.name === subservice) ??
    error("Invalid subservice name");
  for (const port of ports) {
    sources.push(`${URL}:${port}`);
    promises.push(
      fw.spawn(service, path, [`${service}.${subservice}`, port])
    );
  }
  await Promise.all(promises);
  const balancerGroup = `${service}.${subservice}.balancer`;
  await fw.spawn(balancerGroup,
    config.balancer.path,
    [JSON.stringify(sources), balancer, balancerGroup],
  );
  return async () => {
    await fw.disconnect(balancerGroup);
    await fw.stop();
  };
};
