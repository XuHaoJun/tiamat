import _ from 'lodash';
import mongoose from 'mongoose';
import Discussion from '../../models/discussion';
import ForumBoard from '../../models/forumBoard';

import Ajv from 'ajv';
import rootDiscussionFormSchema from '../../../client/modules/Discussion/components/RootDiscussionForm/schema.json';
import childDiscussionFormSchema from '../../../client/modules/Discussion/components/ChildDiscussionForm/schema.json';
import serverRootDiscussionFormSchema from './schemas/rootDiscussionFormSchema.json';
import serverChildDiscussionFormSchema from './schemas/childDiscussionFormSchema.json';
import { loadSchema } from '../../../client/modules/JSONSchema/JSONSchemaActions';

const ajv = new Ajv({
  allErrors: true,
  extendRefs: true,
  $data: true,
  loadSchema,
});

let validateRoot = () => {
  this.errors = [new Error('load schema fail.')];
  return false;
};

ajv.compileAsync(rootDiscussionFormSchema).then(_validate => {
  validateRoot = _validate;
  return validateRoot;
});

let validateChild = () => {
  this.errors = [new Error('load schema fail.')];
  return false;
};

ajv.compileAsync(childDiscussionFormSchema).then(_validate => {
  validateChild = _validate;
  return validateChild;
});

const validateServerRoot = ajv.compile(serverRootDiscussionFormSchema);

const validateServerChild = ajv.compile(serverChildDiscussionFormSchema);

function normalizeSelect(select) {
  if (!_.isObject(select)) {
    return select;
  }
  const newSelect = _.cloneDeep(select);
  _.forEach(select, (v, k) => {
    if (v === '0') {
      newSelect[k] = 0;
    } else if (v === '1') {
      newSelect[k] = 1;
    }
  });
  return newSelect;
}

