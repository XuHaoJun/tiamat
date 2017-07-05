import qs from "qs";
import callApi from "../../util/apiCaller";
import { addError } from "../Error/ErrorActions";

// Export Constants
export const ADD_SEARCH_RESULT = "ADD_SEARCH_RESULT";
export const ADD_SEARCH_HISTORY = "ADD_SEARCH_HISTORY";

// Export Actions
export function addSearchResult(searchResult) {
  return { type: ADD_SEARCH_RESULT, searchResult };
}

export function addSearchHistory(searchHistory) {
  return { type: ADD_SEARCH_HISTORY, searchHistory };
}

const defaultQueryOptions = {
  q: undefined,
  title: undefined,
  content: undefined,
  parentDiscussionId: "null",
  highlight: true,
  page: 1,
  limit: 5
};

export function fetchSearchResult(
  target = "",
  _queryOptions = defaultQueryOptions
) {
  const queryOptions = Object.assign({}, defaultQueryOptions, _queryOptions);
  if (queryOptions.parentDiscussionId === null) {
    queryOptions.parentDiscussionId = "null";
  }
  return dispatch => {
    const resource = target ? `/${target}` : "";
    return callApi(`search${resource}?${qs.stringify(queryOptions)}`)
      .then(res => {
        dispatch(addSearchResult(res));
        return res;
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

export const search = fetchSearchResult;
