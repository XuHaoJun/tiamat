import { fromJS, Set, List } from "immutable";
import defaultSameIdElesMax from "../../util/defaultSameIdElesMax";
import { connectDB } from "../../localdb";
import {
  ADD_DISCUSSIONS,
  ADD_DISCUSSION,
  CLEAR_DISCUSSIONS,
  SET_DISCUSSIONS_UI,
  SET_CREATE_ROOT_DISCUSSION_PAGE_FORM
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

    case SET_CREATE_ROOT_DISCUSSION_PAGE_FORM:
      const { forumBoardId, form } = action;
      const newState = state.setIn(
        ["ui", "CreateRootDiscussionPage", "forms", forumBoardId],
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

// Get all posts
export const getRootDiscussions = (state, forumBoardId) => {
  return state.discussions
    .get("data")
    .filter(d => d.get("isRoot") && d.get("forumBoard") === forumBoardId);
};

export const getDiscussion = (state, id) => {
  return state.discussions.get("data").find(v => v.get("_id") === id);
};

export const getDiscussions = state => {
  return state.discussions.get("data");
};

export const getUI = state => state.discussions.get("ui");

// Export Reducer
export default DiscussionReducer;
