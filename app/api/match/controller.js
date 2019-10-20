import util from "../../../utils/util";
import validator from "./validator";
import service from "./service";
import seriesService from "../series/service";
import teamService from "../team/service";
import venueService from "../venue/service";
import scorecardService from "../scorecard/service";
import { pushQueue, redisClient } from "../../../utils/redis";
import logger from "../../../utils/logger";

/**
 * Get Match
 * @property {string} params.id - Match Id.
 * @property {string} params.feedSource - feed source for the match.
 * @property {string} params.key - key for feedSource for the match.
 * @returns {Object}
 */
async function get(params) {
  // Validating param
  const validParam = await validator.get.validate({ params });
  const { id } = validParam.params;

  // Getting match details
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
  util.FilterErrorAndThrow(existingDoc);
  return existingDoc;
}

/**
 * Get matches list.
 * @property {array} query.filters - Array of match filters.
 * @property {array} query.approvalStatus - Array of approval status.
 * @property {array} query.format - Array of match formats.
 * @property {array} query.liveStatus - Array of match live status.
 * @property {number} query.skip - Number of matches to be skipped.
 * @property {number} query.limit - Limit number of matches to be returned.
 * @property {array} query.sortBy - keys to use to record sorting.
 * @returns {Object}
 */
async function list(query) {
  // Validating query
  const validQuery = await validator.list.validate({ query });

  // Getting match list with filters
  const docs = await service.find({ query: validQuery.query });
  return docs;
}

/**
 * Create match
 * @property {string} body.name - The name of match.
 * @property {string} body.shortName - The short name of match.
 * @property {string} body.secondaryName - The secondary name of match.
 * @property {number} body.number - Number for the match.
 * @property {date} body.startDate - The start date of match.
 * @property {date} body.endDate - The end date of match.
 * @property {string} body.activeFeedSource - The current active feed source of match.
 * @property {string} body.activePredictionSource - The current active prediction source of match.
 * @property {string} body.reference - The reference object {feedSource: x, key:y} of match.
 * @property {string} body.approvalStatus - The approval status of match.
 * @property {string} body.liveStatus - The live status of match.
 * @property {string} body.format - The format of match.
 * @property {string} body.filters - The filters type for the match.
 * @property {string} body.seriesId - series for the match.
 * @property {string} body.teamAId - Team A for the match.
 * @property {string} body.teamBId - Team B for the match.
 * @property {string} body.winnerTeamId - Team who won the match.
 * @property {string} body.teamASuad - List of teamA players for the match.
 * @property {string} body.teamBSuad - List of teamB players for the match.
 * @property {string} body.teamAPlayingXi - List of teamA playing x1 for the match.
 * @property {string} body.teamBPlayingXi - List of teamB playing x1 for the match.
 * @property {string} body.venueId - The venue for the match.
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

  if (validBody.teamBId) {
    // Checking if teamBId exist
    promiseList[3] = teamService.findById({
      id: validBody.teamBId,
      errKey: "body,teamBId",
    });
  }

  if (validBody.venueId) {
    // Checking if venueId exist
    promiseList[4] = venueService.findById({
      id: validBody.venueId,
      errKey: "body,venueId",
    });
  }
  // TODO: validate teamASquad,teamBSquad,teamAPlayingXi,teamBPlayingXi,winnerTeamId
  // Waiting for promises to finish
  const promiseListResp = await Promise.all(promiseList);

  console.log(promiseListResp)

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(promiseListResp);

  // Adding reference as references array
  validBody.references = [validBody.reference];

  // Converting filter array to object
  if (validBody.filters) {
    validBody.filters = util.ArrayToObj(validBody.filters);
  }

  // Creating new match
  const newDoc = await service.create({ data: validBody });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(newDoc);

  // Updating series table with match ref
  let series;
  if (promiseListResp[1]) {
    [, series] = promiseListResp;
    series.matches.push(newDoc.data.id);
  }

  // Updating series table with teamA and teamB object
  const newTeamList = [];
  if (promiseListResp[2]) {
    newTeamList.push(promiseListResp[2]);
  }
  if (promiseListResp[3]) {
    newTeamList.push(promiseListResp[3]);
  }
  // Checking if object already exist in teamList
  newTeamList.forEach(team => {
    const existingObj = series.teams.find(obj => obj && obj.id === team.id);
    if (!existingObj) {
      series.teams.push(team);
    }
  });

  // Updating series table with venue object
  if (promiseListResp[4]) {
    // Checking if object already exist in venueList
    const venue = promiseListResp[4];
    const existingObj = series.venues.find(obj => obj && obj.id === venue.id);
    if (!existingObj) {
      series.venues.push(venue);
    }
  }

  // Updating new data to document
  const newSeriesDoc = await seriesService.updateExisting({
    existingDoc: series,
    autoFormat: false,
  });

  if (newSeriesDoc.error) {
    logger.error("Failed to add Match info to series list");
  } else {
    logger.info("Match info added to series list");
  }

  return newDoc;
}

/**
 * Update existing match
 * @property {string} params.id - Match Id.
 * @property {string} body.name - The name of match.
 * @property {string} body.shortName - The short name of match.
 * @property {string} body.secondaryName - The secondary name of match.
 * @property {number} body.number - Number for the match.
 * @property {date} body.startDate - The start date of match.
 * @property {date} body.endDate - The end date of match.
 * @property {string} body.activeFeedSource - The current active feed source of match.
 * @property {string} body.activePredictionSource - The current active prediction source of match.
 * @property {string} body.reference - The reference object {feedSource: x, key:y} of match.
 * @property {string} body.approvalStatus - The approval status of match.
 * @property {string} body.liveStatus - The live status of match.
 * @property {string} body.format - The format of match.
 * @property {string} body.filters - The filters type for the match.
 * @property {string} body.liveStatus - The live status for the match.
 * @property {string} body.seriesId - series for the match.
 * @property {string} body.teamAId - Team A for the match.
 * @property {string} body.teamBId - Team B for the match.
 * @property {string} body.winnerTeamId - Team who won the match.
 * @property {string} body.teamASuad - List of teamA players for the match.
 * @property {string} body.teamBSuad - List of teamB players for the match.
 * @property {string} body.teamAPlayingXi - List of teamA playing x1 for the match.
 * @property {string} body.teamBPlayingXi - List of teamB playing x1 for the match.
 * @property {string} body.venueId - The venue for the match.
 * @returns {Object}
 */
