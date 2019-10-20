import messages from "../../../localization/en";
import logger from "../../../utils/logger";
import util from "../../../utils/util";

/**
 * Finding documents with provided query params
 * @property {object} Model - Mongoose model object.
 * @property {object} query - object containing params to prepare query.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {documents[]}
 */
async function find({
  Model,
  query,
  customFilters = false,
  autoFormat = true,
}) {
  const {
    limit = 50,
    skip = 0,
    filters,
    approvalStatus,
    format,
    liveStatus,
    sortBy,
  } = query;

  // preparing query filters
  let filterCriteria = {
    $or:[{ status: "active"},{record_status : "active"}]
  };
  if (filters) {
    filters.forEach(filter => {
      filterCriteria[`filters.${filter}`] = true;
    });
  }
  if (approvalStatus) {
    filterCriteria.approvalStatus = { $in: approvalStatus };
  }
  if (format) {
    filterCriteria.format = { $in: format };
  }
  if (liveStatus) {
    filterCriteria.liveStatus = { $in: liveStatus };
  }

  if (customFilters) {
    filterCriteria = { ...filterCriteria, ...customFilters };
  }
  console.log(filterCriteria)

  // Getting documents with available filters
  const docs = await Model.find(filterCriteria)
    .sort(util.parseSortBy(sortBy))
    .skip(+skip)
    .limit(+limit);

  // Returning formatted response if autoFormat true
  if (autoFormat) {
    return {
      status: 200,
      data: docs,
      message: messages.SUCCESSFULL,
    };
  }

  // Otherwise returned db object
  return docs;
}

/**
 * Finding document with id
 * @property {object} Model - Mongoose model object.
 * @property {string} id - document id.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findById({ Model, id, errKey, autoFormat = true }) {
  // Getting document with id
  const existingDoc = await Model.findOne({
    _id: id,
    $or:[{ status: "active"},{record_status : "active"}]
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
 * Finding document with reference
 * @property {object} Model - Mongoose model object.
 * @property {object} reference - The reference object {feedSource: x, key:y}.
 * @property {string} excludedId - document id to be excluded.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findByReference({
  Model,
  reference,
  excludedId,
  errKey,
  autoFormat = true,
}) {
  const filterCriteria = {
    references: { $elemMatch: reference },
    $or:[{ status: "active"},{record_status : "active"}]
  };
  if (excludedId) {
    filterCriteria._id = { $ne: excludedId }; // eslint-disable-line no-underscore-dangle
  }

  // Getting document with reference
  const existingRefDoc = await Model.findOne(filterCriteria);

  // Returning doc if exist
  if (existingRefDoc !== null) {
    // Returning formatted response if autoFormat true
    if (autoFormat) {
      return {
        status: 200,
        data: existingRefDoc,
        message: messages.SUCCESSFULL,
      };
    }

    // Otherwise returned db object
    return existingRefDoc;
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
 * Checking if document exist with reference
 * @property {object} Model - Mongoose model object.
 * @property {object} reference - The reference object {feedSource: x, key:y}.
 * @property {string} excludedId - document id to be excluded.
 * @property {string} errKey - key for which error object will be generated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {boolean/document}
 */
async function checkDuplicate({
  Model,
  reference,
  excludedId,
  errKey,
  autoFormat = true,
}) {
  // Checking if doc exist
  const existingRefDoc = await findByReference({
    Model,
    reference,
    excludedId,
    autoFormat: false,
  });

  // Returning true if exist
  if (existingRefDoc.error) {
    return true;
  }
  if (existingRefDoc !== null) {
    // Returning formatted response if autoFormat true
    if (autoFormat) {
      const errObj = {
        error: {
          status: 409,
          message: messages.ALREADY_EXIST,
          conflictKey: existingRefDoc.id,
          conflictObj: existingRefDoc,
        },
      };
      if (errKey) {
        errObj.error.data = [
          {
            [errKey]: "Reference with same source and key already exist",
          },
        ];
      }
      return errObj;
    }

    // Otherwise returned db object
    return existingRefDoc;
  }
  return true;
}

