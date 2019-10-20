import Match from "./model";
import commonService from "../../helpers/services/commonService";
import messages from "../../../localization/en";

/**
 * Finding documents with provided query params
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({ query, autoFormat = true }) {
  const res = await commonService.find({ Model: Match, query, autoFormat });
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
    Model: Match,
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
    Model: Match,
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
    Model: Match,
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
  const res = await commonService.create({ Model: Match, data, autoFormat });
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
    Model: Match,
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
    Model: Match,
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
  const res = await commonService.removeById({ Model: Match, id, autoFormat });
  return res;
}

/**
 * Finding match document with id including reference document
 * @property {string} id - document id.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findMatchById({ id, errKey, autoFormat = true }) {
  // Getting document with id
  const existingDoc = await Match.findOne({
    _id: id,
    status: "active",
  })
    .populate("seriesId")
    .populate("venueId");

  // Returning doc if exist
  if (existingDoc !== null) {
    // Returning formatted response if autoFormat true
    if (autoFormat) {
      return {
        status: 200,
        data: existingDoc,
        message: messages.SUCCESSFULL,
      };
    }

    // Otherwise returned db object
    return existingDoc;
  }

  // Returning error obj if does not exist
  const errObj = {
    error: {
      status: 404,
      message: messages.NOT_FOUND,
    },
  };
  if (errKey) {
    errObj.error.data = [
      {
        [errKey]: messages.NOT_FOUND,
      },
    ];
  }
  return errObj;
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
  findMatchById,
};
