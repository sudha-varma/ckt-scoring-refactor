import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new match (accessed at POST /api/matches)
  .post(c(controller.create, ({ body }) => [body]))
  // list all matches (accessed at GET /api/matches)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update match (accessed at PUT /api/matches/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove match (accessed at DELETE /api/matches/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get match (accessed at GET /api/matches/:id)
  .get(c(controller.get, ({ params }) => [params]));

router
  .route("/:feedSource/:key")
  // get match (accessed at GET /api/matches/:feedSource/:key)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
