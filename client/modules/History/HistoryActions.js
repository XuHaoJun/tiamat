import { LOCATION_CHANGE } from 'react-router-redux';

export const SET_HISTORY_STATE = 'SET_HISTORY';
export const SET_RAW_HISTORY = 'SET_RAW_HISTORY';
export const SET_HISTORY_CURSOR = 'SET_HISTORY_CURSOR';
export const CLEAR_HISTORY_BY_CURSOR = 'CLEAR_HISTORY_BY_CURSOR';

// FIXME
// don't use window.history.
export function dirtyPushState(location) {
  if (typeof window !== 'undefined' && window.history) {
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

export function clearHistoryByCursor(cursor) {
  return { type: CLEAR_HISTORY_BY_CURSOR, cursor };
}

export function setHistory(state) {
  return { type: SET_HISTORY_STATE, state };
}

export function setRawHistory(rawHistory) {
  return { type: SET_RAW_HISTORY, rawHistory };
}
