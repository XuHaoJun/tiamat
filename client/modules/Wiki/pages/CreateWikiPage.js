import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import getDefaultContainerStyles from "../../MyApp/styles/defaultContainerStyles";
import WikiForm from "../components/WikiForm";
import {
  setHeaderTitle,
  updateSendButtonProps
} from "../../MyApp/MyAppActions";
import { addWikiRequest } from "../WikiActions";

export function getStyles(browser) {
  const containerStyle = getDefaultContainerStyles(browser);
  return { container: containerStyle.container };
}

class CreateWikiPage extends React.PureComponent {
  static defaultProps = {
    title: "建立維基"
  };

  static contextTypes = {
    router: PropTypes.object
  };

  componentWillMount() {
    const title = this.props.title;
    this.props.dispatch(setHeaderTitle(title));
  }

  setFormRef = formComponent => {
    if (formComponent) {
      this.formComponent = formComponent;
      const onTouchTap = this.sendForm;
      this.props.dispatch(updateSendButtonProps({ onTouchTap }));
    } else {
      this.props.dispatch(
        updateSendButtonProps({
          onTouchTap: () => {}
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
          .then(() => this.context.router.goBack())
          .catch(() => dispatch(updateSendButtonProps({ loading: false })));
      });
    }
  };

  render() {
    const title = this.props.title;
    const metaDescription = title;
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    const styles = getStyles(this.props.browser);
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <div style={styles.container}>
          <WikiForm ref={this.setFormRef} rootWikiId={this.props.rootWikiId} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const { rootWikiId } = props.params;
  return { browser: state.browser, rootWikiId };
}

export default connect(mapStateToProps)(CreateWikiPage);
