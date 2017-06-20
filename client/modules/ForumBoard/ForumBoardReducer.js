import {fromJS, Set, List} from 'immutable';
import {ADD_FORUM_BOARDS, ADD_FORUM_BOARD, CLEAR_FORUM_BOARDS} from './ForumBoardActions';

// Initial State
const initialState = fromJS({ui: {}, data: Set()});

const ForumBoardReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_FORUM_BOARD:
    case ADD_FORUM_BOARDS:
      if (!action.forumBoards && !action.forumBoard) {
        return state;
      }
      const newForumBoards = action.forumBoards
        ? fromJS(action.forumBoards).toSet()
        : Set([fromJS(action.forumBoard)]);
      const data = state
        .get('data')
        .union(newForumBoards)
        .groupBy(ele => ele.get('_id'))
        .map(ele => ele.maxBy(v => new Date(v.get('updatedAt')).getTime()))
        .toSet();
      return state.set('data', data);
    case CLEAR_FORUM_BOARDS:
      return state.set('data', Set());
    default:
      if (List.isList(state.get('data'))) {
        return state.set('data', state.get('data').toSet());
      }
      return state;
  }
};

/* Selectors */

// Get all posts
export const getForumBoards = state => state.forumBoards.get('data');

export const getForumBoardById = (state, _id) => state.forumBoards.get('data').find(v => v.get('_id') === _id);

// Export Reducer
export default ForumBoardReducer;
