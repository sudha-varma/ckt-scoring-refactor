import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new player (accessed at POST /api/players)
  .post(c(controller.create, ({ body }) => [body]))
  // list all players (accessed at GET /api/players)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update player (accessed at PUT /api/players/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove player (accessed at DELETE /api/players/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get player (accessed at GET /api/players/:id)
  .get(c(controller.get, ({ params }) => [params]));

router
  .route("/:feedSource/:key")
  // get player (accessed at GET /api/players/:feedSource/:key)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
