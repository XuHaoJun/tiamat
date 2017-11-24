import qs from "qs";
import callApi from "../../util/apiCaller";
import { defaultRequestErrorHandler } from "../Error/ErrorActions";

export const ADD_USER = "ADD_USER";
export const ADD_USERS = "ADD_USERS";
export const SET_CURRENT_USER = "SET_CURRENT_USER";
export const REMOVE_CURRENT_USER = "REMOVE_CURRENT_USER";
export const SET_CURRENT_ACCESS_TOKEN = "SET_CURRENT_ACCESS_TOKEN";
export const REMOVE_CURRENT_ACCESS_TOKEN = "REMOVE_CURRENT_ACCESS_TOEKN";
export const USER_LOGOUT = "USER_LOGOUT";

export function addUser(user) {
  return { type: ADD_USER, user };
}

export function addUsers(users) {
  return { type: ADD_USER, users };
}

export function removeCurrentUser() {
  return { type: REMOVE_CURRENT_USER };
}

export function setCurrentUser(email) {
  return { type: SET_CURRENT_USER, email };
}

export function removeCurrentAccessToken() {
  return { type: REMOVE_CURRENT_ACCESS_TOKEN };
}

export function setCurrentAccessToken(currentAccessToken) {
  return { type: SET_CURRENT_ACCESS_TOKEN, currentAccessToken };
}

export function fetchValidateUser({ emailExists }, reqConfig = {}) {
  const form = { emailExists };
  return callApi(
    `validates/user?${qs.stringify(form)}`,
    "get",
    null,
    reqConfig
  );
}

export function fetchAccessToken(
  { email, username, password, oauth2Client, clientId, clientSecret, scope },
  reqConfig = {}
) {
  const form = {
    username: email || username,
    password,
    scope: scope || "all",
    grant_type: "password",
    client_id: clientId || oauth2Client.get("_id"),
    client_secret: clientSecret || oauth2Client.get("secret")
  };
  return dispatch => {
    return callApi("oauth2/token", "post", form, reqConfig)
      .then(res => {
        dispatch(setCurrentAccessToken(res));
        return res;
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}

// may be rename it?
function getToken(accessToken) {
  let token;
  if (!token) {
    return "";
  }
  if (typeof accessToken === "string") {
    token = accessToken;
  } else if (accessToken.token) {
    token = accessToken.token; // eslint-disable-line
  } else if (accessToken.access_token) {
    token = accessToken.access_token; // eslint-disable-line
  } else if (accessToken.get) {
    token = accessToken.get("token");
  }
  return token;
}

export function fetchCurrentUser(accessToken = {}) {
  const token = getToken(accessToken);
  const q = {
    access_token: token
  };
  return dispatch => {
    return callApi(`currentUser?${qs.stringify(q)}`)
      .then(res => {
        const { user } = res;
        const { email } = user;
        dispatch(addUser(user));
        dispatch(setCurrentUser(email));
        return user;
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}

export function logInRequest({ email, password, oauth2Client } = {}) {
  return dispatch => {
    return dispatch(fetchAccessToken({ email, password, oauth2Client })).then(
      accessToken => dispatch(fetchCurrentUser(accessToken))
    );
  };
}

export function logOutRequest(accessToken) {
  const token = getToken(accessToken);
  return dispatch => {
    return callApi(`oauth2/tokens/${token}`, "delete")
      .then(() => {
        // TODO
        // use batchActions?
        dispatch(removeCurrentUser());
        dispatch(removeCurrentAccessToken());
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}

export function fetchtUser(id, accessToken) {
  const token = getToken(accessToken);
  const q = {
    access_token: token
  };
  return dispatch => {
    return callApi(`users/${id}?${qs.stringify(q)}`)
      .then(res => {
        const { user } = res;
        dispatch(addUser(user));
        return user;
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}

export function addUserRequest(user) {
  return dispatch => {
    return callApi("users", "post", { user })
      .then(res => {
        dispatch(addUser(res.user));
        return res.user;
      })
      .catch(err => defaultRequestErrorHandler(dispatch, err));
  };
}
