import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MuiCssBaseline from "@material-ui/core/CssBaseline";

const styles = {
  "@global": {
    html: {
      minHeight: "100%"
    },
    body: {
      // disable chrome pull refresh, for custom pull refresh.
      overscrollBehaviorY: "contain",
      overflowY: "auto",
      // reset
      minHeight: "100%",
      margin: 0,
      padding: 0,
      boxSizing: "border-box"
    }
  }
};

class AppCssBaseline extends React.Component {
  render() {
    return <MuiCssBaseline />;
  }
}

export default withStyles(styles)(AppCssBaseline);
