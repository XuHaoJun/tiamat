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
import shouldUpdateScroll from "../client/components/ScrollContainer/shouldUpdateScroll";

// Import Routes
import routes from "./routes";

function logPageView() {
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    process.env.CLIENT
  ) {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
  }
}

const useScrollMiddleware = useScroll({
  shouldUpdateScroll
});

export default function App(props) {
  const { store } = props;
  // Create an enhanced history that syncs navigation events with the store
  const history = syncHistoryWithStore(browserHistory, store);
  // Send to google analytics on page change.
  const routerKey =
    process.env.NODE_ENV === "development" ? Math.random() : undefined;
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
