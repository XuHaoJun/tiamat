import React from 'react';
import {connect} from 'react-redux';
import SendIcon from 'material-ui/svg-icons/content/send';
import IconButton from 'material-ui/IconButton';
import {getUI} from '../MyAppReducer';
import CircularProgress from 'material-ui/CircularProgress';

class SendButton extends React.PureComponent {
  static defaultProps = {
    onTouchTap: () => {},
    loading: false
  };

  renderLoading = () => {
    return (
      <IconButton>
        <CircularProgress size={24} color="#ffffff"/>
      </IconButton>
    );
  }

  renderSendButton() {
    const {onTouchTap, style, iconStyle} = this.props;
    return (
      <IconButton onTouchTap={onTouchTap} style={style} iconStyle={iconStyle}><SendIcon/></IconButton>
    );
  }

  render() {
    return (this.props.loading
      ? this.renderLoading()
      : this.renderSendButton());
  }
}

function mapStateToProps(store) {
  const ui = getUI(store);
  const onTouchTap = ui.getIn(['sendButton', 'onTouchTap']);
  const loading = ui.getIn(['sendButton', 'loading']);
  return {onTouchTap, loading};
}

export default connect(mapStateToProps)(SendButton);
