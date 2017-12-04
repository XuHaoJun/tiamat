import React from "react";
import PropTypes from "prop-types";
import Drawer from "material-ui/Drawer";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import NavList from "./NavList";

export default class MyAppNavDrawer extends React.Component {
  static propTypes = {
    docked: PropTypes.bool.isRequired,
    onRequestChangeNavDrawer: PropTypes.func,
    open: PropTypes.bool.isRequired,
    onChangeList: PropTypes.func,
    selectedIndex: PropTypes.string.isRequired,
    style: PropTypes.object
  };

  static defaultProps = {
    onRequestChangeNavDrawer: () => {},
    onChangeList: () => {},
    style: {}
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  componentDidMount() {
    if (this.drawer) {
      this.drawer._oldOnBodyTouchStart = this.drawer.onBodyTouchStart;
      // this.drawer.onBodyTouchStart = (e) => {
      //   this.drawer._oldOnBodyTouchStart.bind(this.drawer)(e);
      //   console.log('drawer event', e);
      // }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // skip update if not open
    if (this.props.open === false && nextProps.open === false) {
      return false;
    }
    return shouldComponentUpdate.bind(this)(nextProps, nextState);
  }

  setRefDrawer = elem => {
    this.drawer = elem;
  };

  render() {
    const {
      open,
      docked,
      onRequestChangeNavDrawer,
      style,
      selectedIndex,
      onChangeList
    } = this.props;
    return (
      <Drawer
        ref={this.setRefDrawer}
        style={Object.assign({}, style, {
          MozUserSelect: "none",
          WebkitUserSelect: "none",
          userSelect: "none"
        })}
        containerStyle={
          this.props.browser.lessThan.medium
            ? {}
            : {
                top: 64,
                height: "calc(100vh - 64px)"
              }
        }
        zDepth={this.props.browser.lessThan.medium ? 1 : 0}
        swipeAreaWidth={30}
        open={open}
        docked={docked}
        onRequestChange={onRequestChangeNavDrawer}
      >
        <NavList
          onChangeList={onChangeList}
          selectedIndex={selectedIndex}
          requestChangeNavDrawer={onRequestChangeNavDrawer}
        />
      </Drawer>
    );
  }
}
