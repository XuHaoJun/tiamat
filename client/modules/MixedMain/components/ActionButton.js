import React from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import Button from "material-ui-next/Button";
import CreateIcon from "material-ui-icons-next/Create";
import AddIcon from "material-ui-icons-next/Add";
import Zoom from "material-ui-next/transitions/Zoom";

import { ROOT_WIKI_OR_WIKI_SLIDE } from "./MixedMainTabs";
import RootWikiMoreButton from "../../RootWiki/components/RootWikiMoreButton";

class ActionButton extends React.PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    iconType: PropTypes.oneOf(["create", "add"]),
    href: PropTypes.string
  };

  static defaultProps = {
    isOpen: true,
    iconType: "create",
    href: ""
  };

  renderButton = () => {
    const {
      slideIndex,
      targetKind,
      rootWikiId,
      style,
      iconType,
      href,
      onClick,
      isOpen,
      ...other
    } = this.props;
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
      return (
        <RootWikiMoreButton
          ButtonProps={{ style: finalStyle, color: "primary" }}
          rootWikiId={rootWikiId}
        />
      );
    } else {
      return (
        <Button
          {...other}
          fab
          style={finalStyle}
          component={Link}
          to={href}
          color="primary"
        >
          {iconType === "create" ? <CreateIcon /> : <AddIcon />}
        </Button>
      );
    }
  };

  render() {
    const { isOpen } = this.props;
    return (
      <Zoom appear={false} in={isOpen} unmountOnExit>
        {this.renderButton()}
      </Zoom>
    );
  }
}

export default ActionButton;
