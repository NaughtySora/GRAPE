'use strict';

const cluster = require('./cluster.js');
const config = require('./config.js');
const FrameWork = require('./lib/process.js');

const BASEURL = "http://localhost";

module.exports = async (services, subservice) => {
  const fw = new FrameWork();
  const api = new Set(services);
  const promises = [];
  const handlers = [];
  const mapping = config.services.reduce((acc, cur) => {
    if (!api.has(cur.name)) return acc;
    for (const { balancer, name: subname } of cur.instances) {
      if (subname !== subservice) continue;
      acc[cur.name] = `${BASEURL}:${balancer}`;
    }
    return acc;
  }, {});
  for (const service of api.values()) {
    promises.push((async () => {
      const exit = await cluster(service, subservice);
      handlers.push(exit);
    })());
  }
  await Promise.all(promises);
  const gatewayGroup = `${subservice}.gateway`;
  await fw.spawn(
    gatewayGroup, config.gateway.path,
    [JSON.stringify(mapping), config.gateway[subservice], gatewayGroup]
  );
  return async () => {
    await fw.disconnect(gatewayGroup);
    const promises = [];
    for (const exit of handlers) {
      promises.push(exit());
    }
    await Promise.all(promises);
  }
};
