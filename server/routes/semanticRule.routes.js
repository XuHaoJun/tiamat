import { Router } from 'express';
import * as Controller from '../controllers/semanticRule.controller';

const router = new Router();

router.route('/semanticRules').get((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.set('Cache-Control', 'private, max-age=60');
  }
  next();
}, Controller.getSemanticRules);

export default router;
