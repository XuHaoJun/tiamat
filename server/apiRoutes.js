import { Router } from 'express';
import forceSSL from 'express-force-ssl';
import RateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

const { MongoError } = mongoose.mongo;

const router = new Router();

// if (process.env.NODE_ENV === "production") {
//   router.use(forceSSL);
// }

const saltedErrorSend = (req, res, next) => {
  const oldSend = res.send;
  res.send = function f(...args) {
    let data = args.shift();
    if (typeof data === 'object' && data && data instanceof MongoError) {
      const saltedErr = {
        name: data.name,
        message: data.message,
        errmsg: data.errmsg,
        code: data.code,
      };
      data = saltedErr;
    }
    oldSend.apply(res, [data, ...args]);
  };
  next();
};

router.use(saltedErrorSend);

function skipLocalRequestLimit(req) {
  const ip =
    req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'];
  return ip === '127.0.0.1' || ip === '::ffff:127.0.0.1' || ip === '::1';
}

if (process.env.NODE_ENV === 'production') {
  router.use(
    new RateLimit({
      windowMs: 1 * 60 * 1000,
      max: 600,
      delayAfter: 450,
      delayMs: 150,
      skip: skipLocalRequestLimit,
    })
  );
}

router.use(require('./routes/user.routes').default);
router.use(require('./routes/oauth2.routes').default);
router.use(require('./routes/discussion.routes').default);
router.use(require('./routes/forumBoard.routes').default);
router.use(require('./routes/wiki.routes').default);
router.use(require('./routes/wikiDataForm.routes').default);
router.use(require('./routes/rootWiki.routes').default);
router.use(require('./routes/semanticRule.routes').default);
router.use(require('./routes/image.routes').default);
router.use(require('./routes/search.routes').default);
router.use(require('./routes/jsonSchema.routes').default);

router.use(require('./routes/notFound.routes').default);

export default router;
