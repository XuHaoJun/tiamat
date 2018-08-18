import * as React from 'react';

import MuiMenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu/Menu';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';

class NestingMenu extends React.Component {
  setAnchorRef = el => {
    if (el) {
      this.anchor = el;
    }
  };

  render() {
    const { open, menuItems } = this.props;
    return (
      <React.Fragment>
        <ArrowDropDown
          style={{
            float: 'right',
            transform: 'rotate(-90deg)',
            marginLeft: 'auto',
          }}
        />
        <div ref={this.setAnchorRef} style={{ position: 'absolute', right: 0 }} />
        {open ? (
          <Menu open={open} anchorEl={this.anchor} onClose={this.props.onClose}>
            {/* {React.Children.map(menuItems, menuItem => {
              return React.isValidElement(menuItem)
                ? React.cloneElement(menuItem, {
                    ...menuItem.props,
                    onClick: this.handleMenuItemClick
                  })
                : menuItem;
            })} */}
            {menuItems}
          </Menu>
        ) : null}
      </React.Fragment>
    );
  }
}

export default class NestingMenuItem extends React.Component {
  state = {
    open: false,
  };

  handleClick = event => {
    if (this.props.menuItems) {
      this.setState({
        open: true,
      });
    } else {
      this.setState({
        open: false,
      });
    }
  };

  handleClose = event => {
    event.stopPropagation();
    this.setState({ open: false });
  };

  render() {
    const { children, menuItems, ...other } = this.props;
    const { open } = this.state;
    return (
      <MuiMenuItem
        {...other}
        ref={ele => {
          this.menuItem = ele;
        }}
        onClick={this.handleClick}
      >
        {children}
        {menuItems ? (
          <NestingMenu
            menuItems={menuItems}
            onClose={this.handleClose}
            open={open}
            value={this.props.value}
          />
        ) : null}
      </MuiMenuItem>
    );
  }
}
