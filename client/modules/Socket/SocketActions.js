import {addDiscussion} from '../Discussion/DiscussionActions';
import map from 'lodash/map';

// Export Constants
export const ADD_SOCKET = 'ADD_SOCKET';
export const REMOVE_SOCKET = 'REMOVE_SOCKET';

// Export Actions
export function addSocket(nsp = '', opts = {}, handlers = []) {
  return {type: ADD_SOCKET, nsp, opts, handlers};
}

export function removeSocket(nsp = '') {
  return {type: REMOVE_SOCKET, nsp};
}

export function createSocket(nsp = '', opts = {}) {
  return (dispatch) => {
    const actions = {
      addDiscussion
    };
    const handlers = map(actions, (action, eventName) => {
      const callback = (...args) => {
        dispatch(action(...args));
      };
      return {method: 'on', eventName, callback};
    });
    return Promise.resolve(dispatch(addSocket(nsp, opts, handlers)));
  };
}
