import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import _cloneDeep from "lodash/cloneDeep";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {
  cyan500,
  cyan700,
  grey100,
  grey300,
  grey400,
  grey500,
  white,
  darkBlack,
  fullBlack
} from "material-ui/styles/colors";
import { fade } from "material-ui/utils/colorManipulator";
import getMuiTheme from "material-ui/styles/getMuiTheme";

import { getUserAgent } from "../UserAgent/UserAgentReducer";
import { getUI } from "./MyAppReducer";
import Header from "./components/Header";
import spacing from "material-ui/styles/spacing";
import ErrorSnackbar from "../Error/components/ErrorSnackbar";

const defaultMuiTheme = getMuiTheme();

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

class MyApp extends React.Component {
  state = {};

  componentDidMount() {
    if (typeof window === "object" && typeof document === "object") {
      const backgroundColor = this.props.ui.getIn([
        "styles",
        "body",
        "backgroundColor"
      ]);
      document.body.style.backgroundColor = backgroundColor;
    }
  }

  componentWillUnmount() {
    if (typeof window === "object" && typeof document === "object") {
      document.body.style.backgroundColor = null;
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

  _getMuiTheme = () => {
    const fontFamily =
      '"Noto Sans TC", "Helvetica Neue", "Calibri Light", Roboto, sans-serif, sans-serif';
    const { userAgent, browser } = this.props;
    if (browser.lessThan.medium) {
      if (this._muiThemeWithMedium) {
        return this._muiThemeWithMedium;
      }
      this._muiThemeWithMedium = getMuiTheme(_cloneDeep(defaultMuiTheme), {
        fontFamily,
        userAgent
      });
      return this._muiThemeWithMedium;
    } else {
      if (this._muiTheme) {
        return this._muiTheme;
      }
      this._muiTheme = getMuiTheme(_cloneDeep(defaultMuiTheme), {
        fontFamily,
        userAgent,
        appBar: {
          color: white,
          textColor: darkBlack
        },
        drawer: {
          color: "#FAFAFA"
        },
        tabs: {
          backgroundColor: white,
          textColor: fade(darkBlack, 0.45),
          selectedTextColor: darkBlack
        },
        inkBar: {
          backgroundColor: "#6E6E6E"
        },
        palette: {
          primary1Color: cyan500,
          primary2Color: cyan700,
          primary3Color: grey400,
          accent2Color: grey100,
          accent3Color: grey500,
          textColor: darkBlack,
          alternateTextColor: white,
          canvasColor: white,
          borderColor: grey300,
          disabledColor: fade(darkBlack, 0.3),
          pickerHeaderColor: cyan500,
          clockCircleColor: fade(darkBlack, 0.07),
          shadowColor: fullBlack
        },
        zIndex: {
          menu: 1000,
          drawerOverlay: 1200,
          drawer: 1300,
          appBar: 1301,
          dialogOverlay: 1400,
          dialog: 1500,
          layer: 2000,
          popover: 2100,
          snackbar: 2900,
          tooltip: 3000
        }
      });
      return this._muiTheme;
    }
  };

  handleChangeDrawerOpen = drawerOpen => {
    this.setState({ drawerOpen });
  };

  render() {
    const styles = getStyles(this.props.browser, this.state.drawerOpen);
    const muiTheme = this._getMuiTheme();
    const meta = this.getHeadMeta();
    const headerTitle = this.props.ui.get("headerTitle");
    return (
      <div>
        <Helmet titleTemplate="%s - Tiamat 電玩論壇" meta={meta} />
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <Header
              title={headerTitle}
              appBarStyle={styles.appBar}
              location={this.props.location}
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
            <div style={styles.root}>{this.props.children}</div>
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
