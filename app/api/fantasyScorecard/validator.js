import Joi from "joi";
import commonValidator from "../../helpers/validators/commonValidator";
import constants from "../../helpers/constants";

export default {
  // GET /api/fantasy-scorecards/:matchId
  get: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
  }),

  // GET /api/fantasy-scorecards
  list: Joi.object({
    query: Joi.object({
      sortBy: Joi.array().items(
        Joi.any().valid(constants.sortByKeys.concat("featured", "-featured")),
      ),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
      filters: Joi.array().items(
        Joi.any()
          .valid(constants.scoreCardFilterTypes)
          .required(),
      ),
    }),
  }),

  // POST /api/fantasy-scorecards
  create: Joi.object({
    body: Joi.object({
      matchId: commonValidator.validMongoId.required(),
      card: Joi.object().required(),
      filters: Joi.array().items(
        Joi.any().valid(constants.scoreCardFilterTypes),
      ),
    }),
  }),

  // PUT /api/fantasy-scorecards/:matchId
  update: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
    body: Joi.object({
      card: Joi.object(),
      filters: Joi.array().items(
        Joi.any().valid(constants.scoreCardFilterTypes),
      ),
    }),
  }),

  // DELETE /api/fantasy-scorecards/:matchId
  remove: Joi.object({
    params: Joi.object({
      matchId: commonValidator.validMongoId.required(),
    }),
  }),
};
