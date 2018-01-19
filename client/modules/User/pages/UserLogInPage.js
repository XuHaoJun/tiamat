import React, { Component } from "react";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import Paper from "material-ui/Paper";

import LogInForm from "../components/LogInForm";
import { getIsLoggedIn } from "../UserReducer";

const styles = {
  paper: {
    textAlign: "center",
    verticalAlign: "middle",
    width: 500,
    margin: "auto"
  },
  loginForm: {
    padding: 15
  },
  loginFormWithMedium: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

class UserLoginPage extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  static getInitialAction() {
    return setHeaderTitle("登入");
  }

  componentDidMount() {
    this.goBackIfLoggedIn();
    this.props.dispatch(UserLoginPage.getInitialAction());
  }

  componentWillReceiveProps() {
    this.props.dispatch(UserLoginPage.getInitialAction());
  }

  componentDidUpdate() {
    this.goBackIfLoggedIn();
  }

  goBackIfLoggedIn = () => {
    const { isLoggedIn } = this.props;
    const { router } = this.context;
    if (isLoggedIn) {
      router.replace("/");
    }
  };

  renderDesktop = () => {
    return (
      <Paper style={styles.paper}>
        <LogInForm style={styles.loginForm} />
      </Paper>
    );
  };

  renderMobile = () => {
    return <LogInForm style={styles.loginFormWithMedium} />;
  };

  render() {
    const content = this.props.browser.lessThan.medium
      ? this.renderMobile()
      : this.renderDesktop();
    return (
      <div>
        <Helmet title="登入" />
        {content}
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const { browser } = state;
  const { location } = routerProps;
  const isLoggedIn = getIsLoggedIn(state);
  return { isLoggedIn, browser, location };
}

export default connect(mapStateToProps)(UserLoginPage);
