import { Router } from "express";
import * as Controller from "../controllers/forumBoard.controller";

const router = new Router();

// Get all Posts
router.route("/forumBoards").get(Controller.getForumBoards);

router.route("/forumBoards/:id").get(Controller.getForumBoard);

router.route("/forumBoards").post(Controller.addForumBoard);

// Add a new Post
// router.route('/discussions').post(Controller.addPost);

// Delete a post by cuid
// router.route('/discussios/:id').delete(Controller.deletePost);

export default router;
