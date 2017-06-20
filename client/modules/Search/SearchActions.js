import callApi from '../../util/apiCaller';

// Export Constants
export const ADD_SEARCH_RESULTS = 'ADD_SEARCH_RESULTS';
export const ADD_SEARCH_LOGS = 'ADD_SEARCH_LOGS';
export const CLIENT_INIT_SEARCH_RESULTS = 'CLIENT_INIT_SEARCH_RESULTS';

// Export Actions
export function addSearchResults(searchResults) {
  return {type: ADD_SEARCH_RESULTS, searchResults};
}

export function addSearchLogs(searchLogs) {
  return {type: ADD_SEARCH_LOGS, searchLogs};
}

export function clientInitSearchResults() {
  return {type: CLIENT_INIT_SEARCH_RESULTS};
}

export function fetchSearchResults(query) {
  return (dispatch) => {
    if (query === '') {
      return dispatch(addSearchResults([]));
    }
    return callApi(`search?query=${query}`).then((res) => {
      dispatch(addSearchResults(res.searchResults));
    });
  };
}

export function fetchSearchLogs() {
  return (dispatch) => {
    return callApi('search/logs').then((res) => {
      dispatch(addSearchLogs(res.searchLogs));
    });
  };
}
