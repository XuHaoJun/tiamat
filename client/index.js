/**
 * Client entry point
 */
import Debug from "debug";
import React from "react";
import { hydrate } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { fromJS } from "immutable";
import { calculateResponsiveState } from "redux-responsive";
import injectTapEventPlugin from "react-tap-event-plugin";
import MobileDetect from "mobile-detect";
import Loadable from "react-loadable";
import moment from "moment";

import App from "./App";
import { configureStore } from "./store";
import { setSocketIO } from "./modules/Socket/SocketActions";
import { setUserAgent } from "./modules/UserAgent/UserAgentActions";
import { getUserAgent } from "./modules/UserAgent/UserAgentReducer";
import {
  loadDBLib,
  connectDB,
  initWithStore,
  initAccessToken
} from "./localdb";
import googleAnalyticsConfig from "../server/configs/googleAnalytics";
import { calculateResponsiveStateByUserAgent } from "./modules/Browser/BrowserActions";
import {
  setIsFirstRender,
  setDBisInitialized
} from "./modules/MyApp/MyAppActions";

const debug = Debug("app:main");

function initDebug() {
  if (window.localStorage) {
    if (process.env.DEBUG) {
      localStorage.setItem("debug", process.env.DEBUG);
      debug(`init env DEBUG: ${process.env.DEBUG}`);
    } else {
      localStorage.removeItem("debug");
    }
  }
}
initDebug();

function initAnalytics() {
  const { code } = googleAnalyticsConfig;
  if (process.env.NODE_ENV === "production" && Boolean(code)) {
    Debug("app:googleAnalytics")(`googleAnalytics code: ${code}`);
    import(/* webpackChunkName: "react-ga" */ "react-ga").then(module => {
      const ReactGA = module.default;
      ReactGA.initialize(code);
    });
  }
}
initAnalytics();

// Initialize store
function deserializeJSONState(jsonState) {
  const initState = Object.assign({}, jsonState);
  const needImmutableObjectNames = [
    "app",
    "oauth2Client",
    "user",
    "wikis",
    "rootWikis",
    "errors",
    "forumBoards",
    "discussions",
    "semanticRules",
    "sockets",
    "search",
    "template"
  ];
  for (const field of needImmutableObjectNames) {
    initState[field] = fromJS(jsonState[field]);
  }
  return initState;
}
const initState = deserializeJSONState(window.__INITIAL_STATE__);
const store = configureStore(initState);

function defaultBrowserUserAgent(state) {
  const userAgent = getUserAgent(state);
  if (!userAgent) {
    if (window) {
      return window.navigator.userAgent;
    } else {
      return "Node.js/6.8.0 (OS X Yosemite; x64)";
    }
  } else {
    return userAgent;
  }
}

// function injectTapEventPluginHelper() {
//   const userAgent = defaultBrowserUserAgent(store.getState());
//   const md = new MobileDetect(userAgent);
//   injectTapEventPlugin({
//     shouldRejectClick: (lastTouchEventTimestamp, clickEventTimestamp) => {
//       if (md.mobile()) {
//         return true;
//       } else if (
//         lastTouchEventTimestamp &&
//         clickEventTimestamp - lastTouchEventTimestamp < 750
//       ) {
//         return true;
//       }
//     }
//   });
// }
// injectTapEventPluginHelper();

const loadingDBLib = loadDBLib();

const mountElementId = "root";
const mountApp = document.getElementById(mountElementId);
debug(`mount application element id: ${mountElementId}`);

// sync locale by intl module
moment.locale(store.getState().intl.locale);
// sync with server-side responsive state.
const userAgent = defaultBrowserUserAgent(store.getState());
store.dispatch(calculateResponsiveStateByUserAgent(userAgent));
// should wait loadable ready before component start request another component.
Loadable.preloadReady().then(() => {
  debug("first hydrate start");
  hydrate(
    <AppContainer>
      <App store={store} />
    </AppContainer>,
    mountApp,
    () => {
      debug("first hydrate end");
      // client-slide update responsive state by window.
      store.dispatch(calculateResponsiveState(window));
      store.dispatch(setIsFirstRender(false));
      // db init
      // must after hydrate because have user(access Token) for logIn, some ui data for restore
      // will hydrate fail if init db before hydrate.
      loadingDBLib
        .then(() => {
          const db = connectDB();
          if (db) {
            const initPs = initWithStore(db, store);
            return Promise.all(initPs)
              .then(() => {
                store.dispatch(setDBisInitialized(null, true));
              })
              .catch(err => {
                store.dispatch(setDBisInitialized(err, false));
              });
          } else {
            return Promise.resolve(null);
          }
        })
        .finally(() => {
          import(/* webpackChunkName: "socket.io-client" */ "socket.io-client").then(
            io => {
              store.dispatch(setSocketIO(io));
            }
          );
        });
    }
  );
});

debug("Application ready!");

// For hot reloading of react components
if (module.hot) {
  debug("start hot reload!");
  module.hot.accept("./App", () => {
    hydrate(
      <AppContainer>
        <App store={store} />
      </AppContainer>,
      mountApp
    );
  });
  debug("end hot reload!");
}
