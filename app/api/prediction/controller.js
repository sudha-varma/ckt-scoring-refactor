import validator from "./validator";
import util from "../../../utils/util";
import service from "./service";
import matchService from "../match/service";

/**
 * Get Prediction
 * @property {string} params.matchId - Match Id.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { matchId } = validParam.params;

  // Getting prediction details
  const existingDoc = await service.findByMatchId({ matchId });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  return existingDoc;
}

/**
 * Get prediction list.
 * @property {number} query.skip - Number of prediction to be skipped.
 * @property {number} query.limit - Limit number of prediction to be returned.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting prediction list with filters
  const docs = await service.find({ query: validQuery.query });
  return docs;
}

/**
 * Create new prediction
 * @property {string} body.matchId - match id.
 * @property {string} body.data - match prediction object.
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

  // Creating new prediction

  const newDoc = await service.findByMatchIdAndUpdate({
    matchId: validBody.matchId,
    data: validBody,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  return newDoc;
}

/**
 * Update existing prediction
 * @property {string} body.data - match prediction object.
 * @returns {Prediction}
 */
async function update(params, body) {
  // Validating param
  const validParam = await validator.update.validate({ params });

  const { matchId } = validParam.params;

  // Getting prediction object to be updated
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
 * Delete prediction.
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
