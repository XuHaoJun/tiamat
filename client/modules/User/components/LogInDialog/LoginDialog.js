import React from "react";
import PropTypes from "prop-types";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import LogInForm from "../LogInForm";

class LoginDialog extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool,
    onRequestClose: PropTypes.func,
    loginFormProps: PropTypes.object
  };

  static defaultProps = {
    open: false,
    onRequestClose: undefined,
    loginFormProps: undefined
  };

  handleClose = () => {
    if (this.props.onRequestClose) {
      this.props.onRequestClose();
    }
  };

  handleLogin = () => {
    if (this.form) {
      if (this.form.login) {
        const p = this.form.login();
        if (p.then) {
          p.then(() => {
            this.handleClose();
          });
        }
      }
    }
  };

  render() {
    const actions = [
      <FlatButton label="取消" primary={true} onClick={this.handleClose} />,
      <FlatButton
        label="登入"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleLogin}
      />
    ];
    let { loginFormProps } = this.props;
    loginFormProps = loginFormProps || {};
    return (
      <Dialog modal={true} actions={actions} open={this.props.open}>
        <div
          style={{ height: "100%", display: "flex", justifyContent: "center" }}
        >
          <LogInForm
            ref={form => {
              this.form = form;
            }}
            {...loginFormProps}
          />
        </div>
      </Dialog>
    );
  }
}

export default LoginDialog;
