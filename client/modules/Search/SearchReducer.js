import { fromJS } from 'immutable';
import { ADD_SEARCH_RESULT } from './SearchActions';

// Initial State
const initialState = fromJS({ maxResults: 3, results: [] });

const SearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_SEARCH_RESULT:
      const result = fromJS(action.searchResult);
      const maxResults = state.get('maxResults');
      const results = state.get('results');
      const nextResults = (() => {
        let next = results;
        if (results.count() >= maxResults) {
          next = next.shift();
        } else {
          next = next.push(result);
        }
        return next;
      })();
      return state.set('results', nextResults);
    default:
      return state;
  }
};

/* Selectors */

// Get all searchHistory
export const getSearchResults = state => state.search.get('results');

export const getLastSearchResult = state => state.search.get('results').last();

export default SearchReducer;
