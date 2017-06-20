import localForage from 'localforage';
import {setCurrentAccessToken} from './modules/User/UserActions';
import {getCurrentAccessToken} from './modules/User/UserReducer';
import {setOauth2Client} from './modules/Oauth2Client/Oauth2ClientActions';
import {getOauth2Client} from './modules/Oauth2Client/Oauth2ClientReducer';
import {setDiscussionUI} from './modules/Discussion/DiscussionActions';

// init and dispatch to redux store.
export function initWithStore(db, store) {
  const state = store.getState();
  if (!getCurrentAccessToken(state)) {
    db
      .getItem('currentAccessToken')
      .then((currentAccessToken) => {
        store.dispatch(setCurrentAccessToken(currentAccessToken));
      })
      .catch(() => {});
  }
  if (getOauth2Client(state)) {
    db
      .setItem('oauth2Client', getOauth2Client(state))
      .catch(() => {});
  } else {
    db
      .getItem('oauth2Client')
      .then((oauth2Client) => {
        if (oauth2Client) {
          store.dispatch(setOauth2Client(oauth2Client));
        }
      })
      .catch(() => {});
  }
  db.getItem('discussion:ui')
  .then((ui) => {
    if (ui) {
      store.dispatch(setDiscussionUI(ui));
    }
  });
}

export function connectDB() {
  const db = window && document
    ? localForage
    : null;
  return db;
}
