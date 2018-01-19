import React from "react";
import { connect } from "react-redux";
import { Map } from "immutable";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import { getModule } from "../../../../modules/Template/TemplateReducer";
import AceEditor from "../../../AceEditor";
import UpsertTemplateTabs from "./components/UpsertTemplateTabs";

class Template extends React.Component {
  state = {
    code: "",
    open: false
  };

  handleChangeCode = nextCode => {
    this.setState({ code: nextCode });
  };

  handleSave = () => {
    this.setState({ open: false });
    const { editor, node } = this.props;
    const { key, data } = node;
    const oldData = data;
    const oldTemplateData = oldData.get("template");
    if (oldTemplateData) {
      const updateTemplateData = Map({
        code: this.state.code,
        updatedAt: Date.now()
      });
      const nextTemplateData = oldTemplateData.merge(updateTemplateData);
      const nextData = oldData.merge(Map({ template: nextTemplateData }));
      editor.change(change => {
        return change.setNodeByKey(key, {
          data: nextData
        });
      });
    } else {
      // TODO
      // template node must have template data.
      // console.warn(`template ${key} no data!`);
    }
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
    const { module } = this.props;
    const Component = module ? module.get("instance").default : null;
    if (editorReadOnly && !Component) {
      return <span {...this.props.attributes}>Template Loading...</span>;
    } else if (Component) {
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
  (state, props) => {
    const { node } = props;
    const template = node.data.get("template");
    const module = getModule(state, template);
    return { module };
  },
  null,
  (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps, {
      appDispatch: dispatchProps.dispatch
    });
  }
)(Template);

export default ConnectedWithApp;
