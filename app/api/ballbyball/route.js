import express from "express";
import c from "../../../utils/controlHandler";
import controller from "./controller";

const router = express.Router();

router
  .route("/")
  // create new ballbyball (accessed at POST /api/ballbyballs)
  .post(c(controller.create, ({ body }) => [body]))
  // list all ballbyballs (accessed at GET /api/ballbyballs)
  .get(c(controller.list, ({ query }) => [query]));

router
  .route("/:id")
  // update ballbyball (accessed at PUT /api/ballbyballs/:id)
  .put(c(controller.update, ({ params, body }) => [params, body]))
  // remove ballbyball (accessed at DELETE /api/ballbyballs/:id)
  .delete(c(controller.remove, ({ params }) => [params]))
  // get ballbyball (accessed at GET /api/ballbyballs/:id)
  .get(c(controller.get, ({ params }) => [params]));

export default router;
