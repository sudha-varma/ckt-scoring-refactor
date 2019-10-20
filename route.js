import express from "express";
import seriesRoutes from "./app/api/series/route";
import teamRoutes from "./app/api/team/route";
import playerRoutes from "./app/api/player/route";
import matchRoutes from "./app/api/match/route";
import venueRoutes from "./app/api/venue/route";
import squadRoutes from "./app/api/squad/route";
import scorecardRoutes from "./app/api/scorecard/route";
import ballbyballRoutes from "./app/api/ballbyball/route";
import predictionRoutes from "./app/api/prediction/route";
import fantasyScorecardRoutes from "./app/api/fantasyScorecard/route";

const router = express.Router();

/** GET /health-check - Check service health */
router.get("/health-check", (req, res) => res.send("OK"));

// mount sample routes at /sample
router.use("/series", seriesRoutes);
router.use("/teams", teamRoutes);
router.use("/players", playerRoutes);
router.use("/matches", matchRoutes);
router.use("/venues", venueRoutes);
router.use("/squads", squadRoutes);
router.use("/scorecards", scorecardRoutes);
router.use("/ballbyballs", ballbyballRoutes);
router.use("/predictions", predictionRoutes);
router.use("/fantasy-scorecards", fantasyScorecardRoutes);

export default router;
