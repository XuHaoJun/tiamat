import React from "react";
import PropTypes from "prop-types";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import LogInForm from "../LogInForm";

class LoginDialog extends React.Component {
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

  setFormRef = form => {
    if (form) {
      if (form.getWrappedInstance) {
        this.form = form.getWrappedInstance();
      } else {
        this.form = form;
      }
    } else {
      this.form = form;
    }
  };

  handleClose = () => {
    if (this.props.onRequestClose) {
      this.props.onRequestClose();
    }
  };

  handleLogin = () => {
    if (this.form) {
      if (this.form.login) {
        this.form.login();
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
    const { open } = this.props;
    let { loginFormProps } = this.props;
    loginFormProps = loginFormProps || {};
    return (
      <Dialog modal={true} actions={actions} open={open}>
        <div
          style={{ height: "100%", display: "flex", justifyContent: "center" }}
        >
          <LogInForm ref={this.setFormRef} {...loginFormProps} />
        </div>
      </Dialog>
    );
  }
}

export default LoginDialog;
