import { LOCATION_CHANGE } from "react-router-redux";

export const SET_HISTORY_STATE = "SET_HISTORY_STATE";
export const SET_HISTORY_CURSOR = "SET_HISTORY_CURSOR";

// FIXME
// don't use window.history.
export function dirtyPushState(location) {
  if (typeof window !== "undefined" && window.history) {
    window.history.pushState(location.state, null, location.pathname);
  }
}

export function dirtyPush(location) {
  const payload = location;
  return { type: LOCATION_CHANGE, payload };
}

export function setHistoryCursor(cursor) {
  return { type: SET_HISTORY_CURSOR, cursor };
}

export function setHistory(state) {
  return { type: SET_HISTORY_STATE, state };
}
