import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new scorecard (accessed at POST /api/scorecards)
  .post(c(controller.create, ({ body }) => [body]))
  // list all scorecards (accessed at GET /api/scorecards)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:matchId")
  // update scorecard (accessed at PUT /api/scorecards/:matchId)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove scorecard (accessed at DELETE /api/scorecards/:matchId)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get scorecard (accessed at GET /api/scorecards/:matchId)
  .get(c(controller.get, ({ params, query }) => [params, query]));

export default router;
