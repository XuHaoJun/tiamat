/**
 * Client entry point
 */
import Debug from "debug";
import React from "react";
import { render, hydrate } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { fromJS } from "immutable";
import { calculateResponsiveState } from "redux-responsive";
import injectTapEventPlugin from "react-tap-event-plugin";
import MobileDetect from "mobile-detect";
import App from "./App";
import { configureStore } from "./store";
import { setUserAgent } from "./modules/UserAgent/UserAgentActions";
import { getUserAgent } from "./modules/UserAgent/UserAgentReducer";
import { connectDB, initWithStore, initAccessToken } from "./localdb";
import { setSocket } from "./modules/Socket/SocketActions";
import { loadComponents } from "loadable-components";
import ReactGA from "react-ga";
import googleAnalyticsConfig from "../server/configs/googleAnalytics";
import { calculateResponsiveStateByUserAgent } from "./modules/Browser/BrowserActions";
import Loadable from "react-loadable";
import moment from "moment";

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
  Debug("app:googleAnalytics")(`googleAnalytics code: ${code}`);
  if (process.env.NODE_ENV === "production" && code) {
    ReactGA.initialize(code);
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
    "search"
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

function injectTapEventPluginHelper() {
  const userAgent = defaultBrowserUserAgent(store.getState());
  const md = new MobileDetect(userAgent);
  injectTapEventPlugin({
    shouldRejectClick: (lastTouchEventTimestamp, clickEventTimestamp) => {
      if (md.mobile()) {
        return true;
      } else if (
        lastTouchEventTimestamp &&
        clickEventTimestamp - lastTouchEventTimestamp < 750
      ) {
        return true;
      }
    }
  });
}
injectTapEventPluginHelper();

const mountElementId = "root";
const mountApp = document.getElementById(mountElementId);
debug(`mount application element id: ${mountElementId}`);

Loadable.preloadReady().then(() => {
  // sync locale by intl module
  moment.locale(store.getState().intl.locale);
  // sync with server-side responsive state.
  const userAgent = defaultBrowserUserAgent(store.getState());
  store.dispatch(calculateResponsiveStateByUserAgent(userAgent));
  debug("first hydrate start");
  hydrate(
    <AppContainer>
      <App store={store} />
    </AppContainer>,
    mountApp
  );
  debug("first hydrate end");
  // client-slide update responsive state by window.
  store.dispatch(calculateResponsiveState(window));
  // db init
  // must after hydrate because have user(access Token) for logIn, some ui data for restore
  // will hydrate fail if init db before hydrate.
  const db = connectDB();
  if (db) {
    initWithStore(db, store);
  }
  debug("Application started");
});

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
