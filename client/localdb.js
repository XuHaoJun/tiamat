import localForage from "localforage";
import {
  setCurrentAccessToken,
  addUsers,
  fetchCurrentUser
} from "./modules/User/UserActions";
import { getCurrentAccessToken, getUsers } from "./modules/User/UserReducer";
import { setOauth2Client } from "./modules/Oauth2Client/Oauth2ClientActions";
import { getOauth2Client } from "./modules/Oauth2Client/Oauth2ClientReducer";
import { setDiscussionUI } from "./modules/Discussion/DiscussionActions";

export function initAccessToken(db, store) {
  let p;
  const state = store.getState();
  const token = getCurrentAccessToken(state);
  if (!token) {
    p = db.getItem("currentAccessToken").then(currentAccessToken => {
      if (currentAccessToken) {
        store.dispatch(setCurrentAccessToken(currentAccessToken));
      }
      return getCurrentAccessToken(store.getState());
    });
  } else {
    p = Promise.resolve(token);
  }
  return p;
}

// init and dispatch to redux store.
export function initWithStore(db, store) {
  const state = store.getState();
  let ps = [];
  ps = ps.concat(
    initAccessToken(db, store).then(token => {
      if (token) {
        store.dispatch(fetchCurrentUser(token));
      }
    })
  );
  // TODO
  // may be force get users without check count?
  if (getUsers(state).count() === 0) {
    const p = db.getItem("users").then(users => {
      if (users) {
        store.dispatch(addUsers(users));
      }
    });
    ps.push(p);
  }
  if (getOauth2Client(state)) {
    db.setItem("oauth2Client", getOauth2Client(state)).catch(() => {});
  } else {
    const p = db.getItem("oauth2Client").then(oauth2Client => {
      if (oauth2Client) {
        store.dispatch(setOauth2Client(oauth2Client));
      }
    });
    ps.push(p);
  }
  const p = db.getItem("discussion:ui").then(ui => {
    if (ui) {
      store.dispatch(setDiscussionUI(ui));
    }
  });
  ps.push(p);
  return ps;
}

// TODO
// rename to getDB?
export function connectDB() {
  // never connect db on server side
  const db =
    typeof window !== "undefined" && typeof document !== "undefined"
      ? localForage
      : null;
  return db;
}
