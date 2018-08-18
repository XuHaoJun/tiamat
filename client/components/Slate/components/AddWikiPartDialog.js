import React from 'react';
import { Set } from 'immutable';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

class AddWikiPartDialog extends React.Component {
  static defaultProps = {
    open: false,
    rootWikiGroupTree: null,
    onRequestClose: () => {},
    wikis: Set(),
  };

  state = { open: false, title: 'haha' };

  render() {
    const { open } = this.props;
    const { title } = this.state;
    return (
      <Dialog disableBackdropClick open={open} onClose={this.onRequestClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>wiki part</DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button variant="raised" color="primary" onClick={this.handleSubmit}>
            確定
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AddWikiPartDialog;
