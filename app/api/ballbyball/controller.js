import validator from "./validator";
import util from "../../../utils/util";
import service from "./service";
import matchService from "../match/service";
import teamService from "../team/service";

/**
 * Get BallByBall
 * @property {string} params.id - BallByBall Id.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { id } = validParam.params;

  // Getting specific ball details
  const existingDoc = await service.findById({ id });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  return existingDoc;
}

/**
 * Get ballbyball list.
 * @property {number} query.skip - Number of ballbyball to be skipped.
 * @property {number} query.limit - Limit number of ballbyball to be returned.
 * @property {array} query.highlights - Array of ballbyball highlights.
 * @property {string} query.matchId - Array of ballbyball highlights.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting balls list with filters
  const docs = await service.find({ query: validQuery.query });

  return docs;
}

/**
 * Create new ballbyball
 * @property {string} body.matchId - match id.
 * @property {string} body.teamId - team id.
 * @property {string} body.teamKey - team key.
 * @property {number} body.inningNo - inning number.
 * @property {number} body.overNo - over number.
 * @property {number} body.ball - ball number.
 * @property {array} body.highlights - array of highlight types.
 * @property {string} body.comments - commentary for the ball.
 * @property {object} body.info - additional ball info object.
 * @returns {Object}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });

  const validBody = validData.body;
  const promiseList = [];

  // Checking if matchId exist
  promiseList.push(
    matchService.findById({
      id: validBody.matchId,
      errKey: "body,matchId",
      autoFormat: false,
    }),
  );

  // Checking if teamId or teamReference exist
  if (validBody.teamId) {
    promiseList.push(
      teamService.findById({
        id: validBody.teamId,
        errKey: "body,teamId",
        autoFormat: false,
      }),
    );
  } else if (validBody.teamReference) {
    promiseList.push(
      teamService.findByReference({
        id: validBody.teamReference,
        errKey: "body,teamReference",
        autoFormat: false,
      }),
    );
  }

  // Waiting for promises to finish
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  const uniqueFields = {
    matchId: validBody.matchId,
    inningNo: validBody.inningNo,
    overNo: validBody.overNo,
    ball: validBody.ball,
    teamId: promiseListResp[1].id,
  };

  // Creating new ball entry
  const newDoc = await service.findByBallUniqueFieldsAndUpdate({
    uniqueFields,
    data: validBody,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  return newDoc;
}

/**
 * Update existing ballbyball
 * @property {string} params.id - BallByBall Id.
 * @property {string} body.matchId - match id.
 * @property {string} body.teamId - team id.
 * @property {number} body.inningNo - inning number.
 * @property {number} body.overNo - over number.
 * @property {number} body.ball - ball number.
 * @property {array} body.highlights - array of highlight types.
 * @property {string} body.comments - commentary for the ball.
 * @property {object} body.info - additional ball info object.
 * @returns {Object}
 */
async function update(params, body) {
  // Validating param
  const validParam = await validator.update.validate({ params });

  const { id } = validParam.params;

  // Getting ballbyball object to be updated
  const existingDoc = await service.findById({ id, autoFormat: false });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  // Validating body
  const validData = await validator.update.validate({ body });

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

  if (validBody.teamId) {
    // Checking if teamId exist
    promiseList.push(
      teamService.findById({
        id: validBody.teamId,
        errKey: "body,teamId",
        autoFormat: false,
      }),
    );
  }

  // Waiting for promises to finish
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

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
 * Delete ballbyball.
 * @property {string} params.id - Ballbyball Id.
 * @returns {Object}
 */
async function remove(params) {
  // Validating param
  const validParam = await validator.remove.validate({ params });
  const { id } = validParam.params;

  // Updating status to deleted
  const deletedDoc = await service.removeById({ id });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(deletedDoc);

  return deletedDoc;
}

export default { get, list, create, update, remove };
