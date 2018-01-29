import React from "react";
import { connect } from "react-redux";

import AppBar from "material-ui-next/AppBar";
import Tabs from "material-ui-next/Tabs";

const ReponsiveTabs = props => {
  const { browser, AppBarProps, ...other } = props;
  if (browser.lessThan.medium) {
    return (
      <AppBar position="static" elevation={0} {...AppBarProps}>
        <Tabs {...other} fullWidth={other.fullWidth || true} />
      </AppBar>
    );
  } else {
    return (
      <AppBar position="static" elevation={0} color="default" {...AppBarProps}>
        <Tabs
          {...other}
          indicatorColor={other.indicatorColor || "primary"}
          textColor={other.textColor || "primary"}
        />
      </AppBar>
    );
  }
};

function mapStateToProps(state) {
  const { browser } = state;
  return { browser };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ReponsiveTabs);
