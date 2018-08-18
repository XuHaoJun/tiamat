import React from 'react';
import Loadable from 'react-loadable';
import _ from 'lodash';

const Loading = () => {
  return <div style={{ display: 'none' }}>Loading LogInDialog</div>;
};

const LoginDialogLoadable = Loadable({
  loader: () => {
    const isServer = typeof window === 'undefined';
    // use same Component with client-side and server-side for hydrate.
    if (isServer) {
      return Promise.resolve(Loading);
    } else {
      return import(/* webpackChunkName: "LoginDialog" */ './LoginDialog');
    }
  },
  loading: Loading,
});

function makeLogInDialogable(WrappedComponent, _options) {
  const options = _.defaults(_options, {
    enableLazyLoad: true,
    lazyLoadEvents: ['onMouseOver'],
    openEventNames: ['onClick'],
    loginDialogPropsName: 'loginDialogProps',
  });
  const { openEventNames, loginDialogPropsName } = options;
  class LoginDialogable extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        open: false,
        LogInDialog: () => null,
      };
    }

    handleRequestClose = () => {
      this.setState({ open: false });
      const loginDialogProps = this.props[loginDialogPropsName] || {};
      if (loginDialogProps.onRequestClose) {
        loginDialogProps.onRequestClose();
      }
    };

    handlePreload = () => {
      if (this.state.LogInDialog !== LoginDialogLoadable) {
        this.setState({
          LogInDialog: LoginDialogLoadable,
        });
      }
    };

    render() {
      const eventHandlers = {};
      for (const eventName of openEventNames) {
        eventHandlers[eventName] = (...args) => {
          this.setState({ open: true });
          if (this.props[eventName]) {
            this.props[eventName](...args);
          }
        };
      }
      const preloadEventName = 'onMouseOver';
      const mouseOverOpen = eventHandlers[preloadEventName];
      eventHandlers[preloadEventName] = (...args) => {
        this.handlePreload();
        if (mouseOverOpen) {
          mouseOverOpen(...args);
        }
        if (this.props[preloadEventName]) {
          this.props[preloadEventName](...args);
        }
      };
      const loginDialogProps = this.props[loginDialogPropsName] || {};
      const loginFormProps = {
        onClickSignUpButton: this.handleRequestClose,
      };
      const { open, LogInDialog } = this.state;
      return (
        <div>
          <WrappedComponent {...this.props} {...eventHandlers} />
          <LogInDialog
            {...loginDialogProps}
            open={open}
            onRequestClose={this.handleRequestClose}
            loginFormProps={loginFormProps}
          />
        </div>
      );
    }
  }
  LoginDialogable.defaultProps = WrappedComponent.defaultProps;
  LoginDialogable.preload = LoginDialogLoadable.preload;
  return LoginDialogable;
}

export default makeLogInDialogable;
