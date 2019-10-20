import Joi from "joi";
import constants from "../../helpers/constants";
import commonValidator from "../../helpers/validators/commonValidator";

export default {
  // GET /api/series/:id
  get: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId,
      feedSource: Joi.any().valid(constants.feedSourceTypes),
      key: Joi.string(),
    })
      .xor("id", "feedSource")
      .and("feedSource", "key"),
  }),

  // GET /api/series
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(
        Joi.any().valid(constants.sortByKeys.concat("featured", "-featured")),
      ),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.seriesFilterTypes)
          .required(),
      ),
      approvalStatus: Joi.array().items(
        Joi.any()
          .valid(constants.approvalStatusTypes)
          .required(),
      ),
      format: Joi.array().items(
        Joi.any()
          .valid(constants.seriesFormatTypes)
          .required(),
      ),
      liveStatus: Joi.array().items(
        Joi.any()
          .valid(constants.seriesLiveStatusTypes)
          .required(),
      ),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  }),

  // POST /api/series
  create: Joi.object({
    body: Joi.object({
      name: commonValidator.normalStr.required(),
      displayName: commonValidator.normalStr,
      filters: Joi.array().items(Joi.any().valid(constants.seriesFilterTypes)),
      startDate: Joi.date().required(),
      endDate: Joi.date(),
      feedSource: Joi.any()
        .valid(constants.feedSourceTypes)
        .required(),
      reference: commonValidator.feedReference.required(),
    }).unknown(),
  }),

  // PUT /api/series/:id
  update: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      name: commonValidator.normalStr,
      shortName: commonValidator.shortStr,
      displayName: commonValidator.normalStr,
      format: Joi.array().items(Joi.any().valid(constants.seriesFormatTypes)),
      filters: Joi.array().items(Joi.any().valid(constants.seriesFilterTypes)),
      liveStatus: Joi.any().valid(constants.seriesLiveStatusTypes),
      startDate: Joi.date(),
      endDate: Joi.date().min(Joi.ref("startDate")),
      activeFeedSource: Joi.any().valid(constants.feedSourceTypes),
      reference: commonValidator.feedReference,
      approvalStatus: Joi.any().valid(constants.approvalStatusTypes),
    }),
  }),

  // DELETE /api/series/:id
  remove: Joi.object({
    params: Joi.object({
      id: commonValidator.validMongoId.required(),
    }),
  }),
};
