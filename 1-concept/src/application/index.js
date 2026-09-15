'use strict';

const application = require("./application.js");
const config = require("../config/index.js");

void async function () {
  if (process.argv.length < 3) {
    throw new Error("Subservice booting name is required, see config.booting");
  }
  if (!Reflect.has(config.booting, process.argv[2])) {
    throw new Error("Invalid subservice name");
  }
  const subservice = process.argv[2];
  await application(config.booting[subservice], subservice);
}();