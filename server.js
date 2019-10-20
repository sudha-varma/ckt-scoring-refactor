// config should be imported before importing any other file
import config from "./config";
/* eslint-disable-next-line no-unused-vars */
import db from "./config/mongoose";
import app from "./config/express";
import logger from "./utils/logger";

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    logger.info(`server started on port ${config.port} (${config.env})`);
  });
}

export default app;
