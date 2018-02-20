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
  _id: null,
  displayName: null,
  avatarURL: null
});

const DISCUSSION_RECORD_DEFAULT = {
  _id: null,
  title: "",
  author: null,
  authorBasicInfo: null,
  lastChildComments: null,
  lastChildCommentCount: 0,
  content: null,
  isRoot: false,
  parentDiscussion: null,
  replayTo: null,
  childDiscussionCount: 0,
  forumBoardGroup: null,
  tags: new Set(),
  forumBoard: null,
  titleUpdatedAt: null,
  repliedAt: null,
  contentUpdatedAt: null,
  createdAt: null,
  updatedAt: null
};

export class Discussion extends Record(DISCUSSION_RECORD_DEFAULT) {
  constructor(json = {}) {
    const record = super({
      ...json,
      content: json.content ? fromJS(json.content) : null,
      authorBasicInfo: json.authorBasicInfo
        ? new UserBasicInfo(json.authorBasicInfo)
        : null,
      tags: new Set(json.tags),
      titleUpdatedAt: new Date(json.titleUpdatedAt),
      repliedAt: new Date(json.repliedAt),
      contentUpdatedAt: new Date(json.contentUpdatedAt),
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt)
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
  data: new Set()
};

export class DiscussionState extends Record(DISCUSSION_STATE_RECORD_DEFAULT) {
  constructor({ ui, data = [] } = {}) {
    const record = super({
      ui: fromJS(ui),
      data: new Set(data.map(d => new Discussion(d)))
    });
    return record;
  }
}

// Initial State
const initialState = new DiscussionState();

const DiscussionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_DISCUSSION:
    case ADD_DISCUSSIONS:
      const newDiscussions = action.discussions
        ? new Set(action.discussions.map(d => new Discussion(d)))
        : new Set([new Discussion(action.discussion)]);
      const unionData = state.get("data").union(newDiscussions);
      const nextData = !is(unionData, state.data)
        ? unionData
            .groupBy(ele => ele.get("_id"))
            .map(sameIdEles => defaultSameIdElesMax(sameIdEles))
            .toSet()
        : unionData;
      return state.set("data", nextData);

    case CLEAR_DISCUSSIONS:
      return state.set("data", Set());

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

/* Selectors */

export const getDiscussions = state => {
  return state.discussions.get("data");
};

export const getDiscussionsByForumBoard = (state, forumBoardId) => {
  const discussions = getDiscussions(state);
  return discussions.filter(d => d.get("forumBoard") === forumBoardId);
};

const _getRootDiscussions = memoize((discussions, fourmBoardGroup) => {
  return discussions.filter(d => {
    const inGroup =
      fourmBoardGroup && fourmBoardGroup !== "_all"
        ? d.get("forumBoardGroup") === fourmBoardGroup
        : true;
    return d.get("isRoot") && inGroup;
  });
}, createFastMemoizeDefaultOptions({ size: 1 }));

export const getRootDiscussions = (state, forumBoardId, fourmBoardGroup) => {
  const discussions = getDiscussionsByForumBoard(state, forumBoardId);
  return _getRootDiscussions(discussions, fourmBoardGroup);
};

const _getDiscussionById = memoize((discussions, id) => {
  return discussions.find(d => d.get("_id") === id);
}, createFastMemoizeDefaultOptions({ size: 5 }));

export const getDiscussionById = (state, id) => {
  const discussions = getDiscussions(state);
  return _getDiscussionById(discussions, id);
};

const _getChildDiscussions = memoize((discussions, parentDiscussionId) => {
  return discussions.filter(
    d => d.get("parentDiscussion") === parentDiscussionId
  );
}, createFastMemoizeDefaultOptions({ size: 1 }));

export const getChildDiscussions = (state, parentDiscussionId) => {
  const discussions = getDiscussions(state);
  return _getChildDiscussions(discussions, parentDiscussionId);
};

export const getUI = state => state.discussions.get("ui");

// Export Reducer
export default DiscussionReducer;
