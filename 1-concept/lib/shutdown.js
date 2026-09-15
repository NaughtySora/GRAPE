'use strict';

const process = require("node:process");

const SIGNALS = ["SIGINT", "SIGTERM"];

module.exports = (cleanUp) => {
  let stopping = false;
  SIGNALS.forEach((signal) => {
    process.on(signal, async () => {
      if (stopping) return;
      stopping = true;
      try {
        await cleanUp();
        process.exit(0);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    });
    process.on("uncaughtException", async (error) => {
      if (stopping) return;
      stopping = true;
      console.error('uncaughtException', error);
      try {
        await cleanUp();
      } catch (e) {
        console.error(e);
      }
    });
  });
};
