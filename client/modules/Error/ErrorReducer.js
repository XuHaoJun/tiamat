import Immutable from 'immutable';
import { ADD_ERROR } from './ErrorActions';

// Initial State
const initialState = Immutable.fromJS({
  ui: {},
  data: {
    errors: [],
  },
});

const ErrorReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_ERROR:
      if (!action.error) {
        return state;
      }
      const error = Immutable.fromJS(action.error);
      const errors = state.getIn(['data', 'errors']).push(error);
      return state.setIn(['data', 'errors'], errors);
    default:
      return state;
  }
};

/* Selectors */

// Get all errors
export const getErrors = state => state.errors.getIn(['data', 'errors']);

export const getLastError = state => state.errors.getIn(['data', 'errors']).last();

// Export Reducer
export default ErrorReducer;
