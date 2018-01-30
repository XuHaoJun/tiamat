import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import classNames from "classnames";
import { withStyles } from "material-ui-next/styles";
import Drawer from "material-ui-next/Drawer";

import NavList from "./NavList";

export const drawerWidth = 256;

export const miniDrawerWidth = 56;

const styles = theme => {
  const { breakpoints } = theme;
  return {
    drawerInner: {
      height: "100%",
      width: drawerWidth,
      maxWidth: drawerWidth,
      overflowX: "hidden"
    },
    drawerPaperBase: {
      backgroundColor: theme.palette.background.default,
      userSelect: "none",
      maxWidth: drawerWidth,
      overflowX: "hidden",
      [`${breakpoints.up("sm")}`]: {
        height: "calc(100vh - 64px)",
        top: 64
      }
    },
    drawerPaperClose: {
      [`${breakpoints.up("sm")}`]: {
        width: miniDrawerWidth,
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      }
    },
    drawerPaperOpen: {
      [`${breakpoints.up("sm")}`]: {
        width: drawerWidth,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen
        })
      }
    }
  };
};

class AppNavDrawer extends React.Component {
  static propTypes = {
    onRequestChangeNavDrawer: PropTypes.func,
    open: PropTypes.bool.isRequired,
    selectedIndex: PropTypes.string.isRequired
  };

  static defaultProps = {
    onRequestChangeNavDrawer: () => {}
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  shouldComponentUpdate(nextProps, nextState) {
    // skip update if not open
    if (this.props.open === false && nextProps.open === false) {
      return false;
    }
    return shouldComponentUpdate.bind(this)(nextProps, nextState);
  }

  handleClose = () => {
    if (this.props.onRequestChangeNavDrawer) {
      this.props.onRequestChangeNavDrawer(false);
    }
  };

  render() {
    const {
      open,
      onRequestChangeNavDrawer,
      selectedIndex,
      classes
    } = this.props;
    return (
      <Drawer
        elevation={this.props.browser.lessThan.medium ? 16 : 0}
        open={open}
        onClose={this.handleClose}
        type={this.props.browser.lessThan.medium ? "temporary" : "permanent"}
        classes={{
          paper: classNames(
            classes.drawerPaperBase,
            open ? classes.drawerPaperOpen : classes.drawerPaperClose
          )
        }}
        // swipeAreaWidth={30}
      >
        <div className={classes.drawerInner}>
          <NavList
            selectedIndex={selectedIndex}
            requestChangeNavDrawer={onRequestChangeNavDrawer}
          />
        </div>
      </Drawer>
    );
  }
}

export default withStyles(styles)(AppNavDrawer);
