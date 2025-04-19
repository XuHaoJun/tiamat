import ForumBoard from '../models/forumBoard';

/**
 * Get all posts
 * @param req
 * @param res
 * @returns void
 */
export async function getForumBoards(req, res) {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 30;
    const sort = req.query.sort || '-popularityCounter';
    const sortWays = ['-popularityCounter'];
    
    if (!sortWays.some(s => s === sort) || page <= 0 || limit > 30) {
      res.status(400).send({ errmsg: `unknown sort ${sort}` });
      return;
    }
    
    const result = await ForumBoard.paginate(
      {},
      {
        page,
        limit,
        sort,
      }
    );
    res.json({ forumBoards: result.docs });
  } catch (err) {
    res.status(403).send(err);
  }
}

export async function getForumBoard(req, res) {
  try {
    const forumBoard = await ForumBoard.findOne({ _id: req.params.id }).exec();
    res.json({ forumBoard });
  } catch (err) {
    res.status(403).send(err);
  }
}

export async function addForumBoard(req, res) {
  try {
    const newForumBoard = new ForumBoard(req.body.forumBoard);
    const validateError = newForumBoard.validateSync();
    
    if (validateError) {
      res.status(403).send(validateError);
      return;
    }
    
    const saved = await newForumBoard.save();
    res.json({ forumBoard: saved });
  } catch (err) {
    res.status(403).send(err);
  }
}

