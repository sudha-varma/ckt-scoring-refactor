import validator from "./validator";
import util from "../../../utils/util";
import service from "./service";
import seriesService from "../series/service";
import teamService from "../team/service";
import playerService from "../player/service";

/**
 * Get Squad
 * @property {string} params.id - Squad Id.
 * @property {string} params.feedSource - feed source for the squad.
 * @property {string} params.key - key for feedSource for the squad.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { id } = validParam.params;

  // Getting squad details
  let existingDoc;

  if (id) {
    existingDoc = await service.findById({ id });
  } else {
    const reference = {
      feedSource: validParam.params.feedSource,
      key: validParam.params.key,
    };
    existingDoc = await service.findByReference({
      reference,
    });
  }

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  return existingDoc;
}

/**
 * Get squads list.
 * @property {string} query.approvalStatus - Array of approval status.
 * @property {number} query.skip - Number of squads to be skipped.
 * @property {number} query.limit - Limit number of squads to be returned.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting squad list with filters
  const docs = await service.find({ query: validQuery.query });
  return docs;
}

/**
 * Create squad
 * @property {string} body.seriesId - series for the squad.
 * @property {string} body.teamId - Team for the squad.
 * @property {array} body.playerIds - Player id list for the squad.
 * @property {string} body.activeFeedSource - The current active feed source of squad.
 * @property {string} body.reference - The reference object {feedSource: x, key:y} of squad.
 * @property {string} body.approvalStatus - The approval status of squad.
 * @returns {Object}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });
  const validBody = validData.body;
  const promiseList = [];

  if (validBody.reference) {
    // Checking if document exist with same reference
    promiseList[0] = service.checkDuplicate({
      reference: validBody.reference,
      errKey: "body,references",
    });
  }

  if (validBody.seriesId) {
    // Checking if seriesId exist
    promiseList[1] = seriesService.findById({
      id: validBody.seriesId,
      errKey: "body,seriesId",
    });
  }

  if (validBody.teamAId) {
    // Checking if teamAId exist
    promiseList[2] = teamService.findById({
      id: validBody.teamAId,
      errKey: "body,teamAId",
    });
  }

  // TODO: Check if playerIds are unique
  if (validBody.playerIds) {
    // Checking if playerIds are valid
    promiseList[3] = playerService.findByIds({
      ids: validBody.playerIds,
      errKey: "body,playerIds",
    });
  }

  // Waiting for promises to finish
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Adding reference as references array
  validBody.references = [validBody.reference];

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  // Creating new squad
  const newDoc = await service.create({ data: validBody });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  return newDoc;
}

/**
 * Update existing squad
 * @property {string} params.id - Squad Id.
 * @property {string} body.seriesId - series for the squad.
 * @property {string} body.teamId - Team for the squad.
 * @property {array} body.playerIds - Player id list for the squad.
 * @property {string} body.activeFeedSource - The current active feed source of squad.
 * @property {string} body.reference - The reference object {feedSource: x, key:y} of squad.
 * @property {string} body.approvalStatus - The approval status of squad.
 * @returns {Object}
 */
async function update(params, body) {
  // Validating param
  const validParam = await validator.update.validate({ params });

  const { id } = validParam.params;

  // Getting series object to be updated
  const existingDoc = await service.findById({ id, autoFormat: false });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  // Validating body
  const validData = await validator.update.validate({ body });

  const validBody = validData.body;
  const promiseList = [];

  if (validBody.reference) {
    // Checking if document exist with same reference
    promiseList[0] = service.checkDuplicate({
      reference: validBody.reference,
      excludedId: existingDoc.id,
      errKey: "body,references",
    });
  }

  if (validBody.seriesId) {
    // Checking if seriesId exist
    promiseList[1] = seriesService.findById({
      id: validBody.seriesId,
      errKey: "body,seriesId",
    });
  }

  if (validBody.teamAId) {
    // Checking if teamAId exist
    promiseList[2] = teamService.findById({
      id: validBody.teamAId,
      errKey: "body,teamAId",
    });
  }

  // TODO: Check if playerIds are unique
  if (validBody.playerIds) {
    // Checking if playerIds are valid
    promiseList[3] = playerService.findByIds({
      ids: validBody.playerIds,
      errKey: "body,playerIds",
    });
  }
  // Waiting for promises to finish
  const promiseListResp = await Promise.all(promiseList);

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  // Updating or adding feedSource key
  if (validBody.reference) {
    // Checking if new feedSource already there in references list
    util.addOrUpdateReference(existingDoc.references, validBody.reference);
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
 * Delete squad.
 * @property {string} params.id - Squad Id.
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
