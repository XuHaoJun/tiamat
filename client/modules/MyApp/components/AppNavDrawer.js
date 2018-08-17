import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import compose from "recompose/compose";
import { connect } from "react-redux";

import classNames from "classnames";
import {
  withStyles,
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Paper from "@material-ui/core/Paper";

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

const forceDarkTheme = outerTheme => {
  if (outerTheme.palette.type !== "dark") {
    const darkTheme = createMuiTheme({ palette: { type: "dark" } });
    return {
      ...outerTheme,
      palette: darkTheme.palette,
      typography: darkTheme.typography
    };
  } else {
    return outerTheme;
  }
};

const DarkThemeProvider = props => {
  return <MuiThemeProvider theme={forceDarkTheme} {...props} />;
};

class AppNavDrawer extends React.Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onChangeDrawer: PropTypes.func
  };

  shouldComponentUpdate(nextProps, nextState) {
    return shouldComponentUpdate.bind(this)(nextProps, nextState);
  }

  handleClose = (e, reason) => {
    if (this.props.onChangeDrawer) {
      const open = false;
      this.props.onChangeDrawer(e, reason, open);
    }
  };

  render() {
    const { open, onChangeDrawer, browser, classes } = this.props;
    const ThemeProvider = browser.greaterThan.small
      ? DarkThemeProvider
      : React.Fragment;
    return (
      <Drawer
        elevation={browser.greaterThan.small ? 0 : 16}
        open={open}
        onClose={this.handleClose}
        variant={browser.greaterThan.small ? "permanent" : "temporary"}
        classes={{
          paper: classNames(
            classes.drawerPaperBase,
            open ? classes.drawerPaperOpen : classes.drawerPaperClose
          )
        }}
        // swipeAreaWidth={30}
      >
        <div className={classes.drawerInner}>
          <ThemeProvider>
            <Paper style={{ width: "100%", height: "100%" }}>
              <NavList onChangeDrawer={onChangeDrawer} />
            </Paper>
          </ThemeProvider>
        </div>
      </Drawer>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(state => {
    const { browser } = state;
    return { browser };
  })
)(AppNavDrawer);
