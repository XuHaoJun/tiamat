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

import { MyAppState } from "./modules/MyApp/MyAppReducer";
import { UserState } from "./modules/User/UserReducer";
import { RootWikiState } from "./modules/RootWiki/RootWikiReducer";
import { WikiState } from "./modules/Wiki/WikiReducer";
import { DiscussionState } from "./modules/Discussion/DiscussionReducer";
import { ForumBoardState } from "./modules/ForumBoard/ForumBoardReducer";

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
    return import(/* webpackChunkName: "react-ga" */ "react-ga").then(
      module => {
        const ReactGA = module.default;
        ReactGA.initialize(code);
      }
    );
  } else {
    return Promise.resolve(null);
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

function decodeInitialState(obj = {}) {
  return {
    ...obj,
    app: MyAppState.fromJS(obj.app),
    oauth2Client: fromJS(obj.oauth2Client),
    user: UserState.fromJS(obj.user),
    wikis: WikiState.fromJS(obj.wikis),
    rootWikis: RootWikiState.fromJS(obj.rootWikis),
    errors: fromJS(obj.errors),
    forumBoards: ForumBoardState.fromJS(obj.forumBoards),
    discussions: DiscussionState.fromJS(obj.discussions),
    semanticRules: fromJS(obj.semanticRules),
    sockets: fromJS(obj.sockets),
    search: fromJS(obj.search),
    template: fromJS(obj.template)
  };
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

  const loadInitialPagePromise = loadInitialPage();

  const initState = decodeInitialState(window.__INITIAL_STATE__);

  // for react-router-redux
  initState.history = defaultHistoryInitialState;

  const store = configureStore(initState);

  // sync locale by intl module
  moment.locale(store.getState().intl.locale);

  // sync with server-side responsive state.
  const userAgent = defaultBrowserUserAgent(store.getState());
  store.dispatch(calculateResponsiveStateByUserAgent(userAgent));

  const mountElementId = "root";
  const mountApp = document.getElementById(mountElementId);
  debug(`mount application element id: ${mountElementId}`);

  await loadInitialPagePromise;

  debug("first hydrate start");

  await hydrateAsync(<App store={store} />, mountApp);

  debug("first hydrate end");

  const loadingDBLibPromise = loadDBAdapter();

  // client-slide update responsive state by window.
  store.dispatch(calculateResponsiveState(window));
  store.dispatch(setIsFirstRender(false));

  // db init
  // must after hydrate because db have user(access Token) for logIn, some ui data for restore
  await loadingDBLibPromise;
  const db = connectDB();
  if (db) {
    const initPs = initWithStore(db, store);
    await Promise.all(initPs)
      .then(() => {
        store.dispatch(setDBisInitialized(null, true));
      })
      .catch(err => {
        store.dispatch(setDBisInitialized(err, false));
      });
  }

  const initAnalyticsPromise = initAnalytics();

  const io = await import(/* webpackChunkName: "socket.io-client" */ "socket.io-client");
  store.dispatch(setSocketIO(io));

  await initAnalyticsPromise;

  debug("Application ready!");

  return { store, mountApp };
}

main();
