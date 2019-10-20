import BallByBall from "./model";
import commonService from "../../helpers/services/commonService";

/**
 * Finding documents with provided query params
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({ query, autoFormat = true }) {
  const queryCopy = query;
  const { matchId, highlights, latestId, lastId } = query;
  const filterCriteria = {
    status: "active",
  };
  if (highlights) {
    filterCriteria.highlights = { $in: highlights };
  }
  if (matchId) {
    filterCriteria.matchId = matchId;
  }
  if (latestId) {
    filterCriteria._id = { $gt: latestId }; // eslint-disable-line no-underscore-dangle
  }
  if (lastId) {
    filterCriteria._id = { $lt: lastId }; // eslint-disable-line no-underscore-dangle
    queryCopy.skip = 0;
  }

  const res = await commonService.find({
    Model: BallByBall,
    customFilters: filterCriteria,
    query: queryCopy,
    autoFormat,
  });
  return res;
}

/**
 * Finding document with id
 * @property {string} id - document id.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document/Object}
 */
async function findById({ id, errKey, autoFormat = true }) {
  const res = await commonService.findById({
    Model: BallByBall,
    id,
    errKey,
    autoFormat,
  });
  return res;
}

/**
 * Finding document with reference
 * @property {object} reference - The reference object {feedSource: x, key:y}.
 * @property {string} excludedId - document id to be excluded.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document/Object}
 */
async function findByReference({
  reference,
  excludedId,
  errKey,
  autoFormat = true,
}) {
  const res = await commonService.findByReference({
    Model: BallByBall,
    reference,
    excludedId,
    errKey,
    autoFormat,
  });
  return res;
}

/**
 * Checking if document exist with reference
 * @property {object} reference - The reference object {feedSource: x, key:y}.
 * @property {string} excludedId - document id to be excluded.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {boolean/document}
 */
async function checkDuplicate({
  reference,
  excludedId,
  errKey,
  autoFormat = true,
}) {
  const res = await commonService.checkDuplicate({
    Model: BallByBall,
    reference,
    excludedId,
    errKey,
    autoFormat,
  });
  return res;
}

/**
 * Creating document
 * @property {object} data - document properties.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function create({ data, autoFormat = true }) {
  const res = await commonService.create({
    Model: BallByBall,
    data,
    autoFormat,
  });
  return res;
}

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {document} existingDoc - document which needs to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function updateExisting({ data, existingDoc, autoFormat = true }) {
  const res = await commonService.updateExisting({
    Model: BallByBall,
    data,
    existingDoc,
    autoFormat,
  });
  return res;
}

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {object} filterCriteria - criteria to fetch document to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function update({ data, filterCriteria, autoFormat = true }) {
  const res = await commonService.update({
    Model: BallByBall,
    data,
    filterCriteria,
    autoFormat,
  });
  return res;
}

/**
 * Pseudo delete document
 * @property {string} id - document id to be removed.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function removeById({ id, autoFormat = true }) {
  const res = await commonService.removeById({
    Model: BallByBall,
    id,
    autoFormat,
  });
  return res;
}

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {string} uniqueFields - unique fields of the ball to fetch document to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findByBallUniqueFieldsAndUpdate({
  data,
  uniqueFields,
  autoFormat = true,
}) {
  const filterCriteria = {
    status: "active",
    ...uniqueFields,
  };
  const res = await commonService.findOneAndUpdate({
    Model: BallByBall,
    data,
    filterCriteria,
    autoFormat,
  });
  return res;
}

export default {
  find,
  findById,
  findByReference,
  checkDuplicate,
  create,
  update,
  updateExisting,
  removeById,
  findByBallUniqueFieldsAndUpdate,
};
