import React from "react";
import PropTypes from "prop-types";
import CreateIcon from "material-ui/svg-icons/content/create";
import FloatingActionButton from "material-ui/FloatingActionButton";
import Portal from "react-portal-minimal";

class EditButton extends React.PureComponent {
  static propTypes = {
    isOpened: PropTypes.bool,
    href: PropTypes.string,
    onTouchTap: PropTypes.func,
    onClick: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object
  };

  static defaultProps = {
    isOpened: true,
    iconType: "create",
    href: "",
    onTouchTap: () => {},
    onClick: () => {}
  };

  onTouchTap = e => {
    if (e.nativeEvent.which === 3 || !this.props.href) {
      return;
    }
    this.context.router.push(this.props.href);
    e.preventDefault();
    if (this.props.onTouchTap) {
      this.props.onTouchTap(e);
    }
  };

  onClick = e => {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  };

  setPortalRef = v => {
    this.portal = v;
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
      <Portal isOpened={isOpened} ref={this.setPortalRef}>
        <FloatingActionButton
          {...other}
          style={finalStyle}
          href={href}
          onTouchTap={this.onTouchTap}
          onClick={this.onClick}
        >
          <CreateIcon />
        </FloatingActionButton>
      </Portal>
    );
  }
}

export default EditButton;
