import { Router } from 'express';
import * as Controller from '../controllers/wiki.controller';

const router = new Router();

router.route('/rootWikis/:rootWikiId/wikis').get(Controller.getWikis);
router.route('/wikis/:id').get(Controller.getWiki);
router.route('/rootWikis/:rootWikiId/wikis/:name').get(Controller.getWiki);
router.route('/wikis').post(Controller.addWiki);
router.route('/wikis/:id').patch(Controller.updateWiki);

export default router;
