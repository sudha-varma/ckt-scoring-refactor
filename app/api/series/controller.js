import util from "../../../utils/util";
import validator from "./validator";
import service from "./service";

/**
 * Get Series
 * @property {string} params.id - Series Id.
 * @property {string} params.feedSource - feed source for the series.
 * @property {string} params.key - key for feedSource for the series.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { id } = validParam.params;

  // Getting series details
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
 * Get series list.
 * @property {array} query.filters - Array of series filters.
 * @property {array} query.approvalStatus - Array of approval status.
 * @property {array} query.format - Array of series formats.
 * @property {array} query.liveStatus - Array of series live status.
 * @property {number} query.skip - Number of series to be skipped.
 * @property {number} query.limit - Limit number of series to be returned.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });
  // Getting series list with filters
  const docs = await service.find({ query: validQuery.query });
  console.log(docs)
  return docs;
}

/**
 * Create new series
 * @property {string} body.name - The name of series.
 * @property {string} body.shortName - The short name of series.
 * @property {string} body.displayName - The display name of series.
 * @property {string} body.format - The format of series.
 * @property {string} body.filters - The filters type for the series.
 * @property {string} body.liveStatus - The liveStatus for the series.
 * @property {date} body.startDate - The start date of series.
 * @property {date} body.endDate - The end date of series.
 * @property {string} body.activeFeedSource - The current active feed source of series.
 * @property {object} body.reference - The reference object {feedSource: x, key:y} of series.
 * @property {string} body.approvalStatus - The approval status of series.
 * @returns {Object}
 */
async function create(body) {
  // Validating body
  const validData = await validator.create.validate({ body });
  const validBody = validData.body;
  const promiseList = [];

  if (validBody.reference) {
    // Checking if document exist with same reference
    promiseList.push(
      service.checkDuplicate({
        reference: validBody.reference,
        errKey: "body,references",
        autoFormat: true,
      }),
    );
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

  // Creating new series
  const newDoc = await service.create({ data: validBody });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  return newDoc;
}

/**
 * Update existing series
 * @property {string} params.id - Series Id.
 * @property {string} body.name - The name of series.
 * @property {string} body.shortName - The short name of series.
 * @property {string} body.displayName - The display name of series.
 * @property {string} body.format - The format of series.
 * @property {string} body.filters - The filters type for the series.
 * @property {string} body.liveStatus - The liveStatus for the series.
 * @property {date} body.startDate - The start date of series.
 * @property {date} body.endDate - The end date of series.
 * @property {string} body.activeFeedSource - The current active feed source of series.
 * @property {object} body.reference - The reference object {feedSource: x, key:y} of series.
 * @property {string} body.approvalStatus - The approval status of series.
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

  // Checking if "reference" update is requested
  if (validBody.reference) {
    // Checking if document exist with same reference
    promiseList.push(
      service.checkDuplicate({
        reference: validBody.reference,
        excludedId: existingDoc.id,
        errKey: "body,references",
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
 * Delete series.
 * @property {string} params.id - Series Id.
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
