import { Router } from 'express';
import passport from 'passport';
import login from 'connect-ensure-login';
import * as Controller from '../controllers/user.controller';

const router = new Router();

router.get('/validates/user', Controller.validateUser);

router.get(
  // TODO
  // rename to another better route path?
  '/currentUser',
  passport.authenticate('bearer-jwt', { session: false }),
  login.ensureLoggedIn(),
  (req, res, next) => {
    req.params.id = req.user._id.toString();
    next();
  },
  Controller.getUser
);

router.get(
  '/users/:id',
  passport.authenticate('bearer-jwt', { session: false }),
  Controller.getUser
);

router.post('/users', Controller.addUser);

export default router;
