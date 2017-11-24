import qs from "qs";
import RootWiki from "../models/rootWiki";
import Wiki from "../models/wiki";
import dotNotationTool from "mongo-dot-notation-tool";
import _ from "lodash";
import car from "lodash/first";
import cdr from "lodash/tail";

/**
 * Save a post
 * @param req
 * @param res
 * @returns void
 */
export function getWiki(req, res) {
  const query = {
    _id: req.params.id
  };
  Wiki.findOne(query).exec((err, wiki) => {
    if (err) {
      res.status(403).send(err);
      return;
    }
    res.json({ wiki });
  });
}

function pathToMongoQuery(path = []) {
  if (path.length === 1) {
    return {
      $elemMatch: {
        name: car(path)
      }
    };
  } else if (path.length > 1) {
    return {
      $elemMatch: {
        name: car(path),
        children: pathToMongoQuery(cdr(path))
      }
    };
  } else {
    return null;
  }
}

function rootWikiGroupTreeToMongoQueryHelper(rootWikiGroupTree, path = []) {
  if (_.isPlainObject(rootWikiGroupTree)) {
    let name = rootWikiGroupTree.name || rootWikiGroupTree["[name]"];
    let children =
      rootWikiGroupTree.children || rootWikiGroupTree["[children]"];
    if (!name && !children) {
      const flattenTree = _.values(rootWikiGroupTree)[0] || {};
      name = flattenTree.name;
      children = flattenTree.children;
    }
    if (name) {
      const isLeaf =
        !children || (Array.isArray(children) && children.length === 0);
      if (isLeaf) {
        return pathToMongoQuery(path);
      } else {
        return rootWikiGroupTreeToMongoQueryHelper(children, path);
      }
    }
  } else if (Array.isArray(rootWikiGroupTree)) {
    return _.flatten(
      rootWikiGroupTree.map(node => {
        const name = node.name;
        const q = rootWikiGroupTreeToMongoQueryHelper(node, path.concat(name));
        return q;
      })
    );
  }
  return null;
}

function rootWikiGroupTreeToMongoQuery(
  rootWikiGroupTree,
  rootField = "rootWikiGroupTree"
) {
  return {
    $or: rootWikiGroupTreeToMongoQueryHelper(rootWikiGroupTree).map(match => {
      return { [rootField]: match };
    })
  };
}

function rootWikiGroupTreeToMongoQuery2(rootWikiGroupTree) {
  const encoded = dotNotationTool.encode({ rootWikiGroupTree });
  return _.reduce(
    encoded,
    (result, leaf, k) => {
      let newLeaf;
      if (Array.isArray(leaf)) {
        newLeaf = {
          $in: leaf
        };
      } else {
        newLeaf = {
          $exists: true
        };
      }
      const newResult = Object.assign(result, { [k]: newLeaf });
      return newResult;
    },
    {}
  );
}

export function getWikis(req, res) {
  const { rootWikiId } = req.params;
  const rawQuery = req._parsedOriginalUrl.query;
  const reqQuery = qs.parse(rawQuery, { depth: 8 });
  const { rootWikiGroupTree } = reqQuery;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const sort = "-updatedAt";
  if (!rootWikiId) {
    res.status(403).send(new Error("query rootWiki must have."));
    return;
  }
  let query = {
    rootWiki: rootWikiId
  };
  if (rootWikiGroupTree === "null") {
    query.rootWikiGroupTree = null;
  } else if (rootWikiGroupTree && rootWikiGroupTree !== "all") {
    const q = rootWikiGroupTreeToMongoQuery(rootWikiGroupTree);
    query = Object.assign(query, q);
  }
  Wiki.paginate(
    query,
    {
      page,
      limit,
      sort
    },
    (err, result) => {
      if (err) {
        res.status(403).send(err);
      } else {
        res.json({ wikis: result.docs });
      }
    }
  );
}

export function addWiki(req, res) {
  const wikiForm = req.body.wiki;
  const { rootWikiId } = wikiForm;
  const newWiki = new Wiki({
    name: wikiForm.name,
    content: wikiForm.content,
    rootWiki: wikiForm.rootWikiId
  });
  RootWiki.findOne({ _id: rootWikiId }).exec((err1, rootWiki) => {
    if (err1) {
      res.status(403).send(err1);
      return;
    }
    if (!rootWiki) {
      res.status(403).send("rootWiki not found");
      return;
    }
    newWiki.save((err, saved) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      res.json({ wiki: saved });
    });
  });
}
