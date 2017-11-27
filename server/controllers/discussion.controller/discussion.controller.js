import qs from "qs";
import _ from "lodash";
import Discussion from "../../models/discussion";
import ForumBoard from "../../models/forumBoard";

import Ajv from "ajv";
import rootDiscussionFormSchema from "../../../client/modules/Discussion/components/RootDiscussionForm/schema.json";
import childDiscussionFormSchema from "../../../client/modules/Discussion/components/ChildDiscussionForm/schema.json";
import serverRootDiscussionFormSchema from "./schemas/rootDiscussionFormSchema.json";
import serverChildDiscussionFormSchema from "./schemas/childDiscussionFormSchema.json";
import { loadSchema } from "../../../client/modules/JSONSchema/JSONSchemaActions";

const ajv = new Ajv({
  allErrors: true,
  extendRefs: true,
  $data: true,
  loadSchema
});

let validateRoot = () => {
  this.errors = [new Error("load schema fail.")];
  return false;
};

ajv.compileAsync(rootDiscussionFormSchema).then(_validate => {
  validateRoot = _validate;
  return validateRoot;
});

let validateChild = () => {
  this.errors = [new Error("load schema fail.")];
  return false;
};

ajv.compileAsync(childDiscussionFormSchema).then(_validate => {
  validateChild = _validate;
  return validateChild;
});

const validateServerRoot = ajv.compile(serverRootDiscussionFormSchema);

const validateServerChild = ajv.compile(serverChildDiscussionFormSchema);

function parseSelect(select) {
  if (!select) {
    return select;
  }
  const newSelect = _.cloneDeep(select);
  _.forEach(select, (v, k) => {
    if (v === "0") {
      newSelect[k] = 0;
    } else if (v === "1") {
      newSelect[k] = 1;
    }
  });
  return newSelect;
}

/**
 * Get all posts
 * @param req
 * @param res
 * @returns void
 */
export function getRootDiscussions(req, res) {
  const { forumBoardId } = req.params;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const forumBoardGroup =
    req.query.forumBoardGroup || req.query.group || undefined;
  const sort = req.query.sort || "-updatedAt";
  const rawQuery = req._parsedOriginalUrl.query;
  const reqQuery = qs.parse(rawQuery);
  const select = parseSelect(reqQuery.select) || {};
  const sortWays = ["-updatedAt"];
  if (!sortWays.some(s => s === sort) || page <= 0 || limit > 30) {
    res.status(403).send({ errmsg: `unknown sort ${sort}` });
  } else {
    const query = {
      isRoot: true,
      forumBoard: forumBoardId
    };
    if (forumBoardGroup) {
      query.forumBoardGroup = forumBoardGroup;
    }
    Discussion.paginate(
      query,
      {
        page,
        limit,
        sort,
        select
      },
      (err, result) => {
        if (err) {
          res.status(403).send(err);
        } else {
          res.json({ discussions: result.docs });
        }
      }
    );
  }
}

/**
 * Save a post
 * @param req
 * @param res
 * @returns void
 */
export function addDiscussion(req, res) {
  const form = req.body.discussion;
  if (!form) {
    res.status(403).send(new Error("Discussion form is required."));
    return;
  }
  let validate;
  if (form.isRoot) {
    validate = validateRoot;
  } else {
    validate = validateChild;
  }
  const valid = validate(form);
  if (!valid) {
    res.status(403).send(validate.errors);
    return;
  }
  let validP;
  if (form.isRoot) {
    validP = ForumBoard.findById(form.forumBoard)
      .select({ _id: 1, groups: 1 })
      .then(forumBoard => {
        let { _id, groups } = forumBoard;
        _id = _id ? _id.toString() : "";
        groups = groups || [];
        const { forumBoardGroup } = form;
        const validServer = validateServerRoot({
          forumBoard: _.omitBy({ _id, groups }, _.isEmpty),
          forumBoardGroup
        });
        if (!validServer) {
          return Promise.reject(validateServerRoot.errors);
        }
        return forumBoard;
      });
  } else {
    validP = Discussion.findById(form.parentDiscussion)
      .select({ _id: 1 })
      .then(parentDiscussion => {
        let { _id } = parentDiscussion;
        _id = _id ? _id.toString() : "";
        const validServer = validateServerChild({
          parentDiscussion: {
            _id
          }
        });
        if (!validServer) {
          return Promise.reject(validateServerChild.errors);
        }
        return parentDiscussion;
      });
  }
  const { user } = req;
  validP
    .then(() => {
      const author = user._id;
      const authorBasicInfo = user.getBasicInfo();
      const props = {
        ...form,
        author,
        authorBasicInfo
      };
      const newDiscussion = new Discussion(props);
      return newDiscussion.save().then(saved => {
        const io = req.app.get("io");
        const nsp = `/forumBoards/${saved.forumBoard}/discussions`;
        const socket = io.of(nsp);
        socket.emit("addDiscussion", saved);
        res.json({ discussion: saved });
        return saved;
      });
    })
    .catch(err => {
      res.status(403).send(err);
      return err;
    });
}

/**
 * Get a single post
 * @param req
 * @param res
 * @returns void
 */
export function getDiscussion(req, res) {
  const rawQuery = req._parsedOriginalUrl.query;
  const reqQuery = qs.parse(rawQuery);
  const select = parseSelect(reqQuery.select) || {};
  Discussion.findOne({ _id: req.params.id })
    .select(select)
    .exec((err, discussion) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      res.json({ discussion });
    });
}

export function getDiscussions(req, res) {
  const { parentDiscussionId } = req.query;
  if (!parentDiscussionId) {
    res.status(403).send(new Error("must have parentDiscussionId"));
    return;
  }
  const rawQuery = req._parsedOriginalUrl.query;
  const reqQuery = qs.parse(rawQuery);
  const select = parseSelect(reqQuery.select) || {};
  const query = {
    parentDiscussion: parentDiscussionId
  };
  Discussion.find(query)
    .select(select)
    .exec((err, discussions) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      res.json({ discussions });
    });
}

/**
 * Get a single post
 * @param req
 * @param res
 * @returns void
 */
export function getDiscussionsWithChild(req, res) {
  Discussion.findOne({ _id: req.params.id })
    .populate({
      path: "childDiscussions",
      options: {
        sort: {
          updatedAt: -1
        }
      }
    })
    .exec((err, discussion) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      res.json({ discussion });
    });
}
