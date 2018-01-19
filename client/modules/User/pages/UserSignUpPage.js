import React, { Component } from "react";
import { setHeaderTitle, setHeaderTitleThunk } from "../../MyApp/MyAppActions";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Paper from "material-ui/Paper";
import Helmet from "react-helmet";
import SignUpForm from "../components/SignUpForm";
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
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

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
    const { router } = this.context;
    if (isLoggedIn) {
      router.replace("/");
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
      <div>
        <Helmet title="註冊" meta={meta} /> {content}
      </div>
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

export default connect(mapStateToProps)(UserSignUpPage);
