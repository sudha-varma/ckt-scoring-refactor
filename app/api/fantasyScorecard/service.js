import messages from "../../../localization/en";
import FantasyScoreCard from "./model";
import commonService from "../../helpers/services/commonService";

/**
 * Finding documents with provided query params
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({ query, autoFormat = true }) {
  const res = await commonService.find({
    Model: FantasyScoreCard,
    query,
    autoFormat,
  });
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
    Model: FantasyScoreCard,
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
    Model: FantasyScoreCard,
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
    Model: FantasyScoreCard,
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
    Model: FantasyScoreCard,
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
    Model: FantasyScoreCard,
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
    Model: FantasyScoreCard,
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
    Model: FantasyScoreCard,
    id,
    autoFormat,
  });
  return res;
}

/**
 * Pseudo delete document
 * @property {string} matchId - matchId for which FantasyScoreCard to be removed.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function removeByMatchId({ matchId, autoFormat = true }) {
  // Getting and updating document with status=deleted
  const filterCriteria = { matchId, status: "active" };
  const deletedDoc = await update({
    FantasyScoreCard,
    filterCriteria,
    data: { status: "deleted" },
  });

  // Returning error returned from update method
  if (deletedDoc.error) {
    return deletedDoc;
  }

  // Returning formatted response if autoFormat true
  if (autoFormat) {
    return {
      status: 200,
      message: messages.DELETED,
    };
  }

  // Otherwise returned db object
  return deletedDoc;
}

/**
 * Finding document with matchId
 * @property {string} matchId - matchId for which FantasyScoreCard to be fetched.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findByMatchId({ matchId, errKey, autoFormat = true }) {
  // Getting document with matchId
  const existingDoc = await FantasyScoreCard.findOne({
    matchId,
    status: "active",
  });

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

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {string} matchId - matchId of document to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findByMatchIdAndUpdate({ data, matchId, autoFormat = true }) {
  const filterCriteria = {
    matchId,
    status: "active",
  };
  const res = await commonService.findOneAndUpdate({
    Model: FantasyScoreCard,
    data,
    filterCriteria,
    autoFormat,
  });
  return res;
}

export default {
  find,
  findById,
  findByMatchId,
  findByReference,
  checkDuplicate,
  create,
  update,
  updateExisting,
  removeById,
  removeByMatchId,
  findByMatchIdAndUpdate,
};
