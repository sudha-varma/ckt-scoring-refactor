import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new squad (accessed at POST /api/squads)
  .post(c(controller.create, ({ body }) => [body]))
  // list all squads (accessed at GET /api/squads)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update squad (accessed at PUT /api/squads/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove squad (accessed at DELETE /api/squads/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get squad (accessed at GET /api/squads/:id)
  .get(c(controller.get, ({ params }) => [params]));

router
  .route("/:feedSource/:key")
  // get squad (accessed at GET /api/squads/:feedSource/:key)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
