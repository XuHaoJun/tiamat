import { fromJS, Set, List, Record } from "immutable";
import {
  ADD_FORUM_BOARDS,
  ADD_FORUM_BOARD,
  CLEAR_FORUM_BOARDS
} from "./ForumBoardActions";

const FORUM_BOARD_RECORD_DEFAULT = {
  _id: null,
  name: null,
  popularityCounter: 0,
  rootWiki: null,
  groups: new List(),
  category: null,
  createdAt: null,
  updatedAt: null
};

export class ForumBoard extends Record(FORUM_BOARD_RECORD_DEFAULT) {
  constructor(json = {}) {
    const record = super({
      ...json,
      groups: new List(json.groups),
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt)
    });
    return record;
  }
}

const FORUM_BOARD_STATE_RECORD_DEFAULT = {
  ui: fromJS({}),
  data: new Set()
};

export class ForumBoardState extends Record(FORUM_BOARD_STATE_RECORD_DEFAULT) {
  constructor({ ui, data = [] } = {}) {
    const record = super({
      ui: fromJS(ui),
      data: new Set(data.map(d => new ForumBoard(d)))
    });
    return record;
  }
}

const initialState = new ForumBoardState();

const ForumBoardReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_FORUM_BOARD:
    case ADD_FORUM_BOARDS:
      const newForumBoards = action.forumBoards
        ? new Set(action.forumBoards.map(d => new ForumBoard(d)))
        : new Set([new ForumBoard(action.forumBoard)]);
      const data = state
        .get("data")
        .union(newForumBoards)
        .groupBy(ele => ele.get("_id"))
        .map(ele => ele.maxBy(v => new Date(v.get("updatedAt")).getTime()))
        .toSet();
      return state.set("data", data);

    case CLEAR_FORUM_BOARDS:
      return state.set("data", Set());
    default:
      if (List.isList(state.get("data"))) {
        return state.set("data", state.get("data").toSet());
      }
      return state;
  }
};

/* Selectors */

// Get all posts
export const getForumBoards = state => state.forumBoards.get("data");

export const getForumBoardById = (state, _id) =>
  getForumBoards(state).find(v => v.get("_id") === _id);

export const getForumBoard = getForumBoardById;

// Export Reducer
export default ForumBoardReducer;
