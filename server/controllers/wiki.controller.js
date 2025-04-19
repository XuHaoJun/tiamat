import dotNotationTool from 'mongo-dot-notation-tool';
import _ from 'lodash';
import car from 'lodash/first';
import cdr from 'lodash/tail';

import RootWiki from '../models/rootWiki';
import Wiki from '../models/wiki';

export async function getWiki(req, res) {
  try {
    const { id, name, rootWikiId } = req.params;
    if (!id && (!name && !rootWikiId)) {
      res.status(403).send(new Error(`unknown params.${req.params}`));
      return;
    }
    
    let query;
    if (id) {
      query = { _id: id };
    } else {
      query = { name, rootWiki: rootWikiId };
    }
    
    const wiki = await Wiki.findOne(query)
      .populate('wikiDataForm')
      .exec();
      
    if (!wiki) {
      res.status(404).send('Not found.');
      return;
    }
    
    res.json({ wiki });
  } catch (err) {
    res.status(403).send(err);
  }
}

function pathToMongoQuery(path = []) {
  if (path.length === 1) {
    return {
      $elemMatch: {
        name: car(path),
      },
    };
  } else if (path.length > 1) {
    return {
      $elemMatch: {
        name: car(path),
        children: pathToMongoQuery(cdr(path)),
      },
    };
  } else {
    return null;
  }
}

function rootWikiGroupTreeToMongoQueryHelper(rootWikiGroupTree, path = []) {
  if (_.isPlainObject(rootWikiGroupTree)) {
    let name = rootWikiGroupTree.name || rootWikiGroupTree['[name]'];
    let children = rootWikiGroupTree.children || rootWikiGroupTree['[children]'];
    if (!name && !children) {
      const flattenTree = _.values(rootWikiGroupTree)[0] || {};
      name = flattenTree.name; // eslint-disable-line
      children = flattenTree.children; // eslint-disable-line
    }
    if (name) {
      const isLeaf = !children || (Array.isArray(children) && children.length === 0);
      if (isLeaf) {
        return pathToMongoQuery(path);
      } else {
        return rootWikiGroupTreeToMongoQueryHelper(children, path);
      }
    }
  } else if (Array.isArray(rootWikiGroupTree)) {
    return _.flatten(
      rootWikiGroupTree.map(node => {
        const { name } = node;
        const q = rootWikiGroupTreeToMongoQueryHelper(node, path.concat(name));
        return q;
      })
    );
  }
  return null;
}

function rootWikiGroupTreeToMongoQuery(rootWikiGroupTree, rootField = 'rootWikiGroupTree') {
  return {
    $or: rootWikiGroupTreeToMongoQueryHelper(rootWikiGroupTree).map(match => {
      return { [rootField]: match };
    }),
  };
}

// function rootWikiGroupTreeToMongoQuery2(rootWikiGroupTree) {
//   const encoded = dotNotationTool.encode({ rootWikiGroupTree });
//   return _.reduce(
//     encoded,
//     (result, leaf, k) => {
//       let newLeaf;
//       if (Array.isArray(leaf)) {
//         newLeaf = {
//           $in: leaf,
//         };
//       } else {
//         newLeaf = {
//           $exists: true,
//         };
//       }
//       const newResult = Object.assign(result, { [k]: newLeaf });
//       return newResult;
//     },
//     {}
//   );
// }

export async function getWikis(req, res) {
  try {
    const { rootWikiId } = req.params;
    const reqQuery = req.query;
    const { rootWikiGroupTree } = reqQuery;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const sort = '-updatedAt';
    
    if (!rootWikiId) {
      res.status(403).send(new Error('query rootWiki must have.'));
      return;
    }
    
    let query = {
      rootWiki: rootWikiId,
    };
    
    if (rootWikiGroupTree === 'null') {
      query.rootWikiGroupTree = null;
    } else if (rootWikiGroupTree && rootWikiGroupTree !== 'all') {
      const q = rootWikiGroupTreeToMongoQuery(rootWikiGroupTree);
      query = Object.assign(query, q);
    }
    
    const populate = {
      path: 'wikiDataForm',
    };
    
    const result = await Wiki.paginate(
      query,
      {
        page,
        limit,
        sort,
        populate,
      }
    );
    
    res.json({ wikis: result.docs });
  } catch (err) {
    res.status(403).send(err);
  }
}

export async function addWiki(req, res) {
  try {
    const wikiForm = req.body.wiki;
    const { rootWikiId } = wikiForm;
    
    const newWiki = new Wiki({
      name: wikiForm.name,
      content: wikiForm.content,
      rootWiki: wikiForm.rootWikiId,
    });
    
    const rootWiki = await RootWiki.findOne({ _id: rootWikiId }).exec();
    
    if (!rootWiki) {
      res.status(403).send('rootWiki not found');
      return;
    }
    
    const saved = await newWiki.save();
    res.json({ wiki: saved });
  } catch (err) {
    res.status(403).send(err);
  }
}

// TODO
// add user bind.
// add validate.
export async function updateWiki(req, res) {
  try {
    const _id = req.params.id;
    const { user, wiki } = req.body;
    const { content, data } = wiki;
    
    if (!_id || (!content && !data)) {
      res.status(403).send(new Error('incorrect format.'));
      return;
    }
    
    const getNextUpdate = () => {
      let nextUpdate = { updatedAt: Date.now() };
      if (content) {
        nextUpdate = { content, ...nextUpdate };
      }
      if (data) {
        nextUpdate = { data, ...nextUpdate };
      }
      return nextUpdate;
    };
    
    const nextUpdate = getNextUpdate();
    const updated = await Wiki.findByIdAndUpdate(_id, nextUpdate, { new: true }).exec();
    res.json({ wiki: updated });
  } catch (err) {
    res.status(403).send(err);
  }
}
