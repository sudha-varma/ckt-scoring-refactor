import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new team (accessed at POST /api/teams)
  .post(c(controller.create, ({ body }) => [body]))
  // list all teams (accessed at GET /api/teams)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update team (accessed at PUT /api/teams/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove team (accessed at DELETE /api/teams/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get team (accessed at GET /api/teams/:id)
  .get(c(controller.get, ({ params }) => [params]));

router
  .route("/:feedSource/:key")
  // get team (accessed at GET /api/teams/:feedSource/:key)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
