import React from "react";
import { Set } from "immutable";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";

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
    const actions = [
      <FlatButton label="取消" onTouchTap={this.handleCancel} />,
      <RaisedButton
        label="確定"
        primary={true}
        onTouchTap={this.handleSubmit}
      />
    ];
    return (
      <Dialog
        title={title}
        actions={actions}
        modal={true}
        open={open}
        autoScrollBodyContent={true}
      >
        wiki list
      </Dialog>
    );
  }
}

export default AddWikiPartDialog;
