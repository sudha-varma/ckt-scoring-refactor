import Promise from "bluebird";
import mongoose from "mongoose";
import config from ".";
import logger from "../utils/logger";

// make bluebird default Promise
// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

const db = config.database;

// connect to mongo db
const mongoUri = `mongodb://${db.user}:${db.pass}@${db.host}:${db.port}/${
  db.dbname
}?authSource=admin`;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  keepAlive: 1,
});

mongoose.set("useCreateIndex", true);
mongoose.set("findAndModify", false);

mongoose.connection.on("error", err => {
  logger.error(err.message);
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (db.mongooseDebug) {
  mongoose.set("debug", db.mongooseDebug);
}
