import React from "react";
import { Set } from "immutable";

import Button from "material-ui-next/Button";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle
} from "material-ui-next/Dialog";

class AddWikiPartDialog extends React.Component {
  static defaultProps = {
    open: false,
    rootWikiGroupTree: null,
    onRequestClose: () => {},
    wikis: Set()
  };

  state = { open: false, title: "haha" };

  render() {
    const { open } = this.props;
    const { title } = this.state;
    return (
      <Dialog disableBackdropClick open={open} onClose={this.onRequestClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>wiki part</DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button raised color="primary" onClick={this.handleSubmit}>
            確定
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AddWikiPartDialog;
