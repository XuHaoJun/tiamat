import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";

import Reboot from "material-ui-next/Reboot";
import { MuiThemeProvider as MuiThemeProviderNext } from "material-ui-next/styles";
import createTheme from "./styles/createTheme";

import _debounce from "lodash/debounce";

import { getUserAgent } from "../UserAgent/UserAgentReducer";
import { getUI } from "./MyAppReducer";
import Header from "./components/Header";
import Main from "./components/Main";
import AppBottomNavigation from "./components/AppBottomNavigation";
import ErrorSnackbar from "../Error/components/ErrorSnackbar";

const meta = [
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
      "width=device-width, initial-scale=1, user-scalable=0, maximum-scale=1, minimum-scale=1, minimal-ui"
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
    content: "#3F51B5"
  }
];

class MyApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: !props.browser.lessThan.medium,
      appBarZDepth: 0,
      sheetsManager: new Map(),
      theme: createTheme()
    };
  }

  componentDidMount() {
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    const jssStyles = document.getElementById("jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  componentWillUnmount() {
    // document.body.style.backgroundColor = null;
    if (this._debouncedChildrenContainerScroll) {
      this._debouncedChildrenContainerScroll.cancel();
    }
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ theme: createTheme() });
  };

  handleOffline = () => {
    this.setState({ theme: createTheme({ networkStatus: "offline" }) });
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
    const headerTitle = this.props.ui.get("headerTitle");
    const { children } = this.props;
    const { drawerOpen, theme, sheetsManager } = this.state;
    return (
      <React.Fragment>
        <Helmet titleTemplate="%s - Tiamat 電玩論壇" meta={meta} />
        <MuiThemeProviderNext theme={theme} sheetsManager={sheetsManager}>
          <Reboot />
          <Header
            title={headerTitle}
            appBarZDepth={this.state.appBarZDepth}
            pathname={this.props.pathname}
            searchQuery={this.props.searchQuery}
            onChangeDrawerOpen={this.handleChangeDrawerOpen}
          />
          <Main
            drawerOpen={drawerOpen}
            onScroll={this.handleChildrenContainerScroll}
          >
            {children}
          </Main>
          <AppBottomNavigation />
          <ErrorSnackbar />
        </MuiThemeProviderNext>
      </React.Fragment>
    );
  }
}

MyApp.propTypes = {
  children: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired
};

export const MyAppWithoutConnect = MyApp;

// Retrieve data from store as props
function mapStateToProps(state, routerProps) {
  const { intl, browser } = state;
  const userAgent = getUserAgent(state);
  const { location } = routerProps;
  const ui = getUI(state);
  const { pathname } = location;
  const searchQuery = location.query.query;
  return { ui, intl, userAgent, browser, pathname, searchQuery };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(MyApp);
