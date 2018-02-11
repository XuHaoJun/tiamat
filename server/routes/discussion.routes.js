import { Router } from "express";
import passport from "passport";
import login from "connect-ensure-login";

import Controller from "../controllers/discussion.controller";

const router = new Router();

router
  .route("/forumBoards/:forumBoardId/rootDiscussions")
  .get(Controller.getRootDiscussions);

router.route("/discussions/:id").get(Controller.getDiscussionById);

router.route("/discussion").get(Controller.getDiscussionByTest);

router.route("/discussions").get(Controller.getDiscussions);

router
  .route("/discussions")
  .post(
    passport.authenticate("bearer-jwt", { session: false }),
    login.ensureLoggedIn(),
    Controller.addDiscussion
  );

export default router;
