import { is, Set, Record } from "immutable";
import defaultSameIdElesMax from "../../util/defaultSameIdElesMax";

import {
  ADD_USER,
  ADD_USERS,
  REMOVE_CURRENT_USER,
  SET_CURRENT_USER_EMAIL,
  REMOVE_CURRENT_ACCESS_TOKEN,
  SET_CURRENT_ACCESS_TOKEN
} from "./UserActions";
import { connectDB } from "../../localdb";

const ACCESS_TOKEN_RECORD_DEFAULT = {
  tokenType: null,
  token: null,
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  refreshExpiresIn: null
};

export class AccessToken extends Record(ACCESS_TOKEN_RECORD_DEFAULT) {
  static fromJS(obj = {}) {
    const {
      tokenType,
      token,
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn
    } = obj;
    const normalrized = {
      tokenType: tokenType || obj.token_type,
      token: token || accessToken || obj.access_token,
      refreshToken: refreshToken || obj.refresh_token,
      expiresIn: expiresIn || obj.expires_in,
      refreshExpiresIn: refreshExpiresIn || obj.refresh_expires_in
    };
    const record = new AccessToken(normalrized);
    return record;
  }
}

const USER_RECORD_DEFAULT = {
  _id: null,
  email: null,
  displayName: null,
  avatarURL: null,
  profile: null,
  createdAt: null,
  updatedAt: null
};

export class User extends Record(USER_RECORD_DEFAULT) {
  static fromJS(obj = {}) {
    const record = new User({
      ...obj,
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt)
    });
    return record;
  }
}

const USER_STATE_RECORD_DEFAULT = {
  users: Set(),
  currentUserEmail: null,
  currentAccessToken: null
};

export class UserState extends Record(USER_STATE_RECORD_DEFAULT) {
  static fromJS({ users = [], currentUser, currentAccessToken } = {}) {
    const record = new UserState({
      users: Set(users.map(User.fromJS)),
      currentUser,
      currentAccessToken: currentAccessToken
        ? AccessToken.fromJS(currentAccessToken)
        : null
    });
    return record;
  }
}

// Initial State
const initialState = UserState.fromJS();

const _UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER:
    case ADD_USERS:
      const newUsers = action.users
        ? Set(action.users.map(User.fromJS))
        : Set([User.fromJS(action.user)]);
      const unionUsers = state.users.union(newUsers);
      const nextUsers = !is(unionUsers, state.users)
        ? unionUsers
          .groupBy(ele => ele.get("_id"))
          .map(sameIdEles => defaultSameIdElesMax(sameIdEles))
          .toSet()
        : unionUsers;
      return state.set("users", nextUsers);

    case REMOVE_CURRENT_USER:
      return state.set("currentUserEmail", null);

    case SET_CURRENT_USER_EMAIL:
      const { email } = action;
      return state.set("currentUserEmail", email);

    case REMOVE_CURRENT_ACCESS_TOKEN:
      return state.set("currentAccessToken", null);

    case SET_CURRENT_ACCESS_TOKEN:
      const { currentAccessToken } = action;
      const accessToken = currentAccessToken
        ? AccessToken.fromJS(currentAccessToken)
        : null;
      return state.set("currentAccessToken", accessToken);

    default:
      return state;
  }
};

function syncLocalDB(state) {
  const db = connectDB();
  if (db) {
    if (state.currentUserEmail) {
      db.setItem("currentUserEmail", state.currentUserEmail);
    } else {
      db.removeItem("currentUserEmail");
    }
    if (state.currentAccessToken) {
      db.setItem("currentAccessToken", state.currentAccessToken.toJS());
    } else {
      db.removeItem("currentAccessToken");
    }
    if (state.users) {
      db.setItem("users", state.users.toJS());
    } else if (!state.users || state.users.count() === 0) {
      db.removeItem("users");
    } else {
      db.removeItem("users");
    }
  }
}

const UserReducer = (state = initialState, action) => {
  const nextState = _UserReducer(state, action);
  if (!is(state, nextState)) {
    syncLocalDB(nextState);
  }
  return nextState;
};

export const getUsers = state => state.user.users;

export const getCurrentUser = state =>
  getUsers(state).find(user => {
    return user.email === state.user.currentUserEmail;
  });

export const getCurrentAccessToken = state => state.user.currentAccessToken;

export const getIsLoggedIn = state => {
  const accessToken = getCurrentAccessToken(state);
  const user = getCurrentUser(state);
  const isLoggedIn = Boolean(accessToken) && Boolean(user);
  return isLoggedIn;
};

export default UserReducer;
