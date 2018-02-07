import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { compose } from "recompose";
import { hot } from "react-hot-loader";

import Paper from "material-ui-next/Paper";

import SignUpForm from "../components/SignUpForm";

import { replace } from "react-router-redux";
import { setHeaderTitle } from "../../MyApp/MyAppActions";

import { getIsLoggedIn } from "../UserReducer";

const styles = {
  paper: {
    textAlign: "center",
    verticalAlign: "middle",
    width: 500,
    margin: "auto"
  },
  form: {
    padding: 15
  },
  signUpFormWithMedium: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

class UserSignUpPage extends Component {
  static propTypes = {
    isLoggedIn: PropTypes.bool.isRequired
  };

  static getInitialAction() {
    return setHeaderTitle("註冊");
  }

  componentWillMount() {
    this.props.dispatch(setHeaderTitle("註冊"));
  }

  componentDidMount() {
    this.goBackIfLoggedIn();
  }

  componentDidUpdate() {
    this.goBackIfLoggedIn();
  }

  goBackIfLoggedIn = () => {
    const { isLoggedIn } = this.props;
    if (isLoggedIn) {
      const from = this.props.location.query.from || "/";
      this.props.dispatch(replace(from));
    }
  };

  renderDesktop = () => {
    return (
      <Paper style={styles.paper}>
        <SignUpForm style={styles.form} />
      </Paper>
    );
  };

  renderMobile = () => {
    return <SignUpForm style={styles.signUpFormWithMedium} />;
  };

  render() {
    const meta = [
      {
        name: "description",
        content: "註冊"
      }
    ];
    const content = this.props.browser.lessThan.medium
      ? this.renderMobile()
      : this.renderDesktop();
    return (
      <React.Fragment>
        <Helmet title="註冊" meta={meta} />
        <React.Fragment>{content}</React.Fragment>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { browser } = state;
  return {
    browser,
    isLoggedIn: getIsLoggedIn(state)
  };
}

export default compose(hot(module), connect(mapStateToProps))(UserSignUpPage);
