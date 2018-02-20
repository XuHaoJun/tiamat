import qs from "qs";

import callApi from "../../util/apiCaller";
import { addError } from "../Error/ErrorActions";

// Export Constants
export const ADD_DISCUSSION = "ADD_DISCUSSION";
export const ADD_DISCUSSIONS = "ADD_DISCUSSIONS";
export const SET_DISCUSSIONS_UI = "SET_DISCUSSIONS_UI";
export const CLEAR_DISCUSSIONS = "CLEAR_DISCUSSIONS";
export const SET_UPSERT_DISCUSSION_PAGE_FORM =
  "SET_UPSERT_DISCUSSION_PAGE_FORM";

// Export Actions
export function addDiscussion(discussion) {
  return { type: ADD_DISCUSSION, discussion };
}

export function addDiscussions(discussions = []) {
  return { type: ADD_DISCUSSIONS, discussions };
}

export function setDiscussionUI(ui) {
  return { type: SET_DISCUSSIONS_UI, ui };
}

export function clearDiscussions() {
  return { type: CLEAR_DISCUSSIONS };
}

export function setUpsertDiscussionPageForm(forumBoardId, form) {
  return { type: SET_UPSERT_DISCUSSION_PAGE_FORM, forumBoardId, form };
}

export function fetchRootDiscussions(forumBoardId, _opts, reqConfig = {}) {
  const defaultFetchRootDiscussionsOptions = {
    page: 1,
    limit: 10,
    sort: "-updatedAt",
    forumBoardGroup: "",
    select: { content: 0 }
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
        return Promise.resolve(dispatch(addError(err.response.data))).then(
          () => {
            return Promise.reject(err);
          }
        );
      });
  };
}

export function fetchDiscussions({ parentDiscussionId = "" }) {
  return dispatch => {
    return callApi(`discussions/${parentDiscussionId}/childDiscussions`)
      .then(res => {
        dispatch(addDiscussions(res.discussions));
        return res;
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

export function fetchDiscussionByTest(
  test = { updatedAt: { $lte: new Date() } },
  { select, sort } = {}
) {
  const search = `?${qs.stringify({ test, select, sort })}`;
  return dispatch => {
    return callApi(`discussion${search}`).then(data => {
      dispatch(addDiscussion(data.discussion));
    });
  };
}

export function fetchDiscussionById(id = "") {
  return dispatch => {
    return callApi(`discussions/${id}`)
      .then(res => {
        dispatch(addDiscussion(res.discussion));
        return res;
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

export function addDiscussionRequest(discussion, accessToken) {
  const q = qs.stringify({ access_token: accessToken.get("token") });
  return dispatch => {
    return callApi(`discussions?${q}`, "post", { discussion })
      .then(res => {
        dispatch(addDiscussion(res.discussion));
        return res.discussion;
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
