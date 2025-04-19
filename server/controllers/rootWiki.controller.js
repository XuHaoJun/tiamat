import RootWiki from '../models/rootWiki';
import ForumBoard from '../models/forumBoard';

export async function getRootWiki(req, res) {
  try {
    const { id } = req.params;
    const rootWiki = await RootWiki.findById(id).exec();
    res.json({ rootWiki });
  } catch (err) {
    res.status(403).send(err);
  }
}

export async function addRootWiki(req, res) {
  try {
    const rootWikiForm = req.body.rootWiki;
    const { forumBoardId, content } = rootWikiForm;
    
    if (!forumBoardId || !content) {
      res.status(403).send(new Error('incorrect filed'));
      return;
    }
    
    const forumBoard = await ForumBoard.findOne({ _id: forumBoardId }).exec();
    
    if (!forumBoard || (forumBoard && forumBoard.get('rootWiki'))) {
      res.status(403).send('forumBoard already have matched rootWiki');
      return;
    }
    
    const rootWiki = {
      name: forumBoard.get('name'),
      forumBoard: forumBoard.get('_id'),
      content: rootWikiForm.content,
    };
    
    const newRootWiki = new RootWiki(rootWiki);
    
    const doc = await ForumBoard.findOneAndUpdate(
      {
        _id: forumBoard.get('_id'),
        rootWiki: null,
        __v: forumBoard.get('__v'),
      },
      {
        $set: {
          rootWiki: newRootWiki.get('_id'),
          updatedAt: Date.now(),
        },
      }
    ).exec();
    
    if (!doc) {
      res.status(403).send('Update failed');
      return;
    }
    
    const saved = await newRootWiki.save();
    res.json({ rootWiki: saved });
  } catch (err) {
    res.status(403).send(err);
  }
}
