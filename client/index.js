/**
 * Client entry point
 */
import Debug from "debug";
import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { fromJS } from "immutable";
import { calculateResponsiveState } from "redux-responsive";
import injectTapEventPlugin from "react-tap-event-plugin";
import MobileDetect from "mobile-detect";
import App from "./App";
import { configureStore } from "./store";
import { setUserAgent } from "./modules/UserAgent/UserAgentActions";
import { getUserAgent } from "./modules/UserAgent/UserAgentReducer";
import { connectDB, initWithStore } from "./localdb";
import { setSocket } from "./modules/Socket/SocketActions";
import ReactGA from "react-ga";
import googleAnalyticsConfig from "../server/configs/googleAnalytics";

const debug = Debug("app:main");

function initDebug() {
  if (window.localStorage) {
    if (process.env.DEBUG) {
      localStorage.setItem("debug", process.env.DEBUG);
      debug(`init env DEBUG: ${process.env.DEBUG}`)
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
  const initState = {};
  const needImmutableObjectList = [
    "app",
    "wikis",
    "rootWikis",
    "errors",
    "forumBoards",
    "discussions",
    "semanticRules",
    "sockets",
    "search"
  ];
  for (const field of needImmutableObjectList) {
    initState[field] = fromJS(jsonState[field]);
  }
  return initState;
}
const initState = deserializeJSONState(window.__INITIAL_STATE__);
const store = configureStore(initState);
function injectTapEventPluginHelper() {
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
store.dispatch(calculateResponsiveState(window));
const db = connectDB();
if (db) {
  initWithStore(db, store);
}

const mountElementId = "root";
const mountApp = document.getElementById(mountElementId);
debug(`mount application element id: ${mountElementId}`);

render(
  <AppContainer>
    <App store={store} />
  </AppContainer>,
  mountApp
);

// For hot reloading of react components
if (module.hot) {
  debug("start hot reload!")
  module.hot.accept("./App", () => {
    // If you use Webpack 2 in ES modules mode, you can use <App /> here rather than require() a
    // <NextApp />.
    const NextApp = require("./App").default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextApp store={store} />
      </AppContainer>,
      mountApp
    );
  });
  debug("end hot reload!")
}

debug("Application started");
