import React from "react";
import { Link } from "react-router-dom";

import Menu, { MenuItem } from "material-ui-next/Menu";
import Button from "material-ui-next/Button";
import MoreVertIcon from "material-ui-icons-next/FormatListBulleted";

class RootWikiMoreButton extends React.Component {
  state = {
    anchorEl: null
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { rootWikiId, ButtonProps, MenuProps } = this.props;
    const { anchorEl } = this.state;
    return (
      <div>
        <Button
          fab
          aria-label="More"
          {...ButtonProps}
          aria-owns={anchorEl ? "long-menu" : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon />
        </Button>
        <Menu
          id="rootWikiMoreMenu"
          anchorEl={this.state.anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          {...MenuProps}
        >
          <MenuItem
            component={Link}
            to={`/rootWikis/${rootWikiId}/dashboard?slideIndex=edit`}
          >
            Edit
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/create/rootWikis/${rootWikiId}/wikiDataForm`}
          >
            Add WikiDataForm
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/create/rootWikis/${rootWikiId}/template`}
          >
            Add Template
          </MenuItem>
          <MenuItem component={Link} to={`/rootWikis/${rootWikiId}/dashboard`}>
            RootWiki Dashboard
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

export default RootWikiMoreButton;
