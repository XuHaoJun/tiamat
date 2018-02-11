import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { renderRoutes } from "react-router-config";
import { compose } from "recompose";
import { hot } from "react-hot-loader";

import { MuiThemeProvider } from "material-ui-next/styles";
import createTheme from "./styles/createTheme";

import AppReboot from "./components/AppReboot";
import AppHeader from "./components/AppHeader";
import AppMain from "./components/AppMain";
import AppNavDrawer from "./components/AppNavDrawer";
import AppBottomNavigation from "./components/AppBottomNavigation";
import ErrorSnackbar from "../Error/components/ErrorSnackbar";

import { getUI } from "./MyAppReducer";

const defaultMetas = [
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
  }
];

function getNetworkStatus() {
  if (process.env.browser) {
    return window.navigator.onLine ? "online" : "offline";
  } else {
    return "online";
  }
}

class MyApp extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      theme: this.createTheme(props),
      drawerOpen: false,
      sheetsManager: new Map()
    };
  }

  componentDidMount() {
    const jssStyles = document.getElementById("jss-server-side");
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  handleOnline = () => {
    this.setState({ theme: this.createTheme() });
  };

  handleOffline = () => {
    this.setState({ theme: this.createTheme() });
  };

  handleChangeDrawerOpen = nextDrawerOpen => {
    this.setState({ drawerOpen: nextDrawerOpen });
  };

  handleMenuButtonClick = () => {
    this.setState({ drawerOpen: !this.state.drawerOpen });
  };

  handleChangeDrawer = (e, reason, drawerOpen) => {
    if (reason === "backdropClick") {
      this.setState({ drawerOpen });
    } else if (reason === "navListItemClick") {
      if (this.props.browser.lessThan.medium) {
        this.setState({ drawerOpen });
      }
    }
  };

  createTheme = (props = this.props) => {
    const { ui } = props;
    const pageThemeOptions = ui.get("pageThemeOptions");
    const networkStatus = getNetworkStatus();
    return createTheme({ networkStatus, pageThemeOptions });
  };

  render() {
    const { ui, route } = this.props;
    const { drawerOpen, theme, sheetsManager } = this.state;
    const headerTitle = ui.getIn(["header", "title"]);
    return (
      <React.Fragment>
        <Helmet titleTemplate="%s - Tiamat 電玩論壇" meta={defaultMetas} />
        <Helmet>
          <meta name="theme-color" content={theme.palette.primary.main} />
        </Helmet>
        <MuiThemeProvider theme={theme} sheetsManager={sheetsManager}>
          <AppReboot />
          <AppHeader
            title={headerTitle}
            onMenuButtonClick={this.handleMenuButtonClick}
          />
          <AppNavDrawer
            open={drawerOpen}
            onChangeDrawer={this.handleChangeDrawer}
          />
          <AppMain drawerOpen={drawerOpen}>
            {renderRoutes(route.routes)}
          </AppMain>
          <AppBottomNavigation />
          <ErrorSnackbar />
        </MuiThemeProvider>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { intl, browser } = state;
  const ui = getUI(state);
  return { ui, intl, browser };
}

function mapDispatchToProps() {
  return {};
}

export default compose(
  hot(module),
  connect(mapStateToProps, mapDispatchToProps)
)(MyApp);
