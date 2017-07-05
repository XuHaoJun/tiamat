import ForumBoard from "../models/forumBoard";

/**
 * Get all posts
 * @param req
 * @param res
 * @returns void
 */
export function getForumBoards(req, res) {
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 30;
  const sort = req.query.sort || "-popularityCounter";
  const sortWays = ["-popularityCounter"];
  if (!sortWays.some(s => s === sort) || page <= 0 || limit > 30) {
    res.status(400).send({ errmsg: `unknown sort ${sort}` });
  } else {
    ForumBoard.paginate(
      {},
      {
        page,
        limit,
        sort
      },
      (err, result) => {
        if (err) {
          res.status(403).send(err);
        } else {
          res.json({ forumBoards: result.docs });
        }
      }
    );
  }
}

export function getForumBoard(req, res) {
  ForumBoard.findOne({ _id: req.params.id }).exec((err, forumBoard) => {
    if (err) {
      res.status(403).send(err);
    } else {
      res.json({ forumBoard });
    }
  });
}

export function addForumBoard(req, res) {
  const newForumBoard = new ForumBoard(req.body.forumBoard);
  const validateError = newForumBoard.validateSync();
  if (validateError) {
    res.status(403).send(validateError);
  } else {
    newForumBoard.save((err, saved) => {
      if (err) {
        res.status(403).send(err);
      } else {
        res.json({ forumBoard: saved });
      }
    });
  }
}
