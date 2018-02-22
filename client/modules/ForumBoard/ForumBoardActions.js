import callApi from "../../util/apiCaller";
import { addError } from "../Error/ErrorActions";

// Export Constants
export const ADD_FORUM_BOARD = "ADD_FORUM_BOARD";
export const ADD_FORUM_BOARDS = "ADD_FORUM_BOARDS";
export const CLEAR_FORUM_BOARDS = "CLEAR_FORUM_BOARDS";

// Export Actions
export function addForumBoard(forumBoard) {
  return { type: ADD_FORUM_BOARD, forumBoard };
}

export function addForumBoards(forumBoards) {
  return { type: ADD_FORUM_BOARDS, forumBoards };
}

export function clearForumBoards() {
  return { type: CLEAR_FORUM_BOARDS };
}

export function fetchForumBoards(
  page = 1,
  limit = 10,
  sort = "-popularityCounter",
  reqConfig = {}
) {
  return dispatch => {
    return callApi(
      `forumBoards?sort=${sort}&page=${page}&limit=${limit}`,
      "get",
      null,
      reqConfig
    )
      .then(res => {
        const { forumBoards } = res;
        dispatch(addForumBoards(forumBoards));
        return forumBoards;
      })
      .catch(err => {
        return Promise.resolve(dispatch(addError(err.response.data))).then(
          () => {
            return Promise.reject(err);
          }
        );
      });
  };
}

export function fetchForumBoardById(_id) {
  return dispatch => {
    return callApi(`forumBoards/${_id}`)
      .then(res => {
        dispatch(addForumBoard(res.forumBoard));
        return res.forumBoard;
      })
      .catch(err => {
        return Promise.resolve(dispatch(addError(err.response.data))).then(
          () => {
            return Promise.reject(err);
          }
        );
      });
  };
}

export function addForumBoardRequest(forumBoard) {
  return dispatch => {
    return callApi("forumBoards", "post", { forumBoard })
      .then(res => {
        dispatch(addForumBoard(res.forumBoard));
        return res.forumBoard;
      })
      .catch(err => {
        return Promise.resolve(dispatch(addError(err.response.data))).then(
          () => {
            return Promise.reject(err);
          }
        );
      });
  };
}

export const Remote = {
  findById: fetchForumBoardById,
  getForumBoards: fetchForumBoards,
  add: addForumBoardRequest
};

export const ForumBoardRemote = Remote;
