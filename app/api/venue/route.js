import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new venue (accessed at POST /api/venues)
  .post(c(controller.create, ({ body }) => [body]))
  // list all venues (accessed at GET /api/venues)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update venue (accessed at PUT /api/venues/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove venue (accessed at DELETE /api/venues/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get venue (accessed at GET /api/venues/:id)
  .get(c(controller.get, ({ params }) => [params]));

router
  .route("/:feedSource/:key")
  // get venue (accessed at GET /api/venues/:feedSource/:key)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
