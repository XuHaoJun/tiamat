import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import FacebookProvider, { Comments } from "react-facebook";

import { getOauth2Client } from "../../Oauth2Client/Oauth2ClientReducer";
import { setHeaderTitle, setHeaderTitleThunk } from "../../MyApp/MyAppActions";

class AboutPage extends React.Component {
  static defaultProps = {
    title: "說明",
    facebookOauth2Client: null
  };

  static getInitialAction() {
    return setHeaderTitle(AboutPage.defaultProps.title);
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    this.fetchComponentData(nextProps);
  }

  fetchComponentData = (props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData();
    } else {
      return null;
    }
  };

  render() {
    const { title, facebookOauth2Client } = this.props;
    const facebookClientID = facebookOauth2Client
      ? facebookOauth2Client.clientID
      : "";
    return (
      <div>
        <Helmet title={title} />
        <div>
          {facebookClientID ? (
            <FacebookProvider appId={facebookClientID}>
              <Comments width="100%" />
            </FacebookProvider>
          ) : null}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const facebookOauth2Client = getOauth2Client(state, "facebook");
  return { facebookOauth2Client };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchComponentData() {
      const action = AboutPage.getInitialAction();
      return dispatch(action);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AboutPage);
