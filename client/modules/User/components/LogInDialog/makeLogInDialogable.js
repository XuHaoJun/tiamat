import React from "react";
import Loadable from "react-loadable";
import _ from "lodash";

const Loading = () => {
  return <div style={{ display: "none" }}>Loading LogInDialog</div>;
};

const LoginDialog = Loadable({
  loader: () => {
    const isServer = typeof window === "undefined";
    // use same Component with client-side and server-side for hydrate.
    if (isServer) {
      return Promise.resolve(Loading);
    } else {
      return import(/* webpackChunkName: "LoginDialog" */ "./LoginDialog");
    }
  },
  loading: Loading
});

function makeLogInDialogable(WrappedComponent, _options) {
  const options = _.defaults(_options, {
    openEventNames: ["onClick"],
    loginDialogPropsName: "loginDialogProps"
  });
  const { openEventNames, loginDialogPropsName } = options;
  class LoginDialogable extends React.Component {
    state = {
      open: false
    };

    handleRequestClose = () => {
      this.setState({ open: false });
      const loginDialogProps = this.props[loginDialogPropsName] || {};
      if (loginDialogProps.onRequestClose) {
        loginDialogProps.onRequestClose();
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
      const loginDialogProps = this.props[loginDialogPropsName] || {};
      const loginFormProps = {
        onClickSignUpButton: this.handleRequestClose
      };
      return (
        <div>
          <WrappedComponent {...this.props} {...eventHandlers} />
          <LoginDialog
            {...loginDialogProps}
            open={this.state.open}
            onRequestClose={this.handleRequestClose}
            loginFormProps={loginFormProps}
          />
        </div>
      );
    }
  }
  LoginDialogable.preload = LoginDialog.preload;
  return LoginDialogable;
}

export default makeLogInDialogable;
