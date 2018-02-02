/**
 * Root Component
 */
import React from "react";
import PropTypes from "prop-types";
import defaultProps from "recompose/defaultProps";

// redux
import { Provider } from "react-redux";

// react-router
import { ConnectedRouter } from "react-router-redux";
import { renderRoutes } from "react-router-config";
import routes from "./routes";

import shouldUpdateScroll from "../client/components/ScrollContainer/shouldUpdateScroll";
import { ScrollContext as ScrollContextOri } from "react-router-scroll-4";

import { SheetsRegistry } from "react-jss/lib/jss";
import JssProviderOri from "react-jss/lib/JssProvider";
import { createGenerateClassName } from "material-ui-next/styles";

import createMemoryHistory from "history/createMemoryHistory";
import { defaultBrowserHistory } from "./createBrowserHistory";
import IntlWrapper from "./modules/Intl/IntlWrapper";

// isomorphic Router.
const ServerRouter = defaultProps({ isSSR: true })(ConnectedRouter);
const ClientRouter = defaultProps({ isSSR: false })(ConnectedRouter);
const Router = process.browser ? ClientRouter : ServerRouter;

// isomorphic ScrollContext.
export const ScrollContext = process.browser
  ? defaultProps({ shouldUpdateScroll })(ScrollContextOri)
  : React.Fragment;

// isomorphic history.
export function createHistory(location = "/") {
  return process.browser
    ? defaultBrowserHistory
    : createMemoryHistory({
        initialEntries: [location]
      });
}

const defaultJssProviderProps = {
  generateClassName: createGenerateClassName(),
  sheetsRegistry: new SheetsRegistry()
};
const JssProvider = defaultProps({
  ...defaultJssProviderProps
})(JssProviderOri);

const App = props => {
  const { store, location, history, JssProviderProps } = props;
  const routerProps = { location, history };
  if (process.env.NODE_ENV === "development") {
    routerProps.key = Math.random();
  }
  // TODO
  // refactor it by hoc?
  // const EnhancedWraper = compose(wrapReduxProvider, wrapIntlWrapper,
  //                         wrapRouter, wrapScrollContext);
  // <EnhancedWraper
  //   ReduxProviderProps={{store}}
  //   JssProviderProps={JssProviderProps}
  //   RouterProps=......
  // >
  return (
    <Provider store={store}>
      <IntlWrapper>
        <Router {...routerProps}>
          <ScrollContext>
            <JssProvider {...JssProviderProps}>
              {renderRoutes(routes)}
            </JssProvider>
          </ScrollContext>
        </Router>
      </IntlWrapper>
    </Provider>
  );
};

App.propTypes = {
  store: PropTypes.object.isRequired,
  location: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  history: PropTypes.object,
  JssProviderProps: PropTypes.object
};

const defaultLocation = "/";

const defaultHistory = createHistory(defaultLocation);

App.defaultProps = {
  location: defaultLocation,
  history: defaultHistory,
  JssProviderProps: {}
};

export default App;
