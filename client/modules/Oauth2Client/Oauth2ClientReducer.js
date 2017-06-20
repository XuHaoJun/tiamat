import {SET_OAUTH2_CLIENT} from './Oauth2ClientActions';

const initialState = {
  app: null,
  facebook: null
};

const Oauth2ClientReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_OAUTH2_CLIENT:
      const {oauth2Client, source} = action;
      return Object.assign({}, state, {[source]: oauth2Client});
    default:
      return state;
  }
};

/* Selectors */

// Get userAgent
export const getOauth2Client = (state, source = 'app') => {
  return state.oauth2Client[source];
};

// Export Reducer
export default Oauth2ClientReducer;
