import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();
router
  .route("/")
  // create new series (accessed at POST /api/series)
  .post(c(controller.create, ({ body }) => [body]))
  // list all series (accessed at GET /api/series)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update series (accessed at PUT /api/series/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove series (accessed at DELETE /api/series/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get series (accessed at GET /api/series/:id)
  .get(c(controller.get, ({ params }) => [params]));

router
  .route("/:feedSource/:key")
  // get series (accessed at GET /api/series/:feedSource/:key)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
