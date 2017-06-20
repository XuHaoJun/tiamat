import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class UserOauth2CallbackPage extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  componentDidMount() {
    const router = this.context.router;
    router.replace('/');
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div>Redirecting....</div>
    );
  }
}

function mapStateToProps(state, props) {
  return {state, props};
}

export default connect(mapStateToProps)(UserOauth2CallbackPage);
