import { Router } from "express";
import * as Controller from "../controllers/forumBoard.controller";

const router = new Router();

router.route("/forumBoards").get(Controller.getForumBoards);

router.route("/forumBoards/:id").get(Controller.getForumBoard);

router.route("/forumBoards").post(Controller.addForumBoard);

export default router;
