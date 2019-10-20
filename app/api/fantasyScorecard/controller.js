import util from "../../../utils/util";
import validator from "./validator";
import service from "./service";
import matchService from "../match/service";
import messages from "../../../localization/en";
import { redisClient } from "../../../utils/redis";
import logger from "../../../utils/logger";

/**
 * Get Fantasy ScoreCard
 * @property {string} params.matchId - Match Id.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { matchId } = validParam.params;

  let redisReply;
  let error = false;
  // Reading fantasy scorecard from redis
  try {
    redisReply = await redisClient.getAsync(`${matchId}FantasyScorecard`);
  } catch (err) {
    logger.error(err.message);
    error = true;
  }

  if (!error && redisReply) {
    const fantasyScorecard = JSON.parse(redisReply);

    if (fantasyScorecard) {
      return {
        status: 200,
        // data: { card: fantasyScorecard },
        data: fantasyScorecard,
        message: messages.SUCCESSFULL,
      };
    }
  }

  // If unable to get response from redis, serving from mongo
  // Getting fantasy scorecard details
  const existingDoc = await service.findByMatchId({ matchId });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  return existingDoc;
}

/**
 * Get fantasy scorecard list.
 * @property {number} query.skip - Number of fantasy scorecards to be skipped.
 * @property {number} query.limit - Limit number of fantasy scorecards to be returned.
 * @property {array} query.filters - Array of fantasy scorecard filters.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting fantasy scorecards list with filters
  const docs = await service.find({ query: validQuery.query });

  return docs;
}

/**
 * Create new fantasy scorecard
 * @property {string} body.matchId - match id.
 * @property {string} body.card - match fantasy scorecard object.
 * @returns {Object}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });

  const validBody = validData.body;
  const promiseList = [];

  if (validBody.matchId) {
    // Checking if matchId exist
    promiseList.push(
      matchService.findById({
        id: validBody.matchId,
        errKey: "body,matchId",
        autoFormat: false,
      }),
    );
  }

  // Waiting for promises to finish
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  // Creating new fantasy scorecard

  const newDoc = await service.findByMatchIdAndUpdate({
    matchId: validBody.matchId,
    data: validBody,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  return newDoc;
}

/**
 * Update existing fantasy scorecard
 * @property {string} params.matchId - Match Id.
 * @property {string} body.card - match fantasy scorecard object.
 * @returns {Object}
 */
async function update(params, body) {
  // Validating param
  const validParam = await validator.update.validate({ params });

  const { matchId } = validParam.params;

  // Getting fantasy scorecard object to be updated
  const existingDoc = await service.findByMatchId({
    matchId,
    autoFormat: false,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  // Validating body
  const validData = await validator.update.validate({ body });

  const validBody = validData.body;

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  // Updating new data to document
  const savedDoc = await service.updateExisting({
    existingDoc,
    data: validBody,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(savedDoc);

  return savedDoc;
}

/**
 * Delete fantasy scorecard.
 * @property {string} params.matchId - Match Id.
 * @returns {Object}
 */
async function remove(params) {
  // Validating param
  const validParam = await validator.remove.validate({ params });
  const { matchId } = validParam.params;

  // Updating status to deleted
  const deletedDoc = await service.removeByMatchId({ matchId });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(deletedDoc);

  return deletedDoc;
}

export default { get, list, create, update, remove };
