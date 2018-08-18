import Discussion from '../models/discussion';
import bob from 'elastic-builder';

export function search(req, res) {
  res.json('not imple');
}

export function searchForumBoards(req, res) {
  res.json('not imple');
}

export function searchDiscussions(req, res) {
  const { q, title, forumBoardId, parentDiscussionId } = req.query;
  let { page, limit, minScore, highlight } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  const from = (page - 1) * limit;
  const size = limit;
  if (page > 100) {
    res.status(403).json('incorrect from');
    return;
  }
  if (limit > 20) {
    res.status(403).json('incorrect size');
    return;
  }
  if (minScore === '0') {
    minScore = 0;
  } else {
    minScore = parseInt(minScore, 10) || 0.00000001;
  }
  if (highlight === '' || highlight === 'true') {
    highlight = true;
  } else {
    highlight = false;
  }
  const requestBody = bob
    .requestBodySearch()
    .from(from)
    .size(size);
  if (highlight) {
    requestBody.highlight(
      (() => {
        const h = bob.highlight(['title', 'content']);
        if (q && !title) {
          h.requireFieldMatch(false);
        }
        return h;
      })()
    );
  }
  const functinoScoreQuery = bob.functionScoreQuery();
  requestBody.query(functinoScoreQuery);
  functinoScoreQuery.functions([
    bob
      .fieldValueFactorFunction('votes')
      .modifier('log2p')
      .factor(1.5)
      .missing(0),
    bob
      .fieldValueFactorFunction('childrenDiscussionCount')
      .modifier('log2p')
      .factor(1.1)
      .missing(0),
    bob
      .decayScoreFunction('gauss', 'repliedAt')
      .offset('1d')
      .scale('7d'),
  ]);
  functinoScoreQuery.minScore(minScore);
  functinoScoreQuery.query(
    (() => {
      const boolQuery = bob.boolQuery();
      if (q) {
        boolQuery.should(bob.queryStringQuery(q || ''));
      }
      if (title) {
        boolQuery.should(bob.matchQuery('title', title));
      }
      boolQuery.filter(
        (() => {
          const filter = bob.boolQuery();
          if (forumBoardId) {
            filter.must(bob.termQuery('forumBoard', forumBoardId));
          }
          if (parentDiscussionId === '$exists:true' || parentDiscussionId === 'true') {
            filter.must(bob.existsQuery('parentDiscussion'));
          } else if (
            parentDiscussionId === '$exists:false' ||
            parentDiscussionId === 'null' ||
            parentDiscussionId === 'false'
          ) {
            filter.mustNot(bob.existsQuery('parentDiscussion'));
          } else if (typeof parentDiscussionId === 'string' && parentDiscussionId !== '') {
            filter.must(bob.termQUery('parentDiscussion', parentDiscussionId));
          }
          return filter;
        })()
      );
      return boolQuery;
    })()
  );
  Discussion.esSearch(requestBody.toJSON(), (err, discussions) => {
    if (err) {
      res.status(403).send(err);
    } else {
      res.json({ discussions });
    }
  });
}

export function countDiscussions(req, res) {}

export function searchWikis(req, res) {
  res.json('not imple');
}
