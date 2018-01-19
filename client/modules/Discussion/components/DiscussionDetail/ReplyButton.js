import React from "react";
import PropTypes from "prop-types";
import ReplyIcon from "material-ui/svg-icons/content/reply";
import FloatingActionButton from "material-ui/FloatingActionButton";

class ReplyButton extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    href: PropTypes.string,
    onTouchTap: PropTypes.func,
    onClick: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    isOpen: true,
    href: "",
    onTouchTap: () => {},
    onClick: () => {}
  };

  onTouchTap = e => {
    if (e.nativeEvent.which === 3 || !this.props.href) {
      return;
    }
    const { href } = this.props;
    if (href) {
      e.preventDefault();
      this.context.router.push(href);
    }
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
      <FloatingActionButton
        {...other}
        style={finalStyle}
        href={href}
        onTouchTap={this.onTouchTap}
        onClick={this.onClick}
      >
        <ReplyIcon href={href} />
      </FloatingActionButton>
    );
  }
}

export default ReplyButton;
