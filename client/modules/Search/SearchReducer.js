import {ADD_SEARCH_RESULTS, ADD_SEARCH_LOGS, CLIENT_INIT_SEARCH_RESULTS} from './SearchActions';

// Initial State
const initialState = {
  data: [],
  logs: [],
};

const SearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SEARCH_RESULTS:
      return {data: action.searchResults, logs: state.logs};

    case ADD_SEARCH_LOGS:
      return {logs: action.searchLogs, data: state.data};

    case CLIENT_INIT_SEARCH_RESULTS:
      return initialState;

    default:
      return state;
  }
};

/* Selectors */

// Get all searchResults
export const getSearchResults = state => state.search.data;

// Get all searchLogs
export const getSearchLogs = state => state.search.logs;

export default SearchReducer;
