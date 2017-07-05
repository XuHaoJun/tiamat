import _ from "lodash";
import { SET_CURRENT_USER, SET_CURRENT_ACCESS_TOKEN } from "./UserActions";

// Initial State
const initialState = {
  currentUser: null,
  currentAccessToken: null
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      const currentUser = action.user;
      return Object.assign({}, _.cloneDeep(state), { currentUser });
    case SET_CURRENT_ACCESS_TOKEN:
      const currentAccessToken = action.currentAccessToken;
      return Object.assign({}, _.cloneDeep(state), { currentAccessToken });
    default:
      return state;
  }
};

export const getCurrentUser = state => state.user.currentUser;

export const getCurrentAccessToken = state => state.user.currentAccessToken;

export default UserReducer;
