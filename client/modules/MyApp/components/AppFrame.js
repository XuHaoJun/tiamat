import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";

import { MuiThemeProvider } from "material-ui-next/styles";

import AppReboot from "./AppReboot";
import AppHeader from "./AppHeader";
import AppMain from "./AppMain";
import AppNavDrawer from "./AppNavDrawer";
import AppBottomNavigation from "./AppBottomNavigation";
import ErrorSnackbar from "../../Error/components/ErrorSnackbar";

import { getTheme } from "../MyAppReducer";

class AppFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
      sheetsManager: new Map()
    };
  }

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

  render() {
    const { children, theme } = this.props;
    const { drawerOpen, sheetsManager } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:300,300i,400,400i,500,500i,700,700i"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
        </Helmet>
        <MuiThemeProvider theme={theme} sheetsManager={sheetsManager}>
          <AppReboot />
          <AppHeader onMenuButtonClick={this.handleMenuButtonClick} />
          <AppNavDrawer
            open={drawerOpen}
            onChangeDrawer={this.handleChangeDrawer}
          />
          <AppMain drawerOpen={drawerOpen}>{children}</AppMain>
          <AppBottomNavigation />
          <ErrorSnackbar />
        </MuiThemeProvider>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { browser } = state;
  const theme = getTheme(state);
  return { browser, theme };
}

export default connect(mapStateToProps)(AppFrame);
