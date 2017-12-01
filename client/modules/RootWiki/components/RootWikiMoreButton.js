import React from "react";

import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import FloatingActionButton from "material-ui/FloatingActionButton";
import MoreVertIcon from "material-ui/svg-icons/editor/format-list-bulleted";

class RootWikiMoreButton extends React.Component {
  render() {
    const { style } = this.props;
    return (
      <IconMenu
        iconButtonElement={
          <FloatingActionButton style={style}>
            <MoreVertIcon />
          </FloatingActionButton>
        }
        anchorOrigin={{ horizontal: "left", vertical: "top" }}
        targetOrigin={{ horizontal: "left", vertical: "top" }}
      >
        <MenuItem primaryText="Refresh" />
        <MenuItem primaryText="Send feedback" />
        <MenuItem primaryText="Settings" />
        <MenuItem primaryText="Help" />
        <MenuItem primaryText="Sign out" />
      </IconMenu>
    );
  }
}

export default RootWikiMoreButton;
