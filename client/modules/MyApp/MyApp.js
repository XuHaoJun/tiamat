import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { memorizedGetMuiTheme } from "./styles/getMuiTheme";

import _debounce from "lodash/debounce";

import { getUserAgent } from "../UserAgent/UserAgentReducer";
import { getUI } from "./MyAppReducer";
import Header from "./components/Header";
import AppBottomNavigation from "./components/AppBottomNavigation";
import spacing from "material-ui/styles/spacing";
import ErrorSnackbar from "../Error/components/ErrorSnackbar";

export function getStyles(browser, drawerOpen) {
  const styles = {
    appBar: {
      position: "fixed"
    },
    root: {
      minHeight: "100%",
      height: "auto"
    },
    content: {
      margin: spacing.desktopGutter
    },
    contentWhenMedium: {
      margin: `${spacing.desktopGutter}px ${spacing.desktopGutter * 2}px`
    },
    disableRoot: {},
    disableContent: {}
  };
  if (!browser.lessThan.medium) {
    styles.root.paddingLeft = 256;
    if (typeof drawerOpen === "boolean" && !drawerOpen) {
      delete styles.root.paddingLeft;
    }
    styles.disableRoot.paddingLeft = -1 * styles.root.paddingLeft;
    styles.content = Object.assign(styles.content, styles.contentWhenMedium);
    const topdown = -spacing.desktopGutter;
    const leftright = -2 * spacing.desktopGutter;
    styles.disableContent = {
      margin: `${topdown}px ${leftright}px`
    };
  } else {
    styles.disableContent.margin = -1 * styles.content.margin;
    // styles.root.userSelect = 'none';
  }
  styles.disableRoot.paddingTop = -1 * styles.root.paddingTop;
  return styles;
}
// TODO
// implement pull to refresh feature
// https://github.com/bryaneaton13/react-pull-to-refresh
class MyApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: !props.browser.lessThan.medium,
      appBarZDepth: 0,
      isOffline: false
    };
  }

  componentDidMount() {
    if (typeof window === "object" && typeof document === "object") {
      const backgroundColor = this.props.ui.getIn([
        "styles",
        "body",
        "backgroundColor"
      ]);
      document.body.style.backgroundColor = backgroundColor;
    }
    if (typeof window === "object") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  componentWillUnmount() {
    if (typeof window === "object" && typeof document === "object") {
      document.body.style.backgroundColor = null;
    }
    if (this._debouncedChildrenContainerScroll) {
      this._debouncedChildrenContainerScroll.cancel();
    }
    if (typeof window === "object") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
  }

  getHeadMeta = () => {
    return [
      {
        charset: "utf-8"
      },
      {
        "http-equiv": "X-UA-Compatible",
        content: "IE=edge"
      },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, user-scalable=0, maximum-scale=1, minimum-scale=1"
      },
      {
        name: "mobile-web-app-capable",
        content: "yes"
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes"
      },
      {
        name: "format-detection",
        content: "telphone=no, email=no"
      },
      {
        name: "theme-color",
        content: "#0097a7"
      }
    ];
  };

  getMuiTheme = () => {
    const { userAgent, browser } = this.props;
    const { isOffline } = this.state;
    const isMobileSize = browser.lessThan.medium;
    return memorizedGetMuiTheme(userAgent, { isMobileSize, isOffline });
  };

  handleOnline = () => {
    if (this.state.isOffline) {
      this.setState({ isOffline: false });
    }
  };

  handleOffline = () => {
    if (!this.state.isOffline) {
      this.setState({ isOffline: true });
    }
  };

  handleChangeDrawerOpen = drawerOpen => {
    this.setState({ drawerOpen });
  };

  _handleChildrenContainerScroll = event => {
    if (!this.props.browser.lessThan.medium) {
      if (event.target.scrollTop === 0) {
        if (this.state.appBarZDepth > 0) {
          this.setState({ appBarZDepth: 0 });
        }
      } else {
        if (this.state.appBarZDepth < 1) {
          this.setState({ appBarZDepth: 1 });
        }
      }
    }
  };

  handleChildrenContainerScroll = _event => {
    _event.persist();
    // init debounce
    if (!this._debouncedChildrenContainerScroll) {
      this._debouncedChildrenContainerScroll = _debounce(
        this._handleChildrenContainerScroll,
        250
      );
    }
    this._debouncedChildrenContainerScroll(_event);
  };

  render() {
    const styles = getStyles(this.props.browser, this.state.drawerOpen);
    const muiTheme = this.getMuiTheme();
    const meta = this.getHeadMeta();
    const headerTitle = this.props.ui.get("headerTitle");
    return (
      <div>
        <Helmet titleTemplate="%s - Tiamat 電玩論壇" meta={meta} />
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <AppBottomNavigation />
            <Header
              title={headerTitle}
              appBarStyle={styles.appBar}
              appBarZDepth={this.state.appBarZDepth}
              pathname={this.props.location.pathname}
              searchQuery={this.props.location.query.query}
              onChangeDrawerOpen={this.handleChangeDrawerOpen}
            />
            <div
              style={{
                backgroundColor: "red",
                height: muiTheme.appBar.height,
                width: "100vw"
              }}
            >
              never see me if Header is fixed
            </div>
            <div
              style={styles.root}
              onScroll={this.handleChildrenContainerScroll}
            >
              {this.props.children}
            </div>
            <ErrorSnackbar />
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

MyApp.propTypes = {
  children: PropTypes.object.isRequired
  // intl: PropTypes.object.isRequired
};

export const MyAppWithoutConnect = MyApp;

// Retrieve data from store as props
function mapStateToProps(store, routerProps) {
  const { intl, browser } = store;
  const userAgent = getUserAgent(store);
  const { location } = routerProps;
  const ui = getUI(store);
  return { ui, intl, userAgent, browser, location };
}

export default connect(mapStateToProps)(MyApp);
