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
  groups: List(),
  category: null,
  createdAt: null,
  updatedAt: null
};

export class ForumBoard extends Record(FORUM_BOARD_RECORD_DEFAULT) {
  static fromJS(obj = {}) {
    const record = new ForumBoard({
      ...obj,
      groups: List(obj.groups),
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt)
    });
    return record;
  }
}

const FORUM_BOARD_STATE_RECORD_DEFAULT = {
  ui: fromJS({}),
  data: Set()
};

export class ForumBoardState extends Record(FORUM_BOARD_STATE_RECORD_DEFAULT) {
  static fromJS({ ui, data = [] } = {}) {
    const record = new ForumBoardState({
      ui: fromJS(ui),
      data: Set(data.map(ForumBoard.fromJS))
    });
    return record;
  }
}

const initialState = ForumBoardState.fromJS();

const ForumBoardReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_FORUM_BOARD:
    case ADD_FORUM_BOARDS:
      const newForumBoards = action.forumBoards
        ? Set(action.forumBoards.map(ForumBoard.fromJS))
        : Set([ForumBoard.fromJS(action.forumBoard)]);
      const nextData = state.data
        .union(newForumBoards)
        .groupBy(x => x._id)
        .map(xs => xs.maxBy(x => x.updatedAt.getTime()))
        .toSet();
      return state.set("data", nextData);

    case CLEAR_FORUM_BOARDS:
      return state.set("data", Set());

    default:
      return state;
  }
};

export const getForumBoards = state => state.forumBoards.data;

export const getForumBoardById = (state, _id) =>
  getForumBoards(state).find(x => x._id === _id);

export const getForumBoard = getForumBoardById;

export const DiscussionSelector = {
  findById: getForumBoardById
};

// Export Reducer
export default ForumBoardReducer;