export function getRootDiscussions(req, res) {
  const { forumBoardId } = req.params;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const forumBoardGroup = req.query.forumBoardGroup || req.query.group || undefined;
  const sort = req.query.sort || '-updatedAt';
  const reqQuery = req.query;
  const select = normalizeSelect(reqQuery.select) || {};
  const sortWays = ['-updatedAt'];
  if (!sortWays.some(s => s === sort) || page <= 0 || limit > 30) {
    res.status(403).send({ errmsg: `unknown sort ${sort}` });
  } else {
    const query = {
      isRoot: true,
      forumBoard: forumBoardId,
    };
    if (forumBoardGroup && forumBoardGroup !== '_all') {
      query.forumBoardGroup = forumBoardGroup;
    }
    Discussion.paginate(
      query,
      {
        page,
        limit,
        sort,
        select,
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

export function addDiscussion(req, res) {
  const form = req.body.discussion;
  if (!form) {
    res.status(403).send(new Error('Discussion form is required.'));
    return;
  }
  let validate;
  if (form.isRoot) {
    validate = validateRoot;
  } else {
    validate = validateChild;
  }
  // FIXME
  // update form validate format.
  // const valid = validate(form);
  // if (!valid) {
  //  res.status(403).send(validate.errors);
  //  return;
  // }
  let validP;
  if (form.isRoot) {
    validP = ForumBoard.findById(form.forumBoard)
      .select({ _id: 1, groups: 1 })
      .then(forumBoard => {
        let { _id, groups } = forumBoard;
        _id = _id ? _id.toString() : '';
        groups = groups || [];
        const { forumBoardGroup } = form;
        const validServer = validateServerRoot({
          forumBoard: _.omitBy({ _id, groups }, _.isEmpty),
          forumBoardGroup,
        });
        if (!validServer) {
          return Promise.reject(validateServerRoot.errors);
        } else {
          return forumBoard;
        }
      });
  } else {
    validP = Discussion.findById(form.parentDiscussion)
      .select({ _id: 1 })
      .then(parentDiscussion => {
        let { _id } = parentDiscussion;
        _id = _id ? _id.toString() : '';
        const validServer = validateServerChild({
          parentDiscussion: {
            _id,
          },
        });
        if (!validServer) {
          return Promise.reject(validateServerChild.errors);
        } else {
          return parentDiscussion;
        }
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
        authorBasicInfo,
      };
      const newDiscussion = new Discussion(props);
      return newDiscussion.save().then(saved => {
        const io = req.app.get('io');
        const nsp = `/forumBoards/${saved.forumBoard}/discussions`;
        const socket = io.of(nsp);
        socket.emit('addDiscussion', saved);
        res.json({ discussion: saved });
        return saved;
      });
    })
    .catch(err => {
      res.status(403).send(err);
      return err;
    });
}

const testSchema = {
  type: 'object',
  minProperties: 1,
  maxProperties: 5,
  additionalProperties: false,
  properties: {
    _id: {
      type: 'object',
      minProperties: 1,
      maxProperties: 1,
      additionalProperties: false,
      properties: {
        $ne: {
          type: 'string',
        },
      },
    },
    forumBoardGroup: {
      type: 'string',
    },
    isRoot: {
      type: 'boolean',
    },
    forumBoard: {
      type: 'string',
    },
    updatedAt: {
      type: 'object',
      minProperties: 1,
      maxProperties: 1,
      additionalProperties: false,
      properties: {
        $gt: {
          format: 'date-time',
        },
        $gte: {
          format: 'date-time',
        },
        $lt: {
          format: 'date-time',
        },
        $lte: {
          format: 'date-time',
        },
      },
    },
  },
};

const sortSchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,
  maxProperties: 1,
  properties: {
    createdAt: {
      enum: [1, -1],
    },
    updatedAt: {
      enum: [1, -1],
    },
  },
};

const ajvNormal = new Ajv();

const validateTest = ajvNormal.compile(testSchema);

const validateSort = ajvNormal.compile(sortSchema);

function normalizeQuery(query) {
  const q = _.cloneDeep(query);
  if (_.isObject(q.test)) {
    if (_.isString(q.test.isRoot)) {
      q.test.isRoot = q.test.isRoot === 'true';
    }
    if (_.isObject(q._id) && typeof q._id.$not === 'string') {
      q._id.$not = mongoose.mongo.ObjectId(q._id.$not);
    }
  }
  if (_.isObject(q.sort) && typeof q.sort.updatedAt === 'string') {
    q.sort.updatedAt = Number.parseInt(q.sort.updatedAt, 10);
  }
  if (_.isObject(q.select)) {
    q.select = normalizeSelect(q.select);
  }
  return q;
}

export function getDiscussionByTest(req, res) {
  const reqQuery = normalizeQuery(req.query);
  const { test: testInput, sort: sortInput, select } = reqQuery;
  const test = testInput || { updatedAt: { $lte: new Date() } };
  const sort = sortInput || { updatedAt: -1 };
  const vali = validateTest(test) && validateSort(sort);
  if (!vali) {
    res.status(403).send(testSchema);
  } else {
    Discussion.find(test, select)
      .sort(sort)
      .limit(1)
      .exec((err, discussions) => {
        if (err) {
          res.status(403).send(err);
          return;
        }
        if (discussions.length === 0) {
          res.status(404).send('Not Found');
        } else {
          res.json({ discussion: discussions[0] });
        }
      });
  }
}

export function getDiscussionById(req, res) {
  const reqQuery = req.query;
  const select = normalizeSelect(reqQuery.select) || {};
  Discussion.findById(req.params.id)
    .select(select)
    .exec((err, discussion) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      res.json({ discussion });
    });
}

export function getChildDiscussions(req, res) {
  const { id: parentDiscussionId } = req.params;
  if (!parentDiscussionId) {
    res.status(403).send(new Error('must have parentDiscussionId'));
    return;
  }
  const { withParent = false } = req.query;
  const select = normalizeSelect(req.query.select) || {};
  const queryBase = {
    parentDiscussion: parentDiscussionId,
  };
  const withParentQuery = withParent
    ? {
        _id: parentDiscussionId,
      }
    : {};
  Discussion.find()
    .or(queryBase)
    .or(withParentQuery)
    .select(select)
    .exec((err, discussions) => {
      if (err) {
        res.status(403).send(err);
      } else if (discussions.length === 0) {
        res.status(404).end();
      } else {
        res.json({ discussions });
      }
    });
}

export function getDiscussions(req, res) {
  const { parentDiscussionId } = req.query;
  if (!parentDiscussionId) {
    res.status(403).send(new Error('must have parentDiscussionId'));
    return;
  }
  const reqQuery = req.query;
  const select = normalizeSelect(reqQuery.select) || {};
  const query = {
    parentDiscussion: parentDiscussionId,
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

export function getDiscussionsWithChild(req, res) {
  Discussion.findOne({ _id: req.params.id })
    .populate({
      path: 'childDiscussions',
      options: {
        sort: {
          updatedAt: -1,
        },
      },
    })
    .exec((err, discussion) => {
      if (err) {
        res.status(403).send(err);
        return;
      }
      res.json({ discussion });
    });
}