/**
 * Creating document
 * @property {object} Model - Mongoose model object.
 * @property {object} data - document properties.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function create({ Model, data, autoFormat = true }) {
  // Creating new document
  const newDoc = new Model(data);
  const savedDoc = await newDoc.save();

  // Returning formatted response if autoFormat true
  if (autoFormat) {
    return {
      status: 201,
      data: savedDoc,
      message: messages.CREATED,
    };
  }

  // Otherwise returned db object
  return savedDoc;
}

/**
 * Updating document
 * @property {object} data - document properties.
 * @property {document} existingDoc - document which needs to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function updateExisting({ data, existingDoc, autoFormat = true }) {
  // Updating existing document with new data
  if (data) {
    existingDoc.set(data);
  }
  const savedDoc = await existingDoc.save();

  // Returning error obj if does not exist
  if (savedDoc === null) {
    return {
      error: {
        status: 404,
        message: messages.NOT_FOUND,
      },
    };
  }

  // Returning formatted response if autoFormat true
  if (autoFormat) {
    return {
      status: 200,
      data: savedDoc,
      message: messages.UPDATED,
    };
  }

  // Otherwise returned db object
  return savedDoc;
}

/**
 * Updating document
 * @property {object} Model - Mongoose model object.
 * @property {object} data - document properties.
 * @property {object} filterCriteria - criteria to fetch document to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function update({ Model, data, filterCriteria, autoFormat = true }) {
  // Getting and updating document
  const savedDoc = await Model.updateMany(filterCriteria, { $set: data });

  // Returning error obj if does not exist
  if (savedDoc.n === 0) {
    return {
      error: {
        status: 404,
        message: messages.NOT_FOUND,
      },
    };
  }

  // If documents found and updated
  if (savedDoc.n !== 0 && savedDoc.nModified !== 0) {
    // Returning formatted response if autoFormat true
    if (autoFormat) {
      return {
        status: 200,
        message: messages.UPDATED,
      };
    }

    // Otherwise returned db object
    return savedDoc;
  }

  // Returing error if no update happened
  logger.error(
    `Unable to update document with ${JSON.stringify(filterCriteria)}`,
  );
  return {
    error: {
      status: 422,
      message: `Unable to update`,
    },
  };
}

/**
 * Updating document
 * @property {object} Model - Mongoose model object.
 * @property {object} data - document properties.
 * @property {object} filterCriteria - criteria to fetch document to be updated.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function findOneAndUpdate({
  Model,
  data,
  filterCriteria,
  autoFormat = true,
}) {
  // Getting and updating document
  let savedDoc;
  try {
    savedDoc = await Model.findOneAndUpdate(filterCriteria, data, {
      upsert: true,
      new: true,
      overwrite: true,
    });
  } catch (err) {
    if (err.code === 11000) {
      logger.error("findOneAndUpdate failed");
      // Another upsert occurred during the upsert, try again. You could omit the
      // upsert option here if you don't ever delete docs while this is running.
      try {
        savedDoc = await Model.findOneAndUpdate(filterCriteria, data, {
          upsert: true,
          new: true,
          overwrite: true,
        });
      } catch (e) {
        logger.error(e.message);
      }
    }
  }

  // If documents found and updated
  if (savedDoc) {
    // Returning formatted response if autoFormat true
    if (autoFormat) {
      return {
        status: 201,
        data: savedDoc,
        message: messages.CREATED,
      };
    }

    // Otherwise returned db object
    return savedDoc;
  }

  // Returing error if no update happened
  logger.error(
    `Unable to update document with ${JSON.stringify(filterCriteria)}`,
  );
  return {
    error: {
      status: 422,
      message: `Unable to update`,
    },
  };
}

/**
 * Pseudo delete document
 * @property {object} Model - Mongoose model object.
 * @property {string} id - document id to be removed.
 * @property {boolean} autoFormat - false if formatted output not needed.
 * @returns {document}
 */
async function removeById({ Model, id, autoFormat = true }) {
  // Getting and updating document with status=deleted
  const filterCriteria = { _id: id, status: "active" };
  const deletedDoc = await update({
    Model,
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

export default {
  find,
  findById,
  findByReference,
  checkDuplicate,
  create,
  update,
  findOneAndUpdate,
  updateExisting,
  removeById,
};
