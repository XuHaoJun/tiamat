import React from "react";
import PropTypes from "prop-types";

import classNames from "classnames";
import { withStyles } from "material-ui-next/styles";

import { drawerWidth, miniDrawerWidth } from "./AppNavDrawer";

const styles = theme => {
  const { breakpoints } = theme;
  return {
    mainBase: {
      minHeight: "100%",
      display: "block"
    },
    mainWithDrawerOpen: {
      [`${breakpoints.up("sm")}`]: {
        marginLeft: drawerWidth,
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      }
    },
    mainWithDrawerClose: {
      [`${breakpoints.up("sm")}`]: {
        marginLeft: miniDrawerWidth,
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        })
      }
    }
  };
};

const AppMain = ({ children, classes, drawerOpen, ...other }) => {
  const className = classNames(
    classes.mainBase,
    drawerOpen ? classes.mainWithDrawerOpen : classes.mainWithDrawerClose
  );
  return (
    <main className={className} {...other}>
      {children}
    </main>
  );
};

AppMain.propTypes = {
  drawerOpen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AppMain);
