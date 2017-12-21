import React from "react";
import { connect } from "react-redux";
import SendIcon from "material-ui/svg-icons/content/send";
import IconButton from "material-ui/IconButton";
import { getUI } from "../MyAppReducer";
import CircularProgress from "material-ui/CircularProgress";

class SendButton extends React.PureComponent {
  static muiName = IconButton.muiName;

  static defaultProps = {
    loading: false
  };

  renderLoading = () => {
    return (
      <IconButton>
        <CircularProgress size={24} color="#ffffff" />
      </IconButton>
    );
  };

  renderSendButton() {
    const { children, loading, dispatch, ...other } = this.props;
    return (
      <IconButton {...other}>
        <SendIcon />
      </IconButton>
    );
  }

  render() {
    const { loading } = this.props;
    return loading ? this.renderLoading() : this.renderSendButton();
  }
}

export const SendButtonWithoutConnect = SendButton;

function mapStateToProps(store) {
  const ui = getUI(store);
  const onTouchTap = ui.getIn(["sendButton", "onTouchTap"]);
  const onClick = ui.getIn(["sendButton", "onClick"]);
  const loading = !!ui.getIn(["sendButton", "loading"]);
  return { onTouchTap, onClick, loading };
}

export default connect(mapStateToProps, null, null, { withRef: true })(
  SendButton
);
