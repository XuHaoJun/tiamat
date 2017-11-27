import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import IconMenu from "material-ui/IconMenu";
import MaterialMenuItem from "material-ui/MenuItem";
import SettingIcon from "material-ui/svg-icons/action/settings";
import LogOutIcon from "material-ui/svg-icons/action/input";

import UserAvatar from "./UserAvatar";
import { getCurrentUser } from "../UserReducer";

function makeLinkable(WrappedComponent) {
  const LinkableComponent = (props, context) => {
    const { to, children, onClick, ...other } = props;
    const handleClick = (e, ...args) => {
      if (to) {
        context.router.push(to);
      }
      if (onClick) {
        onClick(e, ...args);
      }
    };
    return (
      <WrappedComponent {...other} onClick={handleClick}>
        {children}
      </WrappedComponent>
    );
  };
  LinkableComponent.contextTypes = {
    router: PropTypes.object
  };
  return LinkableComponent;
}

const MenuItem = makeLinkable(MaterialMenuItem);
MenuItem.muiName = MaterialMenuItem.muiName;

const CurrentUserIconMenu = ({ user, iconButtonElement }) => {
  let _iconButtonElement;
  if (iconButtonElement) {
    _iconButtonElement = iconButtonElement;
  } else {
    _iconButtonElement = <UserAvatar user={user} />;
  }
  return (
    <IconMenu
      iconButtonElement={_iconButtonElement}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      targetOrigin={{ horizontal: "left", vertical: "bottom" }}
    >
      <MenuItem primaryText="設定" leftIcon={<SettingIcon />} to="/settings" />
      <MenuItem primaryText="登出(尚未完成)" leftIcon={<LogOutIcon />} />
    </IconMenu>
  );
};

CurrentUserIconMenu.muiName = IconMenu.muiName;

export default connect(state => {
  const user = getCurrentUser(state);
  return { user };
})(CurrentUserIconMenu);
