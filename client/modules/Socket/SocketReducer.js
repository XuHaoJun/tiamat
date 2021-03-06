import { fromJS } from 'immutable';
import { ADD_SOCKET, REMOVE_SOCKET, SET_SOCKET_IO } from './SocketActions';

const initialState = fromJS({ sockets: {}, io: null });

function createSocket(io, nsp, _opts = {}, handlers = []) {
  const opts = _opts;
  let query = {};
  if (opts.accessToken) {
    query = { access_token: opts.accessToken.get('token') };
    // don't need pass to io.
    delete opts.accessToken;
  }
  if (!opts.query) {
    opts.query = query;
  } else {
    opts.query = Object.assign(opts.query, query);
  }
  const socket = io(nsp, opts);
  handlers.forEach(handler => {
    const { method, eventName, callback } = handler;
    socket[method](eventName, callback);
  });
  return socket;
}

// TODO
// drop guest socket connection if logIn and then use access token connect.
const SocketReducer = (state = initialState, action) => {
  // never create socket client on server-side.
  if (typeof window === 'undefined') {
    return state;
  }
  const io = state.get('io');
  if (!io) {
    return state;
  }
  switch (action.type) {
    case SET_SOCKET_IO: {
      return state.set('io', action.io);
    }
    case ADD_SOCKET: {
      const { nsp, opts, handlers } = action;
      const sockets = state.get('sockets');
      const found = sockets.get(nsp);
      // reuse same namespace.
      if (found) {
        if (opts.forceNew) {
          found.disconnect();
          const socket = createSocket(io, nsp, opts, handlers);
          const nextSockets = sockets.set(nsp, socket);
          return state.set('sockets', nextSockets);
        } else {
          // TODO
          // update socket handlers.
          return state;
        }
      } else {
        const socket = createSocket(io, nsp, opts, handlers);
        const nextSockets = sockets.set(nsp, socket);
        return state.set('sockets', nextSockets);
      }
    }
    case REMOVE_SOCKET: {
      const { nsp } = action;
      const sockets = state.get('sockets');
      const found = sockets.get(nsp);
      if (found) {
        found.disconnect();
      }
      const nextSockets = sockets.delete(nsp);
      return state.set('sockets', nextSockets);
    }
    default:
      return state;
  }
};

export const getSocket = (state, nsp = '/') => {
  return state.sockets.get('sockets').get(nsp);
};

export default SocketReducer;
