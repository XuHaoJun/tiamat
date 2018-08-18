import { Router } from 'express';
import passport from 'passport';
import login from 'connect-ensure-login';

import * as Controller from '../controllers/wikiDataForm.controller';

const router = new Router();

router.route('/wikiDataForms').get(Controller.getWikiDataForms);
router
  .route('/wikiDataForms')
  .post(
    passport.authenticate('bearer-jwt', { session: false }),
    login.ensureLoggedIn(),
    Controller.addWikiDataForm
  );

export default router;
