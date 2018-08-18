import { Router } from 'express';
import * as Controller from '../controllers/rootWiki.controller';

const router = new Router();

router.route('/rootWikis/:id').get((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', 'private, max-age=60');
  }
  next();
}, Controller.getRootWiki);
router.route('/rootWikis').post(Controller.addRootWiki);

export default router;
