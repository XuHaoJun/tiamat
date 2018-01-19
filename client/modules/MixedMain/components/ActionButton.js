import React from "react";
import PropTypes from "prop-types";

import CreateIcon from "material-ui/svg-icons/content/create";
import AddIcon from "material-ui/svg-icons/content/add";
import FloatingActionButton from "material-ui/FloatingActionButton";

import { ROOT_WIKI_OR_WIKI_SLIDE } from "./MixedMainTabs";
import RootWikiMoreButton from "../../RootWiki/components/RootWikiMoreButton";

class ActionButton extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    iconType: PropTypes.oneOf(["create", "add"]),
    href: PropTypes.string,
    onTouchTap: PropTypes.func,
    onClick: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    isOpen: true,
    iconType: "create",
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
      this.context.router.push(this.props.href);
    }
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

  render() {
    const {
      slideIndex,
      targetKind,
      rootWikiId,
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
    if (
      targetKind === "rootWiki" &&
      rootWikiId &&
      slideIndex === ROOT_WIKI_OR_WIKI_SLIDE
    ) {
      return <RootWikiMoreButton style={finalStyle} rootWikiId={rootWikiId} />;
    } else {
      return (
        <FloatingActionButton
          {...other}
          style={finalStyle}
          href={href}
          onTouchTap={this.onTouchTap}
          onClick={this.onClick}
        >
          {iconType === "create" ? <CreateIcon /> : <AddIcon />}
        </FloatingActionButton>
      );
    }
  }
}

export default ActionButton;
