/**
 * Client entry point
 */
import React from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import App from "./App";
import { configureStore } from "./store";
import { setUserAgent } from "./modules/UserAgent/UserAgentActions";
import { getUserAgent } from "./modules/UserAgent/UserAgentReducer";
import { connectDB, initWithStore } from "./localdb";
import { setSocket } from "./modules/Socket/SocketActions";
import { fromJS } from "immutable";
import { calculateResponsiveState } from "redux-responsive";
import injectTapEventPlugin from "react-tap-event-plugin";
import MobileDetect from "mobile-detect";

import ReactGA from "react-ga";
import googleAnalyticsConfig from "../server/configs/googleAnalytics";

if (window && process.env.NODE_ENV === "production") {
  const code = googleAnalyticsConfig.code;
  ReactGA.initialize(code);
}

// Use for material-ui.
const defaultBrowserUserAgent = (state = null) => {
  const userAgent = getUserAgent(state);
  if (state && userAgent) {
    return userAgent;
  } else {
    if (window && !userAgent) {
      return window.navigator.userAgent;
    }
    return "Node.js/6.8.0 (OS X Yosemite; x64)";
  }
};

// Initialize store
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
  window.__INITIAL_STATE__[field] = fromJS(window.__INITIAL_STATE__[field]);
}
const store = configureStore(window.__INITIAL_STATE__);
// calculate the initial state
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
store.dispatch(calculateResponsiveState(window));
const db = connectDB();
if (db) {
  initWithStore(db, store);
}

const mountApp = document.getElementById("root");

render(
  <AppContainer>
    <App store={store} />
  </AppContainer>,
  mountApp
);

// For hot reloading of react components
if (module.hot) {
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
}
