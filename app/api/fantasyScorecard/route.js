import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new fantasy scorecard (accessed at POST /api/fantasy-scorecards)
  .post(c(controller.create, ({ body }) => [body]))
  // list all fantasy scorecards (accessed at GET /api/fantasy-scorecards)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:matchId")
  // update fantasy scorecard (accessed at PUT /api/fantasy-scorecards/:matchId)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove fantasy scorecard (accessed at DELETE /api/fantasy-scorecards/:matchId)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get fantasy scorecard (accessed at GET /api/fantasy-scorecards/:matchId)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
