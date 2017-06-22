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

const defaultActions = {
  addDiscussion
};

export function createSocket(nsp = '', opts = {}, actions = defaultActions) {
  return (dispatch) => {
    const handlers = map(actions, (action, eventName) => {
      const method = 'on';
      const callback = (...args) => {
        return dispatch(action(...args));
      };
      return {method, eventName, callback};
    }).concat((() => {
      const method = 'once';
      const eventName = 'close';
      const callback = () => {
        return dispatch(removeSocket(nsp));
      };
      return {method, eventName, callback};
    })());
    return Promise.resolve(dispatch(addSocket(nsp, opts, handlers)));
  };
}
