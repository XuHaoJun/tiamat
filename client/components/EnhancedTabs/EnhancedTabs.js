import React, { Children, isValidElement, cloneElement } from "react";
import { Tabs } from "material-ui/Tabs";

class EnhancedTabs extends React.Component {
  componentWillUnmount() {}

  getTabs(props = this.props) {
    const tabs = [];
    Children.forEach(props.children, tab => {
      if (isValidElement(tab)) {
        console.log("tab", tab);
        tabs.push(cloneElement(tab));
      }
    });
    return tabs;
  }

  handleTabMouseOver = (...args) => {
    if (this.tabs) {
      this.tabs.handleTabTouchTap(...args);
    }
  };

  render() {
    const { children, ...other } = this.props;
    const tabs = this.getTabs();
    return (
      <Tabs
        ref={ele => {
          this.tabs = ele;
        }}
        {...other}
      >
        {tabs}
      </Tabs>
    );
  }
}

EnhancedTabs.muiName = Tabs.muiName;

export default EnhancedTabs;
