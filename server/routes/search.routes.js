import {Router} from 'express';
import * as Controller from '../controllers/search.controller';

const router = new Router();

router.route('/search').get(Controller.search);
router.route('/search/forumBoards').get(Controller.searchDiscussions);
router.route('/search/discussions').get(Controller.searchDiscussions);
router.route('/search/discussions/_count').get(Controller.countDiscussions);
router.route('/search/wikis').get(Controller.searchWikis);

export default router;
