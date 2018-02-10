import React from "react";
import { withStyles } from "material-ui-next/styles";
import MuiReboot from "material-ui-next/Reboot";

const styles = {
  "@global": {
    html: {
      minHeight: "100%"
    },
    body: {
      // disable chrome pull refresh, for custom pull refresh.
      overscrollBehaviorY: "contain",
      overflowY: "auto",

      minHeight: "100%",
      margin: 0,
      padding: 0,
      boxSizing: "border-box"
    }
  }
};

class AppReboot extends React.Component {
  render() {
    return <MuiReboot />;
  }
}

export default withStyles(styles)(AppReboot);
