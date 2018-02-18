/**
 * Client entry point
 */
import Debug from "debug";
import React from "react";
import { hydrate } from "react-dom";
import { fromJS } from "immutable";
import { calculateResponsiveState } from "redux-responsive";
import Loadable from "react-loadable";
import moment from "moment";

import { matchRoutes } from "react-router-config";
import routes from "./routes";

import {
  loadDBAdapter,
  connectDB,
  initWithStore,
  initAccessToken
} from "./localdb";

import App from "./App";
import { configureStore } from "./store";
import { setSocketIO } from "./modules/Socket/SocketActions";
import { setUserAgent } from "./modules/UserAgent/UserAgentActions";
import { getUserAgent } from "./modules/UserAgent/UserAgentReducer";
import googleAnalyticsConfig from "../server/configs/googleAnalytics";
import { calculateResponsiveStateByUserAgent } from "./modules/Browser/BrowserActions";
import {
  setIsFirstRender,
  setDBisInitialized
} from "./modules/MyApp/MyAppActions";
import { defaultInitialState as defaultHistoryInitialState } from "./modules/History/HistoryReducer";

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

function defaultBrowserUserAgent(state) {
  const userAgent = getUserAgent(state);
  if (!userAgent) {
    if (process.browser) {
      return window.navigator.userAgent;
    } else {
      return "Node.js/6.8.0 (OS X Yosemite; x64)";
    }
  } else {
    return userAgent;
  }
}

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

function isLoadableComponent(component) {
  return typeof component === "function" && component.preload;
}

async function loadInitialPage() {
  await Loadable.preloadReady();
  const pathname = window.location.pathname;
  return await Promise.all(
    matchRoutes(routes, pathname)
      .filter(({ route }) => {
        const { component } = route;
        return isLoadableComponent(component);
      })
      .map(({ route }) => {
        const { component } = route;
        return component.preload();
      })
  );
}

function hydrateAsync(component, dom) {
  return new Promise((resolve, reject) => {
    hydrate(component, dom, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  if (process.env.NODE_ENV === "development") {
    initDebug();
  }

  const loadingDBLibPromise = loadDBAdapter();

  const loadInitialPagePromise = loadInitialPage();

  const initState = deserializeJSONState(window.__INITIAL_STATE__);

  // for react-router-redux
  initState.history = defaultHistoryInitialState;

  const store = configureStore(initState);

  // sync locale by intl module
  moment.locale(store.getState().intl.locale);

  // sync with server-side responsive state.
  const userAgent = defaultBrowserUserAgent(store.getState());
  store.dispatch(calculateResponsiveStateByUserAgent(userAgent));

  await loadInitialPagePromise;

  const mountElementId = "root";
  const mountApp = document.getElementById(mountElementId);
  debug(`mount application element id: ${mountElementId}`);

  debug("first hydrate start");

  await hydrateAsync(<App store={store} />, mountApp);

  debug("first hydrate end");

  // client-slide update responsive state by window.
  store.dispatch(calculateResponsiveState(window));
  store.dispatch(setIsFirstRender(false));

  // db init
  // must after hydrate because db have user(access Token) for logIn, some ui data for restore
  await loadingDBLibPromise;
  const db = connectDB();
  if (db) {
    const initPs = initWithStore(db, store);
    Promise.all(initPs)
      .then(() => {
        store.dispatch(setDBisInitialized(null, true));
      })
      .catch(err => {
        store.dispatch(setDBisInitialized(err, false));
      });
  }

  initAnalytics();

  const io = await import(/* webpackChunkName: "socket.io-client" */ "socket.io-client");
  store.dispatch(setSocketIO(io));

  debug("Application ready!");

  return { store, mountApp };
}

function ready(callback) {
  // in case the document is already rendered
  if (document.readyState != "loading") callback();
  else if (document.addEventListener)
    // modern browsers
    document.addEventListener("DOMContentLoaded", callback);
  else
    // IE <= 8
    document.attachEvent("onreadystatechange", () => {
      if (document.readyState == "complete") callback();
    });
}

ready(() => main());
