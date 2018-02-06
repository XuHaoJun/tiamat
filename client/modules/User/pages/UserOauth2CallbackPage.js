import React from "react";
import { connect } from "react-redux";

import { replace } from "react-router-redux";

class UserOauth2CallbackPage extends React.Component {
  componentDidMount() {
    this.props.dispatch(replace("/"));
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
