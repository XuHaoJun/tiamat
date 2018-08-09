import RootWiki from "../models/rootWiki";
import ForumBoard from "../models/forumBoard";

export function getRootWiki(req, res) {
  const { id } = req.params;
  RootWiki.findById(id).exec((err, rootWiki) => {
    if (err) {
      res.status(403).send(err);
      return;
    }
    res.json({ rootWiki });
  });
}

export function addRootWiki(req, res) {
  const rootWikiForm = req.body.rootWiki;
  const { forumBoardId, content } = rootWikiForm;
  if (!forumBoardId || !content) {
    res.status(403).send(new Error("incorrect filed"));
    return;
  }
  ForumBoard.findOne({ _id: forumBoardId }).exec((err1, forumBoard) => {
    if (err1 || !forumBoard || (forumBoard && forumBoard.get("rootWiki"))) {
      res.status(403).send(err1 || "forumBoard already have matched rootWiki");
    } else {
      const rootWiki = {
        name: forumBoard.get("name"),
        forumBoard: forumBoard.get("_id"),
        content: rootWikiForm.content
      };
      const newRootWiki = new RootWiki(rootWiki);
      ForumBoard.findOneAndUpdate(
        {
          _id: forumBoard.get("_id"),
          rootWiki: null,
          __v: forumBoard.get("__v")
        },
        {
          $set: {
            rootWiki: newRootWiki.get("_id"),
            updatedAt: Date.now()
          }
        }
      ).exec((updateErr, doc) => {
        if (updateErr || !doc) {
          res.status(403).send(updateErr);
        } else {
          newRootWiki.save((err, saved) => {
            if (err) {
              res.status(403).send(err);
            } else {
              res.json({ rootWiki: saved });
            }
          });
        }
      });
    }
  });
}
