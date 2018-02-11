import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { compose } from "recompose";
import { hot } from "react-hot-loader";
import { renderRoutes } from "react-router-config";

import AppFrame from "./components/AppFrame";

import { setNetworkStatus } from "./MyAppActions";

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

class MyApp extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired
  };

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
    this.props.dispatch(setNetworkStatus("online"));
  };

  handleOffline = () => {
    this.props.dispatch(setNetworkStatus("offline"));
  };

  render() {
    const { route } = this.props;
    const helmetTitleTemplate = "%s - Tiamat 電玩論壇";
    return (
      <React.Fragment>
        <Helmet titleTemplate={helmetTitleTemplate} meta={defaultMetas} />
        <AppFrame>{renderRoutes(route.routes)}</AppFrame>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { intl } = state;
  return { intl };
}

export default compose(hot(module), connect(mapStateToProps))(MyApp);
