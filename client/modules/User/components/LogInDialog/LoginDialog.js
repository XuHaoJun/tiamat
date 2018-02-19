import React from "react";
import PropTypes from "prop-types";

import Dialog, { DialogContent, DialogActions } from "material-ui-next/Dialog";
import Button from "material-ui-next/Button";

import LogInForm from "../LogInForm";

class LoginDialog extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onRequestClose: PropTypes.func,
    loginFormProps: PropTypes.object
  };

  static defaultProps = {
    open: false,
    loginFormProps: {}
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
    const { open } = this.props;
    let { loginFormProps } = this.props;
    loginFormProps = loginFormProps || {};
    return (
      <Dialog disableBackdropClick open={open} onClose={this.handleClose}>
        <DialogContent>
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center"
            }}
          >
            <LogInForm ref={this.setFormRef} {...loginFormProps} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.handleClose}>
            取消
          </Button>
          <Button
            color="primary"
            keyboardFocused={true}
            onClick={this.handleLogin}
          >
            登入
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default LoginDialog;
