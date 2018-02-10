import React from "react";
import PropTypes from "prop-types";

import Portal from "material-ui-next/Portal";
import { Link } from "react-router-dom";

import Button from "material-ui-next/Button";
import ReplyIcon from "material-ui-icons-next/Reply";

class ReplyButton extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    href: PropTypes.string,
    onClick: PropTypes.func
  };

  static defaultProps = {
    isOpen: true,
    href: "",
    onClick: () => {}
  };

  setPortalRef = v => {
    this.portal = v;
  };

  render() {
    const {
      style,
      isOpen,
      iconType,
      href,
      onTouchTap,
      onClick,
      ...other
    } = this.props;
    if (!isOpen) {
      return null;
    }
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
          {...other}
          variant="fab"
          style={finalStyle}
          color="primary"
          component={Link}
          to={href}
          onClick={this.onClick}
        >
          <ReplyIcon href={href} />
        </Button>
      </Portal>
    );
  }
}

export default ReplyButton;
