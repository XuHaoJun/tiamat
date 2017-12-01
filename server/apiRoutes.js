import { Router } from "express";
import forceSSL from "express-force-ssl";
import RateLimit from "express-rate-limit";

const router = new Router();

// if (process.env.NODE_ENV === "production") {
//   router.use(forceSSL);
// }

router.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function f(...args) {
    let data = args.shift();
    if (data && data.name === "MongoError") {
      data = data.toJSON();
      if (data.op) {
        delete data.op;
      }
    }
    oldSend.apply(res, [data, ...args]);
  };
  next();
});

router.use(
  new RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
  })
);

router.use(require("./routes/user.routes").default);
router.use(require("./routes/oauth2.routes").default);
router.use(require("./routes/discussion.routes").default);
router.use(require("./routes/forumBoard.routes").default);
router.use(require("./routes/wiki.routes").default);
router.use(require("./routes/wikiDataForm.routes").default);
router.use(require("./routes/rootWiki.routes").default);
router.use(require("./routes/semanticRule.routes").default);
router.use(require("./routes/image.routes").default);
router.use(require("./routes/search.routes").default);
router.use(require("./routes/jsonSchema.routes").default);

router.use(require("./routes/notFound.routes").default);

export default router;
