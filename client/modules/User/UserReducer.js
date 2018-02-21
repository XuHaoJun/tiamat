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
  constructor(json = {}) {
    const {
      tokenType,
      token,
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn
    } = json;
    const normalrized = {
      tokenType: tokenType || json.token_type,
      token: token || accessToken || json.access_token,
      refreshToken: refreshToken || json.refresh_token,
      expiresIn: expiresIn || json.expires_in,
      refreshExpiresIn: refreshExpiresIn || json.refresh_expires_in
    };
    const record = super(normalrized);
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
  constructor(json = {}) {
    const record = super({
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt)
    });
    return record;
  }
}

const USER_STATE_RECORD_DEFAULT = {
  users: new Set(),
  currentUserEmail: null,
  currentAccessToken: null
};

export class UserState extends Record(USER_STATE_RECORD_DEFAULT) {
  constructor({ users = [], currentUser, currentAccessToken } = {}) {
    const record = super({
      users: new Set(users.map(user => new User(user))),
      currentUser,
      currentAccessToken: currentAccessToken
        ? new AccessToken(currentAccessToken)
        : null
    });
    return record;
  }
}

// Initial State
const initialState = new UserState();

const _UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER:
    case ADD_USERS:
      const newUsers = action.users
        ? new Set(action.users.map(d => new User(d)))
        : new Set([new User(action.user)]);
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
        ? new AccessToken(currentAccessToken)
        : null;
      return state.set("currentAccessToken", accessToken);

    default:
      return state;
  }
};

function syncLocalDB(state) {
  const db = connectDB();
  if (db) {
    db.setItem("currentUserEmail", state.currentUserEmail);
    db.setItem("currentAccessToken", state.currentAccessToken);
    db.setItem("users", state.users);
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
