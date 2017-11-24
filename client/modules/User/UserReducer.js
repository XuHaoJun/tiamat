import {
  ADD_USER,
  ADD_USERS,
  REMOVE_CURRENT_USER,
  SET_CURRENT_USER,
  REMOVE_CURRENT_ACCESS_TOKEN,
  SET_CURRENT_ACCESS_TOKEN
} from "./UserActions";
import { is, List, Set, fromJS } from "immutable";
import { connectDB } from "../../localdb";

// Initial State
const initialState = fromJS({
  users: Set(),
  currentUser: "",
  currentAccessToken: null
});

const UserReducer = (state = initialState, action) => {
  const db = connectDB();
  switch (action.type) {
    case ADD_USER:
    case ADD_USERS:
      if (!action.user && !action.users) {
        return state;
      }
      const newUsers = action.user
        ? Set([fromJS(action.user)])
        : Set(fromJS(action.users));
      const nextUsers = state
        .get("users")
        .union(newUsers)
        .groupBy(ele => ele.get("_id"))
        .map(ele => ele.maxBy(v => new Date(v.get("updatedAt")).getTime()))
        .toSet();
      if (db) {
        if (!is(state.get("users"), nextUsers)) {
          db.setItem("users", nextUsers.toJSON());
        }
      }
      return state.set("users", nextUsers);
    case REMOVE_CURRENT_USER:
      if (db) {
        db.removeItem("currentUser");
      }
      return state.set("currentUser", "");
    // TODO
    // rename to SET_CURRENT_USER_EMAIL?
    case SET_CURRENT_USER:
      const { email } = action;
      if (db) {
        db.setItem("currentUser", email);
      }
      return state.set("currentUser", email);
    case REMOVE_CURRENT_ACCESS_TOKEN:
      if (db) {
        db.removeItem("currentAccessToken");
      }
      return state.set("currentAccessToken", null);
    case SET_CURRENT_ACCESS_TOKEN:
      const { currentAccessToken } = action;
      const {
        tokenType,
        token,
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn
      } = currentAccessToken;
      const normalrized = fromJS({
        tokenType: tokenType || currentAccessToken.token_type,
        token: token || accessToken || currentAccessToken.access_token,
        refreshToken: refreshToken || currentAccessToken.refresh_token,
        expiresIn: expiresIn || currentAccessToken.expires_in,
        refreshExpiresIn:
          refreshExpiresIn || currentAccessToken.refresh_expires_in
      });
      if (db) {
        db.setItem("currentAccessToken", normalrized.toJSON());
      }
      return state.set("currentAccessToken", normalrized);
    default:
      const list2set = ["users"];
      for (const field of list2set) {
        if (List.isList(state.get(field))) {
          return state.set(field, state.get(field).toSet());
        }
      }
      return state;
  }
};

export const getUsers = state => state.user.get("users");

export const getCurrentUser = state =>
  state.user.get("users").find(user => {
    return user.get("email") === state.user.get("currentUser");
  });

export const getCurrentAccessToken = state =>
  state.user.get("currentAccessToken");

export const getIsLoggedIn = state => {
  const accessToken = getCurrentAccessToken(state);
  const user = getCurrentUser(state);
  const isLoggedIn = !!accessToken && !!user;
  return isLoggedIn;
};

export default UserReducer;
