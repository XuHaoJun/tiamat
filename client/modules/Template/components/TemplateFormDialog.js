import React from "react";
import PropTypes from "prop-types";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import TemplateForm from "./TemplateForm";

class TemplateFormDialog extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onRequestClose: PropTypes.func,
    templateProps: PropTypes.object
  };

  static defaultProps = {
    open: false,
    onRequestClose: undefined,
    templateProps: undefined
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
        label="儲存"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleLogin}
      />
    ];
    const { open } = this.props;
    let { templateProps } = this.props;
    templateProps = templateProps || {};
    return (
      <Dialog modal={true} actions={actions} open={open}>
        <div
          style={{ height: "100%", display: "flex", justifyContent: "center" }}
        >
          <TemplateForm ref={this.setFormRef} {...templateProps} />
        </div>
      </Dialog>
    );
  }
}

export default TemplateFormDialog;
