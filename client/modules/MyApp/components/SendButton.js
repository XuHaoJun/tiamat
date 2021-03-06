import React from 'react';
import { connect } from 'react-redux';

import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';

import { getUI } from '../MyAppReducer';

class SendButton extends React.PureComponent {
  static defaultProps = {
    loading: false,
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
  const onClick = ui.getIn(['sendButtonProps', 'onClick']);
  const loading = !!ui.getIn(['sendButtonProps', 'loading']);
  return { onClick, loading };
}

export default connect(
  mapStateToProps,
  null,
  null,
  { withRef: true }
)(SendButton);
