/**
 * Root Component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { defaultProps, compose } from 'recompose';
import { hot } from 'react-hot-loader';

// redux
import { Provider as ReduxProvider } from 'react-redux';

// react-router
import { ConnectedRouter } from 'react-router-redux';
import { renderRoutes } from 'react-router-config';
import routes from './routes';

import shouldUpdateScroll from '../client/components/ScrollContainer/shouldUpdateScroll';
import { ScrollContext as ScrollContextOri } from 'react-router-scroll-4';

import { SheetsRegistry, JssProvider as JssProviderOri } from 'react-jss';
import { createGenerateClassName } from '@material-ui/core/styles';

import createMemoryHistory from 'history/createMemoryHistory';
import IntlWrapper from './modules/Intl/IntlWrapper';

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

const defaultJssProviderProps = {
  generateClassName: createGenerateClassName(),
  registry: new SheetsRegistry(),
};
const JssProvider = defaultProps({
  ...defaultJssProviderProps,
})(JssProviderOri);
const JssProviderHoc = Component => ({ JssProviderProps, ...other }) => (
  <JssProvider {...JssProviderProps}>
    <Component {...other} />
  </JssProvider>
);

const enhance = compose(
  ReduxProviderHoc,
  IntlWrapperHoc,
  RouterHoc,
  ScrollContextHoc,
  JssProviderHoc
);

const EnhancedWraper = enhance(React.Fragment);

const App = props => {
  const { store, JssProviderProps } = props;
  const ReduxProviderProps = { store };
  const history = store.getState().history.rawHistory;
  const RouterProps = { history };
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
  JssProviderProps: PropTypes.object,
};

App.defaultProps = {
  JssProviderProps: null,
};

export default hot(module)(App);
