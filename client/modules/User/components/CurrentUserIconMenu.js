import React from "react";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Link } from "react-router";

import IconButton from "material-ui-next/IconButton";
import Menu, { MenuItem } from "material-ui-next/Menu";
import { ListItemIcon, ListItemText } from "material-ui-next/List";

import SettingsIcon from "material-ui-icons-next/Settings";
import LogOutIcon from "material-ui-icons-next/Input";

import UserAvatar from "./UserAvatar";
import { getCurrentUser } from "../UserReducer";

class CurrentUserIconMenu extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate;
    this.state = {
      anchorEl: null
    };
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleLogOut = () => {
    // TODO
    // dispatch logout action.
    this.handleClose();
  };

  render() {
    const { user, ...other } = this.props;
    const { anchorEl } = this.state;
    return (
      <div>
        <IconButton
          {...other}
          aria-label="CurrentUser More"
          aria-owns={anchorEl ? "current-user-menu" : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <UserAvatar size={34} user={user} />
        </IconButton>
        <Menu
          id="current-user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem component={Link} to="/settings" onClick={this.handleClose}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="設定" />
          </MenuItem>
          <MenuItem onClick={this.handleLogOut}>
            <ListItemIcon>
              <LogOutIcon />
            </ListItemIcon>
            <ListItemText primary="登出(尚未完成)" />
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default connect(
  state => {
    const user = getCurrentUser(state);
    return { user };
  },
  () => {
    return {};
  }
)(CurrentUserIconMenu);
