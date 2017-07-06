import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import Paper from "material-ui/Paper";

import LoginForm from "./LoginForm";
import { getCurrentUser } from "../../UserReducer";

const styles = {
  paper: {
    textAlign: "center",
    verticalAlign: "middle",
    width: 500,
    margin: "auto"
  },
  loginForm: {
    padding: 15
  }
};

class UserLoginPage extends Component {
  static propTypes = {
    currentUser: PropTypes.object
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  componentDidMount() {
    if (this.props.currentUser) {
      setTimeout(this.context.router.replace.bind(this, "/"), 0);
    }
  }

  renderDesktop = () => {
    return (
      <Paper style={styles.paper}>
        <div style={styles.loginForm}>
          <LoginForm />
        </div>
      </Paper>
    );
  };

  renderMobile = () => {
    return (
      <div style={styles.loginForm}>
        <LoginForm />
      </div>
    );
  };

  render() {
    const content = this.props.browser.lessThan.medium
      ? this.renderMobile()
      : this.renderDesktop();
    return (
      <div>
        <Helmet title="登入" />
        <div>
          {content}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const currentUser = getCurrentUser(state);
  const browser = state.browser;
  const location =
    state.routing.locationBeforeTransitions || routerProps.location;
  return { currentUser, browser, location };
}

export default connect(mapStateToProps)(UserLoginPage);
