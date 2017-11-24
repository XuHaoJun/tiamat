import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

class UserOauth2CallbackPage extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  componentDidMount() {
    const { router } = this.context;
    // TODO
    // redirect to user profile page?
    router.replace("/");
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return <div>Redirecting....</div>;
  }
}

function mapStateToProps(state, routerProps) {
  return { state, routerProps };
}

export default connect(mapStateToProps)(UserOauth2CallbackPage);
