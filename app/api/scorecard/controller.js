import util from "../../../utils/util";
import validator from "./validator";
import service from "./service";
import matchService from "../match/service";
import messages from "../../../localization/en";
import { redisClient } from "../../../utils/redis";
import logger from "../../../utils/logger";

/**
 * Get ScoreCard
 * @property {string} params.matchId - Match Id.
 * @property {string} query.cardType - card type for scorecard.
 * @returns {Object}
 */
async function get(params, query) {
  // Validating param
  const validParam = await validator.get.validate({ params });

  const { matchId } = validParam.params;

  // Validating query
  const validQuery = await validator.get.validate({ query });

  // Getting scoreCard type
  const { cardType = "Micro" } = validQuery.query;

  let redisReplies;
  let error = false;
  // Reading scorecard from redis
  try {
    redisReplies = await redisClient.mgetAsync([
      `${matchId}${cardType}Scorecard`,
      `${matchId}Prediction`,
    ]);
  } catch (err) {
    logger.error(err.message);
    error = true;
  }

  // Merging scorecard and prediciton if redis read successfull
  if (!error && redisReplies && redisReplies[0] && redisReplies[1]) {
    const scorecard = JSON.parse(redisReplies[0]);
    const prediction = JSON.parse(redisReplies[1]);

    if (prediction) {
      delete prediction.history;
      scorecard.prediction = prediction;
    }

    if (scorecard) {
      return {
        status: 200,
        // data: { card: scorecard },
        data: scorecard,
        message: messages.SUCCESSFULL,
      };
    }
  }

  // If unable to get response from redis, serving from mongo
  // Getting scorecard details
  const existingDoc = await service.findByMatchId({ matchId });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(existingDoc);

  return existingDoc;
}

/**
 * Get scorecard list.
 * @property {number} query.skip - Number of scorecard to be skipped.
 * @property {number} query.limit - Limit number of scorecard to be returned.
 * @property {array} query.filters - Array of scorecard filters.
 * @property {string} query.cardType - card type for scorecard.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  const { cardType = "Micro" } = validQuery;

  // Reading featured matches list from redis
  let redisFeaturedMatches;
  let redisError = false;
  try {
    redisFeaturedMatches = await redisClient.getAsync(`featuredMatches`);
    if (!(redisFeaturedMatches && redisFeaturedMatches.length)) {
      redisError = true;
    }
  } catch (err) {
    logger.error(err.message);
    redisError = true;
  }

  // Continue if featured match list found in redis
  if (!redisError) {
    // Forming scoreCardKeys and predictionKeys to be fetched from redis
    const matcheKeys = JSON.parse(redisFeaturedMatches);
    const scoreCardKeys = matcheKeys.map(
      matchKey => `${matchKey}${cardType}Scorecard`,
    );
    const predictionKeys = matcheKeys.map(matchKey => `${matchKey}Prediction`);

    // Reading scorecard and predictions from redis
    let promiseListResp;
    try {
      // Waiting for promises to finish
      promiseListResp = await Promise.all([
        redisClient.mgetAsync(scoreCardKeys),
        redisClient.mgetAsync(predictionKeys),
      ]);
    } catch (err) {
      logger.error(err.message);
      redisError = true;
    }

    if (promiseListResp && promiseListResp.length === 2) {
      const redisScoreCards = promiseListResp[0];
      const redisPredictions = promiseListResp[1];
      const mergedScorecards = [];

      if (redisScoreCards && redisScoreCards.length) {
        redisScoreCards.forEach((scorecard, index) => {
          // if (scorecard && redisPredictions[index]) {
          //   const scorecardCopy = JSON.parse(scorecard);
          //   const predictionCopy = JSON.parse(redisPredictions[index]);
          //   if (predictionCopy) {
          //     delete predictionCopy.history;
          //     scorecardCopy.prediction = predictionCopy;
          //   }
          //   // mergedScorecards.push({ card: scorecardCopy });
          //   mergedScorecards.push(scorecardCopy);
          // }

          // Logic rewritten by Pressy
          // TODO: Remove this once the above logic is corrected
          if (scorecard) {
            const scorecardCopy = JSON.parse(scorecard);

            if (redisPredictions[index]) {
              const predictionCopy = JSON.parse(redisPredictions[index]);
              if (predictionCopy) {
                delete predictionCopy.history;
                scorecardCopy.prediction = predictionCopy;
              }
            }
            // mergedScorecards.push({ card: scorecardCopy });
            mergedScorecards.push(scorecardCopy);
          }
        });
        return {
          status: 200,
          data: mergedScorecards,
          message: messages.SUCCESSFULL,
        };
      }

      redisError = true;
    } else {
      redisError = true;
    }
  }

  if (redisError) {
    // List scorecards from mongo if list not available in redis
    // Getting scorecard list with filters
    const docs = await service.find({ query: validQuery.query });
    return docs;
  }
  return true;
}

/**
 * Create new scorecard
 * @property {string} body.matchId - match id.
 * @property {string} body.card - match scorecard object.
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

  // Creating new scorecard

  const newDoc = await service.findByMatchIdAndUpdate({
    matchId: validBody.matchId,
    data: validBody,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  return newDoc;
}

/**
 * Update existing scorecard
 * @property {string} params.matchId - Match Id.
 * @property {string} body.card - match scorecard object.
 * @returns {Object}
 */
async function update(params, body) {
  // Validating param
  const validParam = await validator.update.validate({ params });

  const { matchId } = validParam.params;

  // Getting scorecard object to be updated
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
 * Delete scorecard.
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
