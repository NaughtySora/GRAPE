'use strict';

const { async } = require("naughty-util");
const { fork } = require("node:child_process");
const { once } = require("node:events");

class FrameWork {
  #processes = new Map();

  #append(key, process) {
    const group = this.#processes.get(key);
    if (group === undefined) {
      this.#processes.set(key, [process]);
    } else {
      group.push(process);
    }
  }

  async spawn(key, ...args) {
    const spawned = fork(...args);
    this.#append(key, spawned);
    await once(spawned, "spawn");
  }

  async disconnect(key, ms = 3000) {
    const group = this.#processes.get(key);
    if (group === undefined) return;
    const promises = [];
    for (const process of group) {
      process.send({ status: "exit" });
      promises.push(once(process, "exit"));
    }
    await Promise.race([Promise.all(promises), async.reject(ms)]);
    this.#processes.delete(key);
  }

  async stop(ms = 5000) {
    const processes = this.#processes;
    const promises = [];
    for (const group of processes.values()) {
      for (const process of group) {
        process.send({ status: "exit" });
        promises.push(once(process, "exit"));
      }
    }
    await Promise.race([Promise.all(promises), async.reject(ms)]);
  }

  static shutdown(cleanUp, ms = 2000) {
    const exit = async () =>
      await Promise.race([cleanUp(), async.reject(ms)]);
    process.on("message", async message => {
      if (message.status === "exit") await exit();
    });
    process.on("uncaughtException", async () => {
      await exit();
    });
    ["SIGINT", "SIGTERM"].forEach(signal => {
      process.on(signal, () => { });
    });
  }
}

module.exports = FrameWork;