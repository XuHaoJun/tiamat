import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import WikiForm from "../components/WikiForm";

import { goBack } from "react-router-redux";
import {
  setHeaderTitle,
  updateSendButtonProps
} from "../../MyApp/MyAppActions";
import { addWikiRequest } from "../WikiActions";

class CreateWikiPage extends React.Component {
  static defaultProps = {
    title: "建立維基"
  };

  componentWillMount() {
    const { title } = this.props;
    this.props.dispatch(setHeaderTitle(title));
  }

  setFormRef = formComponent => {
    if (formComponent) {
      this.formComponent = formComponent;
      const onClick = this.sendForm;
      this.props.dispatch(updateSendButtonProps({ onClick }));
    } else {
      this.props.dispatch(
        updateSendButtonProps({
          onClick: () => { }
        })
      );
    }
  };

  sendForm = () => {
    if (this.formComponent) {
      const form = this.formComponent.getForm();
      this.props.dispatch(dispatch => {
        return Promise.resolve(
          dispatch(updateSendButtonProps({ loading: true }))
        )
          .then(() => dispatch(addWikiRequest(form)))
          .then(() => dispatch(updateSendButtonProps({ loading: false })))
          .then(() => dispatch(goBack()))
          .catch(() => dispatch(updateSendButtonProps({ loading: false })));
      });
    }
  };

  render() {
    const { title } = this.props;
    const metaDescription = title;
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <div style={{ marginTop: 50 }}>
          <WikiForm ref={this.setFormRef} rootWikiId={this.props.rootWikiId} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const { rootWikiId } = routerProps.match.params;
  return { browser: state.browser, rootWikiId };
}

export default connect(mapStateToProps)(CreateWikiPage);
