import {Router} from 'express';

const router = new Router();

router.use(require('./routes/user.routes').default);
router.use(require('./routes/oauth2.routes').default);
router.use(require('./routes/discussion.routes').default);
router.use(require('./routes/forumBoard.routes').default);
router.use(require('./routes/wiki.routes').default);
router.use(require('./routes/rootWiki.routes').default);
router.use(require('./routes/semanticRule.routes').default);
router.use(require('./routes/image.routes').default);
router.use(require('./routes/notFound.routes').default);

export default router;
