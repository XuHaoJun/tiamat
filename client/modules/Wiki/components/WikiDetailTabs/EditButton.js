import * as React from "react";
import PropTypes from "prop-types";

import Portal from "material-ui-next/Portal";
import CreateIcon from "material-ui-icons-next/Create";
import Button from "material-ui-next/Button";

class EditButton extends React.Component {
  static propTypes = {
    isOpened: PropTypes.bool,
    href: PropTypes.string,
    onClick: PropTypes.func
  };

  static defaultProps = {
    isOpened: true,
    iconType: "create",
    href: "",
    onClick: () => {}
  };

  onClick = e => {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  };

  render() {
    const {
      style,
      isOpened,
      iconType,
      href,
      onTouchTap,
      onClick,
      ...other
    } = this.props;
    const _style = {
      position: "fixed",
      bottom: 20,
      right: 20
    };
    const finalStyle = Object.assign(_style, style || {});
    return (
      <Portal>
        <Button
          {...other}
          fab
          style={finalStyle}
          href={href}
          onClick={this.onClick}
        >
          <CreateIcon />
        </Button>
      </Portal>
    );
  }
}

export default EditButton;
