import callApi from "../../util/apiCaller";
import qs from "qs";
import { addError } from "../Error/ErrorActions";

// Export Constants
export const ADD_DISCUSSION = "ADD_DISCUSSION";
export const ADD_DISCUSSIONS = "ADD_DISCUSSIONS";
export const SET_DISCUSSIONS_UI = "SET_DISCUSSIONS_UI";
export const CLEAR_DISCUSSIONS = "CLEAR_DISCUSSIONS";
export const SET_CREATE_ROOT_DISCUSSION_PAGE_FORM =
  "SET_CREATE_ROOT_DISCUSSION_PAGE_FORM";

// Export Actions
export function addDiscussion(discussion) {
  return { type: ADD_DISCUSSION, discussion };
}

export function addDiscussions(discussions) {
  return { type: ADD_DISCUSSIONS, discussions };
}

export function setDiscussionUI(ui) {
  return { type: SET_DISCUSSIONS_UI, ui };
}

export function clearDiscussions() {
  return { type: CLEAR_DISCUSSIONS };
}

export function setCreateRootDiscussionPageForm(forumBoardId, form) {
  return { type: SET_CREATE_ROOT_DISCUSSION_PAGE_FORM, forumBoardId, form };
}

export function fetchRootDiscussions(forumBoardId, _opts, reqConfig = {}) {
  const defaultFetchRootDiscussionsOptions = {
    page: 1,
    limit: 10,
    sort: "-updatedAt",
    forumBoardGroup: "",
    select: {}
  };
  const opts = Object.assign(defaultFetchRootDiscussionsOptions, _opts);
  const query = qs.stringify(opts);
  const url = `forumBoards/${forumBoardId}/rootDiscussions?${query}`;
  return dispatch => {
    return callApi(url, "get", null, reqConfig)
      .then(res => {
        dispatch(addDiscussions(res.discussions));
        return res.discussions;
      })
      .catch(err => {
        return Promise.resolve(
          dispatch(addError(err.response.data))
        ).then(() => {
          return Promise.reject(err);
        });
      });
  };
}

export function fetchDiscussions(forumBoardId = "", parentDiscussionId = "") {
  return dispatch => {
    return callApi(
      `discussions?forumBoardId=${forumBoardId}&parentDiscussionId=${parentDiscussionId}`
    )
      .then(res => {
        return dispatch(addDiscussions(res.discussions));
      })
      .catch(err => {
        return Promise.resolve(
          dispatch(addError(err.response.data))
        ).then(() => {
          return Promise.reject(err);
        });
      });
  };
}

export function fetchDiscussion(id) {
  return dispatch => {
    return callApi(`discussions/${id}`)
      .then(res => {
        dispatch(addDiscussion(res.discussion));
      })
      .catch(err => {
        return Promise.resolve(
          dispatch(addError(err.response.data))
        ).then(() => {
          return Promise.reject(err);
        });
      });
  };
}

export function addDiscussionRequest(discussion) {
  return dispatch => {
    return callApi("discussions", "post", { discussion })
      .then(res => {
        dispatch(addDiscussion(res.discussion));
        return res.discussion;
      })
      .catch(err => {
        return Promise.resolve(
          dispatch(addError(err.response.data))
        ).then(() => {
          return Promise.reject(err);
        });
      });
  };
}
