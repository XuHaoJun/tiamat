import { Router } from 'express';
import passport from 'passport';
import login from 'connect-ensure-login';

import Controller from '../controllers/discussion.controller';

const router = new Router();

router.route('/forumBoards/:forumBoardId/rootDiscussions').get(Controller.getRootDiscussions);

router.route('/discussions/:id').get((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', 'private, max-age=15');
  }
  next();
}, Controller.getDiscussionById);

router.route('/discussions/:id/childDiscussions').get(Controller.getChildDiscussions);

router.route('/discussion').get((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', 'private, max-age=15');
  }
  next();
}, Controller.getDiscussionByTest);

router
  .route('/discussions')
  .post(
    passport.authenticate('bearer-jwt', { session: false }),
    login.ensureLoggedIn(),
    Controller.addDiscussion
  );

export default router;
