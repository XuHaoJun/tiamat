import {Router} from 'express';
import * as Controller from '../controllers/wiki.controller';

const router = new Router();

router.route('/rootWikis/:rootWikiId/wikis').get(Controller.getWikis);
router.route('/wikis/:id').get(Controller.getWiki);
router.route('/wikis').post(Controller.addWiki);

export default router;