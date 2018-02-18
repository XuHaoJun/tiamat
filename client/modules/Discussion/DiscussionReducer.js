import { fromJS, Set, List } from "immutable";
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

// Initial State
const initialState = fromJS({
  ui: {
    CreateRootDiscussionPage: {
      forms: {
        // ${forumBoardId}: {   title: '',   content: null  }
      }
    }
  },
  data: Set()
});

const DiscussionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_DISCUSSION:
    case ADD_DISCUSSIONS:
      if (!action.discussions && !action.discussion) {
        return state;
      }
      const newDiscussions = action.discussions
        ? fromJS(action.discussions).toSet()
        : Set([fromJS(action.discussion)]);
      const data = state
        .get("data")
        .union(newDiscussions)
        .groupBy(ele => ele.get("_id"))
        .map(eles => defaultSameIdElesMax(eles))
        .toSet();
      return state.set("data", data);

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
      const list2set = ["data"];
      for (const field of list2set) {
        if (List.isList(state.get(field))) {
          return state.set(field, state.get(field).toSet());
        }
      }
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
