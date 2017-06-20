import {Router} from 'express';
import * as Controller from '../controllers/discussion.controller';

const router = new Router();

// Get all Posts
router.route('/forumBoards/:forumBoardId/rootDiscussions').get(Controller.getRootDiscussions);

// Get one post by cuid
router.route('/discussions/:id').get(Controller.getDiscussion);

// Get one post by cuid
router.route('/discussions').get(Controller.getDiscussions);

// Add a new Post
router.route('/discussions').post(Controller.addDiscussion);

// Delete a post by cuid
// router.route('/discussios/:id').delete(Controller.deletePost);

export default router;
