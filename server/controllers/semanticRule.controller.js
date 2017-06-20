import _ from 'lodash';
import qs from 'qs';
import Wiki from '../models/wiki';

export function getSemantic(req, res) {}

export function getSemanticRules(req, res) {
  const rawQuery = req._parsedOriginalUrl.query;
  const reqQuery = qs.parse(rawQuery);
  const {scope} = reqQuery;
  if (!scope || !Array.isArray(scope)) {
    res
      .status(403)
      .send({errmsg: 'must have scope paramter'});
    return;
  }
  const promises = scope.map((s) => {
    const {rootWikiId} = s;
    if (s.rootWikiId) {
      const p = Wiki
        .find({rootWiki: rootWikiId})
        .then((wikis) => {
          return wikis.map((wiki) => {
            const semanticRule = {
              type: 'wiki',
              _id: wiki._id,
              rootWikiId: wiki.rootWiki,
              wikiId: wiki._id,
              name: wiki.name,
              href: `/rootWikis/${wiki.rootWiki}/wikis/${wiki._id}`,
              updatedAt: wiki.updatedAt
            };
            return semanticRule;
          });
        });
      return p;
    }
    return [];
  });
  Promise
    .all(promises)
    .then((results) => {
      const semanticRules = _.flatten(results);
      res.json({semanticRules});
    })
    .catch((err) => {
      res
        .status(403)
        .send(err);
    });
}
