/**
 * Root Component
 */
import React from "react";
import PropTypes from "prop-types";
import { defaultProps, compose } from "recompose";

// redux
import { Provider as ReduxProvider } from "react-redux";

// react-router
import { ConnectedRouter } from "react-router-redux";
import { renderRoutes } from "react-router-config";
import routes from "./routes";

import shouldUpdateScroll from "../client/components/ScrollContainer/shouldUpdateScroll";
import { ScrollContext as ScrollContextOri } from "react-router-scroll-4";

import { SheetsRegistry, JssProvider as JssProviderOri } from "react-jss";
import { createGenerateClassName } from "material-ui-next/styles";

import createMemoryHistory from "history/createMemoryHistory";
import { defaultBrowserHistory, injectQuery } from "./createBrowserHistory";
import IntlWrapper from "./modules/Intl/IntlWrapper";

const ReduxProviderHoc = Component => ({ ReduxProviderProps, ...other }) => (
  <ReduxProvider {...ReduxProviderProps}>
    <Component {...other} />
  </ReduxProvider>
);
const IntlWrapperHoc = Component => ({ IntlWrapperProps, ...other }) => (
  <IntlWrapper {...IntlWrapperProps}>
    <Component {...other} />
  </IntlWrapper>
);

// isomorphic Router.
const ServerRouter = defaultProps({ isSSR: true })(ConnectedRouter);
const ClientRouter = defaultProps({ isSSR: false })(ConnectedRouter);
const Router = process.browser ? ClientRouter : ServerRouter;
const RouterHoc = Component => ({ RouterProps, ...other }) => (
  <Router {...RouterProps}>
    <Component {...other} />
  </Router>
);

// isomorphic ScrollContext.
const ScrollContext = process.browser
  ? defaultProps({ shouldUpdateScroll })(ScrollContextOri)
  : React.Fragment;
const ScrollContextHoc = Component => ({ ScrollContextProps, ...other }) => (
  <ScrollContext {...ScrollContextProps}>
    <Component {...other} />
  </ScrollContext>
);

// isomorphic history.
function createHistory(location = "/") {
  if (process.browser) {
    // force use window.location.
    return defaultBrowserHistory;
  } else {
    const history = createMemoryHistory({
      initialEntries: [location]
    });
    injectQuery(history.location);
    history.listen(l => {
      injectQuery(l);
    });
    return history;
  }
}

const defaultJssProviderProps = {
  generateClassName: createGenerateClassName(),
  registry: new SheetsRegistry()
};
const JssProvider = defaultProps({
  ...defaultJssProviderProps
})(JssProviderOri);
const JssProviderHoc = Component => ({ JssProviderProps, ...other }) => (
  <JssProvider {...JssProviderProps}>
    <Component {...other} />
  </JssProvider>
);

const defaultLocation = "/";

const defaultHistory = createHistory(defaultLocation);

const enhance = compose(
  ReduxProviderHoc,
  IntlWrapperHoc,
  RouterHoc,
  ScrollContextHoc,
  JssProviderHoc
);

const EnhancedWraper = enhance(React.Fragment);

const App = props => {
  const { store, location, history, JssProviderProps } = props;
  const ReduxProviderProps = { store };
  const RouterProps = { location, history };
  if (location !== defaultLocation && history === defaultHistory) {
    RouterProps.history = createHistory(location);
  }
  if (process.env.NODE_ENV === "development") {
    RouterProps.key = Math.random();
  }
  return (
    <EnhancedWraper
      ReduxProviderProps={ReduxProviderProps}
      JssProviderProps={JssProviderProps}
      RouterProps={RouterProps}
    >
      {renderRoutes(routes)}
    </EnhancedWraper>
  );
};

App.propTypes = {
  store: PropTypes.object.isRequired,
  location: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  history: PropTypes.object,
  JssProviderProps: PropTypes.object
};
App.defaultProps = {
  location: defaultLocation,
  history: defaultHistory,
  JssProviderProps: null
};

export default App;
