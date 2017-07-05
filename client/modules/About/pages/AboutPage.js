import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import FacebookProvider, { Comments } from "react-facebook";
import { getOauth2Client } from "../../Oauth2Client/Oauth2ClientReducer";
import { setHeaderTitle } from "../../MyApp/MyAppActions";

export class AboutPage extends React.PureComponent {
  static defaultProps = {
    title: "說明",
    facebookOauth2Client: null
  };

  componentWillMount() {
    this.props.dispatch(setHeaderTitle(this.props.title));
  }

  render() {
    const { title, facebookOauth2Client } = this.props;
    const facebookClientID = facebookOauth2Client
      ? facebookOauth2Client.clientID
      : "";
    return (
      <div>
        <Helmet title={title} />
        <div>
          {facebookClientID
            ? <FacebookProvider appId={facebookClientID}>
                <Comments width="100%" />
              </FacebookProvider>
            : null}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const facebookOauth2Client = getOauth2Client(state, "facebook");
  return { facebookOauth2Client };
}

export default connect(mapStateToProps)(AboutPage);
