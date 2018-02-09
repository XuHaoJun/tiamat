/**
 * Main store function
 */
import { createStore, applyMiddleware, compose } from "redux";

// middlewares
import { routerMiddleware } from "react-router-redux";
import thunk from "redux-thunk";
import { createResponsiveStoreEnhancer } from "redux-responsive";

import rootReducer from "./reducers";

export function configureStore(initialState = {}) {
  // Middleware and store enhancers
  const enhancers = [applyMiddleware(thunk)];

  if (process.env.CLIENT && process.env.NODE_ENV === "development") {
    // Enable DevTools only when rendering on client and during development.
    if (window.devToolsExtension) {
      enhancers.push(window.devToolsExtension());
    }
  }

  if (initialState.history && initialState.history.rawHistory) {
    enhancers.push(
      applyMiddleware(routerMiddleware(initialState.history.rawHistory))
    );
  }

  const responsiveStoreEnhancer = createResponsiveStoreEnhancer({
    calculateInitialState: false
  });

  const store = createStore(
    rootReducer,
    initialState,
    compose(responsiveStoreEnhancer, ...enhancers)
  );

  // For hot reloading reducers
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept("./reducers", () => {
      const nextReducer = require("./reducers").default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}

export default configureStore;
