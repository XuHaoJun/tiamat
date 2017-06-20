import {Router} from 'express';
import * as Controller from '../controllers/semanticRule.controller';

const router = new Router();

router.route('/semanticRules').get(Controller.getSemanticRules);

export default router;
