import { fromJS, Set, Record, is } from "immutable";
import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../util/createFastMemoizeDefaultOptions";

import defaultSameIdElesMax from "../../util/defaultSameIdElesMax";
import { connectDB } from "../../localdb";
import {
  ADD_DISCUSSIONS,
  ADD_DISCUSSION,
  CLEAR_DISCUSSIONS,
  SET_DISCUSSIONS_UI,
  SET_UPSERT_DISCUSSION_PAGE_FORM
} from "./DiscussionActions";

const UserBasicInfo = Record({
  _id: "",
  displayName: "",
  avatarURL: ""
});

const DISCUSSION_RECORD_DEFAULT = {
  _id: "",
  title: null,
  author: "",
  authorBasicInfo: null,
  lastChildComments: null,
  lastChildCommentCount: 0,
  content: null,
  isRoot: false,
  parentDiscussion: "",
  replayTo: "",
  childDiscussionCount: 0,
  forumBoardGroup: null,
  tags: Set(),
  forumBoard: "",
  titleUpdatedAt: new Date(),
  repliedAt: new Date(),
  contentUpdatedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};

const DiscussionRecord = Record(DISCUSSION_RECORD_DEFAULT);

export class Discussion extends DiscussionRecord {
  static fromJS(obj = {}) {
    const record = new Discussion({
      ...obj,
      content: obj.content ? fromJS(obj.content) : null,
      authorBasicInfo: obj.authorBasicInfo
        ? new UserBasicInfo(obj.authorBasicInfo)
        : null,
      tags: Set(obj.tags),
      titleUpdatedAt: new Date(obj.titleUpdatedAt),
      repliedAt: new Date(obj.repliedAt),
      contentUpdatedAt: new Date(obj.contentUpdatedAt),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt)
    });
    return record;
  }
}

const DISCUSSION_STATE_RECORD_DEFAULT = {
  ui: fromJS({
    CreateRootDiscussionPage: {
      forms: {
        // ${forumBoardId}: {   title: '',   content: null  }
      }
    }
  }),
  data: Set()
};

const DiscussionStateRecord = Record(DISCUSSION_STATE_RECORD_DEFAULT);

export class DiscussionState extends DiscussionStateRecord {
  static fromJS(obj = {}) {
    const { ui, discussions = [] } = obj;
    const record = new DiscussionState({
      ui: fromJS(ui),
      data: Set(discussions.map(Discussion.fromJS))
    });
    return record;
  }
}

const initialState = DiscussionState.fromJS();

const DiscussionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_DISCUSSION:
    case ADD_DISCUSSIONS:
      const xs = state.discussions;
      const dataInput = action.discussion
        ? [action.discussion]
        : action.discussions;
      const newXs = DiscussionState.fromJS({ data: dataInput }).data;
      const unionXs = xs.union(newXs);
      const nextXs = !is(unionXs, xs)
        ? unionXs
            .groupBy(x => x._id)
            .map(defaultSameIdElesMax)
            .toSet()
        : unionXs;
      return state.set("discussions", nextXs);

    case CLEAR_DISCUSSIONS:
      return state.set("discussions", Set());

    case SET_UPSERT_DISCUSSION_PAGE_FORM:
      const { forumBoardId, form } = action;
      const newState = state.setIn(
        ["ui", "UpsertDiscussionPage", "forms", forumBoardId],
        fromJS(form)
      );
      const db = connectDB();
      if (db) {
        db.setItem("discussion:ui", newState.get("ui").toJSON());
      }
      return newState;

    case SET_DISCUSSIONS_UI:
      // const nextUI = state.get("ui")action.ui;
      return state.set("ui", fromJS(action.ui));

    default:
      return state;
  }
};

export const getDiscussions = state => {
  return state.discussions.discussions;
};

export const getDiscussionsByForumBoard = (state, forumBoardId) => {
  const discussions = getDiscussions(state);
  return discussions.filter(x => x.forumBoard === forumBoardId);
};

const _getRootDiscussions = memoize((discussions, fourmBoardGroup) => {
  return discussions.filter(x => {
    const inGroup =
      fourmBoardGroup && fourmBoardGroup !== "_all"
        ? x.forumBoardGroup === fourmBoardGroup
        : true;
    return x.isRoot && inGroup;
  });
}, createFastMemoizeDefaultOptions({ size: 1 }));

export const getRootDiscussions = (state, forumBoardId, fourmBoardGroup) => {
  const discussions = getDiscussionsByForumBoard(state, forumBoardId);
  return _getRootDiscussions(discussions, fourmBoardGroup);
};

const _getDiscussionById = memoize((discussions, id) => {
  return discussions.find(x => x._id === id);
}, createFastMemoizeDefaultOptions({ size: 5 }));

export const getDiscussionById = (state, id) => {
  const discussions = getDiscussions(state);
  return _getDiscussionById(discussions, id);
};

const _getChildDiscussions = memoize((discussions, parentDiscussionId) => {
  return discussions.filter(x => x.parentDiscussion === parentDiscussionId);
}, createFastMemoizeDefaultOptions({ size: 1 }));

export const getChildDiscussions = (state, parentDiscussionId) => {
  const discussions = getDiscussions(state);
  return _getChildDiscussions(discussions, parentDiscussionId);
};

// import mingo from "mingo";
// function getDiscussionByDirection(
//   discussions,
//   parentDiscussion,
//   direction = "next",
//   orderPropName = "updatedAt",
//   select = null
// ) {
//   const { isRoot } = parentDiscussion;
//   const parentDiscussionId = parentDiscussion._id;
//   const orderProp = parentDiscussion[orderPropName];
//   const forumBoardId = parentDiscussion.forumBoard;
//   const test = {
//     _id: {
//       $ne: parentDiscussionId
//     },
//     forumBoard: forumBoardId,
//     isRoot,
//     [orderPropName]: {
//       [direction === "next" ? "$lte" : "$gte"]: orderProp
//     }
//   };
//   const sort = {
//     [orderPropName]: direction === "next" ? -1 : 1
//   };
//   return new mingo.Query(test, select)
//     .find(discussions.values())
//     .sort(sort)
//     .limit(1)
//     .all()[0];
// }

export const getDiscussionByDirection = (
  state,
  parentDiscussion,
  direction = "next",
  orderPropName = "updatedAt"
) => {
  const discussions = getDiscussions(state);
  const found = discussions
    .filter(x => {
      return (
        x._id !== parentDiscussion._id &&
        x.forumBoard === parentDiscussion.forumBoard &&
        x.isRoot === parentDiscussion.isRoot
      );
    })
    .sortBy(x => {
      return direction === "next" ? -1 * x[orderPropName] : x[orderPropName];
    })
    .find(x => {
      const orderProp = x[orderPropName];
      const parentOrderProp = parentDiscussion[orderPropName];
      return direction === "next"
        ? orderProp <= parentOrderProp
        : orderProp >= parentOrderProp;
    });
  return found;
};

export const getUI = state => state.discussions.ui;

// Export Reducer
export default DiscussionReducer;
