import React from "react";

import LoginDialog from "./LoginDialog";

function makeLoginDialogable(
  WrappedComponent,
  options = { openEventNames: ["onClick"], loginDialogProps: {} }
) {
  const { openEventNames, loginDialogProps } = options;
  class LoginDialogable extends React.Component {
    state = {
      open: LoginDialog.defaultProps.open
    };

    handleRequestClose = () => {
      this.setState({ open: false });
      if (loginDialogProps.onRequestClose) {
        loginDialogProps.onRequestClose();
      }
    };

    render() {
      const eventHandlers = {};
      for (const eventName of openEventNames) {
        eventHandlers[eventName] = e => {
          this.setState({ open: true });
          if (this.props[eventName]) {
            this.props[eventName](e);
          }
        };
      }
      return (
        <div>
          <WrappedComponent {...this.props} {...eventHandlers} />
          <LoginDialog
            {...loginDialogProps}
            open={this.state.open}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      );
    }
  }
  LoginDialogable.defaultProps = WrappedComponent.defaultProps;
  return LoginDialogable;
}

export default makeLoginDialogable;
