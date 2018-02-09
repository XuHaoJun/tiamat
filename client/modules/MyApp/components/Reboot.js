import React from "react";
import { withStyles } from "material-ui-next/styles";
import MuiReboot from "material-ui-next/Reboot";

const styles = {
  "@global": {
    html: {
      minHeight: "100%"
    },
    body: {
      minHeight: "100%",
      overscrollBehaviorY: "contain",
      overflowY: "auto",
      margin: 0,
      padding: 0,
      boxSizing: "border-box"
    }
  }
};

class Reboot extends React.Component {
  render() {
    return <MuiReboot />;
  }
}

export default withStyles(styles)(Reboot);
