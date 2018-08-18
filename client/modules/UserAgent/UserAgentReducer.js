import { SET_USER_AGENT } from './UserAgentActions';

const initialState = {
  data: '',
};

const UserAgentReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_AGENT:
      return { data: action.userAgent };

    default:
      return state;
  }
};

/* Selectors */

// Get userAgent
export const getUserAgent = state => {
  return state.userAgent.data;
};

// Export Reducer
export default UserAgentReducer;
