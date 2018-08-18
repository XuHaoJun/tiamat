import { Router } from 'express';
import * as Controller from '../controllers/forumBoard.controller';

const router = new Router();

router.route('/forumBoards').get(Controller.getForumBoards);

router.route('/forumBoards/:id').get((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', 'private, max-age=60');
  }
  next();
}, Controller.getForumBoard);

router.route('/forumBoards').post(Controller.addForumBoard);

export default router;
