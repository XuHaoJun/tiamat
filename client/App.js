/**
 * Root Component
 */
import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { Router, browserHistory, applyRouterMiddleware } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import useScroll from "react-router-scroll/lib/useScroll";
import IntlWrapper from "./modules/Intl/IntlWrapper";
import ReactGA from "react-ga";

// Import Routes
import routes from "./routes";

// Base stylesheet
require("./main.css");

function logPageView() {
  if (window && process.env.NODE_ENV === "production") {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
  }
}

const useScrollMiddleware = useScroll((prevRouterProps, routerProps) => {
  if (prevRouterProps) {
    if (
      prevRouterProps.location.pathname === routerProps.location.pathname &&
      routerProps.location.action === "REPLACE"
    ) {
      return false;
    }
    let isSameComponent = false;
    prevRouterProps.components.forEach((component, index) => {
      isSameComponent = routerProps.components[index] === component;
    });
    return !isSameComponent;
  }
  return true;
});

export default function App(props) {
  const { store } = props;
  // Create an enhanced history that syncs navigation events with the store
  const history = syncHistoryWithStore(browserHistory, store);
  // Send to google analytics on page change.
  const routerKey =
    process.env.NODE_ENV !== "production" ? Math.random() : undefined;
  return (
    <Provider store={store}>
      <IntlWrapper>
        <Router
          key={routerKey}
          history={history}
          render={applyRouterMiddleware(useScrollMiddleware)}
          onUpdate={logPageView}
        >
          {routes}
        </Router>
      </IntlWrapper>
    </Provider>
  );
}

App.propTypes = {
  store: PropTypes.object.isRequired
};
