import { Router } from "express";
import * as Controller from "../controllers/image.controller";

const router = new Router();

// Add a new image
router.route("/images").post(Controller.addImage);

export default router;
