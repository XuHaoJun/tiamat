import React from "react";
import { connect } from "react-redux";
import { fromJS } from "immutable";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import AceEditor from "../../../AceEditor";
import { compile } from "../../../../modules/Template/TemplateActions";
import { getCaches } from "../../../../modules/Template/TemplateReducer";
import UpsertTemplateTabs from "./components/UpsertTemplateTabs";

class Template extends React.Component {
  state = {
    code: "",
    open: false
  };

  handleChangeCode = nextCode => {
    this.setState({ code: nextCode });
  };

  compile = template => {
    const { caches } = this.props;
    return this.props.appDispatch(compile(template, { caches }));
  };

  handleSave = () => {
    this.setState({ open: false });
    const { editor, node } = this.props;
    const { key } = node;
    const oldData = node.data;
    const oldTemplateData = oldData.get("template");
    const templateData = fromJS({
      code: this.state.code
    });
    const nextTemplateData = oldTemplateData
      ? oldTemplateData.merge(templateData)
      : fromJS({ template: templateData });
    const nextData = oldData.merge(nextTemplateData);
    editor.change(change => {
      return change.setNodeByKey(key, {
        data: nextData
      });
    });
    // this.compile(nextData);
    if (this.props.onSave) {
      this.props.onSave(this.state.code, this);
    }
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    // TODO
    // get enableTemplatePlaceholder from redux state.
    const editorReadOnly = this.props.editor.props.readOnly;
    const { node } = this.props;
    const Component = node.get("Component");
    if (editorReadOnly && !Component) {
      return <span {...this.props.attributes}>Loading...</span>;
    }
    if (Component) {
      return <Component {...this.props.attributes} />;
    } else {
      // this.compile().then(({ module }) => {
      //   this.setState({ Component: module });
      //   console.log("module", module);
      // });
      const actions = [
        <FlatButton label="取消" primary={true} onClick={this.handleClose} />,
        <FlatButton
          label="儲存"
          primary={true}
          keyboardFocused={true}
          onClick={this.handleSave}
        />
      ];
      return (
        <span // eslint-disable-line
          style={{ cursor: "pointer" }}
          onClick={this.handleOpen}
          role="button"
          aria-label="script"
          {...this.props.attributes}
        >
          📝
          {this.state.open ? (
            <Dialog
              modal={true}
              actions={actions}
              open={this.state.open}
              autoDetectWindowHeight={false}
              autoScrollBodyContent={false}
              contentStyle={{
                height: "70vh",
                width: "100%",
                maxWidth: "none"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {/* <SetTemplateTabs/> */}
                <AceEditor
                  onChange={this.handleChangeCode}
                  value={this.state.code}
                  name="haha"
                  theme="github"
                  mode="jsx"
                  height="70vh"
                  width="70vw"
                />
              </div>
            </Dialog>
          ) : null}
        </span>
      );
    }
  }
}

export const TemplateWithoutConnect = Template;

export const connectEditorHelper = (editorConnect, NextTemplate) => {
  return editorConnect(
    state => {
      const { storeKey } = state;
      return { editorStoreKey: storeKey };
    },
    dispatch => {
      return { dispatch };
    },
    (stateProps, dispatchProps, ownProps) => {
      return Object.assign({}, stateProps, ownProps, {
        editorDispatch: dispatchProps.dispatch
      });
    }
  )(NextTemplate);
};

const ConnectedWithApp = connect(
  state => {
    const caches = getCaches(state);
    return { caches };
  },
  null,
  (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps, {
      appDispatch: dispatchProps.dispatch
    });
  }
)(Template);

export default ConnectedWithApp;
