import React from "react";
import PropTypes from "prop-types";

import IconMenu from "material-ui/IconMenu";
import MaterialMenuItem from "material-ui/MenuItem";
import FloatingActionButton from "material-ui/FloatingActionButton";
import MoreVertIcon from "material-ui/svg-icons/editor/format-list-bulleted";

function makeLinkable(WrappedComponent) {
  class LinkableComponent extends React.Component {
    render() {
      const { to, children, onClick, ...other } = this.props;
      const handleClick = (e, ...args) => {
        if (to) {
          this.context.router.push(to);
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
    }
  }
  LinkableComponent.contextTypes = {
    router: PropTypes.object
  };
  return LinkableComponent;
}

const MenuItem = makeLinkable(MaterialMenuItem);
MenuItem.muiName = MaterialMenuItem.muiName;

class RootWikiMoreButton extends React.Component {
  render() {
    const { rootWikiId, style } = this.props;
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
        <MenuItem
          primaryText="Edit"
          to={`/rootWikis/${rootWikiId}/dashboard?slideIndex=edit`}
        />
        <MenuItem
          primaryText="Add WikiDataForm"
          to={`/create/rootWikis/${rootWikiId}/wikiDataForm`}
        />
        <MenuItem
          primaryText="RootWiki Dashboard"
          to={`/rootWikis/${rootWikiId}/dashboard`}
        />
      </IconMenu>
    );
  }
}

export default RootWikiMoreButton;
