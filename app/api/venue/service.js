import Venue from "./model";
import commonService from "../../helpers/services/commonService";

/**
 * Finding documents with provided query params
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({ query, autoFormat = true }) {
  const res = await commonService.find({ Model: Venue, query, autoFormat });
  return res;
}

/**
 * Finding document with id
 * @property {string} id - document id.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findById({ id, errKey, autoFormat = true }) {
  const res = await commonService.findById({
    Model: Venue,
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
 * @returns {document}
 */
async function findByReference({
  reference,
  excludedId,
  errKey,
  autoFormat = true,
}) {
  const res = await commonService.findByReference({
    Model: Venue,
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
    Model: Venue,
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
  const res = await commonService.create({ Model: Venue, data, autoFormat });
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
    Model: Venue,
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
    Model: Venue,
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
  const res = await commonService.removeById({ Model: Venue, id, autoFormat });
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
};
