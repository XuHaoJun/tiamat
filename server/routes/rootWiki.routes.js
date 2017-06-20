import {Router} from 'express';
import * as Controller from '../controllers/rootWiki.controller';

const router = new Router();

router.route('/rootWikis/:id').get(Controller.getRootWiki);
router.route('/rootWikis').post(Controller.addRootWiki);

export default router;