async function update(params, body) {
  // Validating param
  const validParam = await validator.update.validate({ params });

  const { id } = validParam.params;

  // Getting match object to be updated
  // findMatchById will populate series and venue object as well
  const existingDoc = await service.findMatchById({ id, autoFormat: false });

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

  if (validBody.teamBId) {
    // Checking if teamBId exist
    promiseList[3] = teamService.findById({
      id: validBody.teamBId,
      errKey: "body,teamBId",
    });
  }

  if (validBody.venueId) {
    // Checking if venueId exist
    promiseList[4] = venueService.findById({
      id: validBody.venueId,
      errKey: "body,venueId",
    });
  }

  // TODO: validate teamASquad,teamBSquad,teamAPlayingXi,teamBPlayingXi,winnerTeamId
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

  const existingFilters = existingDoc.filters;
  const existingLiveStatus = existingDoc.liveStatus;

  // Updating new data to document
  const savedMatch = await service.updateExisting({
    existingDoc,
    data: validBody,
  });

  // Throwing error if promise response has any error object
  util.FilterErrorAndThrow(savedMatch);

  const savedDoc = savedMatch.data;

  // Updating series table with match ref
  let series;
  if (promiseListResp[1]) {
    [, series] = promiseListResp;
  } else {
    series = savedDoc.seriesId;
  }
  // Checking if object already exist in matches
  if (series.matches.indexOf(savedDoc.id) === -1) {
    series.matches.push(savedDoc.id);
  }

  // Updating series table with teamA and teamB object
  const newTeamList = [];
  if (promiseListResp[2]) {
    newTeamList.push(promiseListResp[2]);
  }
  if (promiseListResp[3]) {
    newTeamList.push(promiseListResp[3]);
  }
  // Checking if object already exist in teamList
  newTeamList.forEach(team => {
    const existingObj = series.teams.find(obj => obj && obj.id === team.id);
    if (!existingObj) {
      series.teams.push(team);
    }
  });

  // Updating series table with venue object
  // Checking if object already exist in venueList
  if (promiseListResp[4]) {
    const venue = promiseListResp[4];
    const existingObj = series.venues.find(obj => obj && obj.id === venue.id);
    if (!existingObj) {
      series.venues.push(venue);
    }
  }

  if (validBody.filters) {
    const scorecardDoc = await scorecardService.findByMatchIdAndUpdate({
      matchId: savedDoc.id,
      data: { filters: validBody.filters },
    });
    if (scorecardDoc.error) {
      logger.error(`Unable to update Scorecard with matchId: ${savedDoc.id}`);
    } else {
      logger.info(`Scorecard updated with matchId: ${savedDoc.id}`);
    }
  }

  // Updating new data to document
  const newSeriesDoc = await seriesService.updateExisting({
    existingDoc: series,
    autoFormat: false,
  });
  if (newSeriesDoc.error) {
    logger.error("Failed to add Match info to series list");
  } else {
    logger.info("Match info added to series list");
  }

  // TODO: Think about what to do with previously
  // linked series, team and venue if updated

  // Creating newLiveMatch entry to redis if liveStatus is changing to ongoing
  if (
    existingLiveStatus !== "ongoing" &&
    validBody.liveStatus &&
    validBody.liveStatus === "ongoing"
  ) {
    // Adding task for parser to update scorecard in redis
    const feedRef = savedDoc.references.find(
      ref => ref.feedSource === savedDoc.activeFeedSource,
    );
    const predRef = savedDoc.references.find(
      ref => ref.feedSource === savedDoc.activePredictionSource,
    );
    const work = {
      matchId: savedDoc.id,
      feedSource: feedRef && feedRef.feedSource,
      feedSourceKey: feedRef && feedRef.key,
      predictionSource: predRef && predRef.feedSource,
      predictionSourceKey: predRef && predRef.key,
    };

    try {
      console.log(work)
      const redisReply = await pushQueue("newLiveMatch", work, (err, reply) => {
        if (err === null && reply !== null) {
          logger.info(JSON.stringify(reply));
        } else {
          logger.error(JSON.stringify(err));
        }
      });
    } catch (err) {
      logger.error(JSON.stringify(err));
    }
  }
  // Creating newFeaturedMatch entry to redis if featured filter is added
  if (validBody.filters) {
    const isNewFeatured = validBody.filters.featured;
    const isAlreadyFeatured = existingFilters.featured;
    if (isNewFeatured && !isAlreadyFeatured) {
      // Adding task for parser to update scorecard in redis
      const feedRef = savedDoc.references.find(
        ref => ref.feedSource === savedDoc.activeFeedSource,
      );
      const predRef = savedDoc.references.find(
        ref => ref.feedSource === savedDoc.activePredictionSource,
      );
      const work = {
        matchId: savedDoc.id,
        feedSource: feedRef && feedRef.feedSource,
        feedSourceKey: feedRef && feedRef.key,
        predictionSource: predRef && predRef.feedSource,
        predictionSourceKey: predRef && predRef.key,
      };

      try {
        const redisReply = await pushQueue("newFeaturedMatch", work);
        logger.info(JSON.stringify(redisReply));
      } catch (err) {
        logger.error(JSON.stringify(err));
      }
    }
    // removing match data from redis if featured filter is removed
    if (isAlreadyFeatured && !isNewFeatured) {
      const keys = [
        `${savedDoc.id}MicroScorecard`,
        `${savedDoc.id}FullScorecard`,
        `${savedDoc.id}SummaryScorecard`,
        `${savedDoc.id}Prediction`,
      ];

      try {
        const redisReply = await redisClient.delAsync(keys);
        if (redisReply === 1) {
          const redisFeaturedMatches = await redisClient.getAsync(
            `featuredMatches`,
          );
          if (redisFeaturedMatches) {
            const featuredMatches = JSON.parse(redisFeaturedMatches);
            const updatedRedisFeaturedMatches = await redisClient.setAsync(
              `featuredMatches`,
              JSON.stringify(
                featuredMatches.filter(
                  featuredMatche => featuredMatche !== savedDoc.id,
                ),
              ),
            );
            if (updatedRedisFeaturedMatches) {
              logger.info("Removed match from featured list");
            } else {
              logger.error(`Unable to remove data from from featured list`);
            }
          }

          logger.info("Match data removed from redis");
        } else {
          logger.error(
            `Unable to remove data from redis for matchId: ${savedDoc.id}`,
          );
        }
      } catch (err) {
        logger.error(
          `Unable to remove data from redis for matchId: ${savedDoc.id}`,
        );
        logger.error(JSON.stringify(err));
      }
    }
  }

  return savedMatch;
}

/**
 * Delete match.
 * @property {string} params.id - Match Id.
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
