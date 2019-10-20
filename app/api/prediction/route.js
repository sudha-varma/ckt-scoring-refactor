import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new prediction (accessed at POST /api/predictions)
  .post(c(controller.create, ({ body }) => [body]))
  // list all predictions (accessed at GET /api/predictions)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:matchId")
  // update prediction (accessed at PUT /api/predictions/:matchId)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove prediction (accessed at DELETE /api/predictions/:matchId)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get prediction (accessed at GET /api/predictions/:matchId)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
