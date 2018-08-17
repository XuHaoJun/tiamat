import React from "react";
import PropTypes from "prop-types";

import Portal from "@material-ui/core/Portal";
import { Link } from "react-router-dom";

import Button from "@material-ui/core/Button";
import ReplyIcon from "@material-ui/icons/Reply";

class ReplyButton extends React.PureComponent {
  static propTypes = {
    to: PropTypes.string
  };

  static defaultProps = {
    to: ""
  };

  render() {
    const { to, style, ...other } = this.props;
    const _style = {
      position: "fixed",
      bottom: 60,
      right: 10
    };
    const finalStyle = Object.assign(_style, style || {});
    // TODO
    // use dialog on browser large size
    return (
      <Portal>
        <Button
          variant="fab"
          style={finalStyle}
          color="primary"
          component={Link}
          to={to}
          {...other}
        >
          <ReplyIcon />
        </Button>
      </Portal>
    );
  }
}

export default ReplyButton;
