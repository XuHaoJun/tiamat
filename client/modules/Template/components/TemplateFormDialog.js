import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

import TemplateForm from './TemplateForm';

class TemplateFormDialog extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onRequestClose: PropTypes.func,
    templateProps: PropTypes.object,
  };

  static defaultProps = {
    open: false,
    onRequestClose: undefined,
    templateProps: undefined,
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
    const actions = [];
    const { open } = this.props;
    let { templateProps } = this.props;
    templateProps = templateProps || {};
    return (
      <Dialog disableBackdropClick open={open}>
        <DialogContent>
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <TemplateForm ref={this.setFormRef} {...templateProps} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button label="取消" onClick={this.handleClose} />,
          <Button label="儲存" color="primary" focusRipple={true} onClick={this.handleLogin} />
        </DialogActions>
      </Dialog>
    );
  }
}

export default TemplateFormDialog;
