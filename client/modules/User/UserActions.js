// import callApi from '../../util/apiCaller';

export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const SET_CURRENT_ACCESS_TOKEN = 'SET_CURRENT_ACCESS_TOKEN';

export function setCurrentUser(user) {
  return {type: SET_CURRENT_USER, user};
}

export function setCurrentAccessToken(currentAccessToken) {
  return {type: SET_CURRENT_ACCESS_TOKEN, currentAccessToken};
}

export function fetchCurrentUser(accessToken) {
  // return callApi(`titleTrees/${sclass}`).then((res) => {
  //   dispatch(setCurrentUser(sclass, res.titleTree));
  // });
}
