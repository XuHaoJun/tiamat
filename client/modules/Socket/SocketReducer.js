import {fromJS} from 'immutable';
import io from 'socket.io-client';
import {ADD_SOCKET, REMOVE_SOCKET} from './SocketActions';

const initialState = fromJS({sockets: {}});

const SocketReducer = (state = initialState, action) => {
  // never create socket client on server-side.
  if (typeof window === 'undefined') {
    return state;
  }
  switch (action.type) {
    case ADD_SOCKET:
      return (() => {
        const {nsp, opts, handlers} = action;
        const sockets = state.get('sockets');
        const found = sockets.get(nsp);
        // reuse same namespace.
        if (found) {
          if (opts.forceNew) {
            const socket = io(nsp, opts);
            handlers.forEach((handler) => {
              const {method, eventName, callback} = handler;
              socket[method](eventName, callback);
            });
            if (found.connected) {
              found.destroy();
            }
            const nextSockets = sockets.set(nsp, socket);
            return state.set('sockets', nextSockets);
          } else {
            return state;
          }
        } else {
          const socket = io(nsp, opts);
          handlers.forEach((handler) => {
            const {method, eventName, callback} = handler;
            socket[method](eventName, callback);
          });
          const nextSockets = sockets.set(nsp, socket);
          return state.set('sockets', nextSockets);
        }
      })();
    case REMOVE_SOCKET:
      return (() => {
        const {nsp} = action;
        const sockets = state.get('sockets');
        const found = sockets.get(nsp);
        if (found && found.connected) {
          found.destroy();
        }
        const nextSockets = sockets.delete(nsp);
        return state.set('sockets', nextSockets);
      })();
    default:
      return state;
  }
};

export const getSocket = (state, nsp = '/') => {
  return state
    .sockets
    .get('sockets')
    .get(nsp);
};

export default SocketReducer;
