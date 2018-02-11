import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Set } from "immutable";
import moment from "moment";

import { withStyles } from "material-ui-next/styles";
import Switch from "material-ui-next/Switch";
import WikiIcon from "material-ui-icons-next/ImportContacts";
import { FormControlLabel } from "material-ui-next/Form";
import Card, { CardHeader, CardContent } from "material-ui-next/Card";
import Divider from "material-ui-next/Divider";

import UserAvatar from "../../../User/components/UserAvatar";
import Editor from "../../../../components/Slate/Editor";

const styles = {
  root: {
    boxSizing: "border-box"
  },
  title: {
    boxSizing: "border-box",
    padding: "5px 5px 0px 5px"
  },
  content: {
    boxSizing: "border-box",
    padding: "15px"
  },
  simpleInfo: {
    margin: "0px 5px 0px 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  avatarContainer: {
    display: "flex",
    alignItems: "center"
  },
  smallFont: {
    color: "#999",
    fontSize: "13px"
  }
};

class DiscussionNode extends React.Component {
  static defaultProps = {
    discussion: null,
    semanticReplaceMode: false,
    semanticRules: Set(),
    divider: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      semanticReplaceMode: false,
      semanticReplaceToggled: false
    };
  }

  componentWillMount() {
    this.timeouts = [];
  }

  componentDidMount() {
    if (this.state.semanticReplaceMode !== this.props.semanticReplaceMode) {
      this.onSemanticToggle(null, null, 0);
    }
  }

  componentWillUnmount() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  onSemanticToggle = (event, isInputChecked, time) => {
    const afterUpdate = () => {
      if (this.props.onSemanticToggle) {
        this.props.onSemanticToggle(event, this.state.semanticReplaceToggled);
      }
      this.semanticToggle(time);
    };
    this.setState(
      {
        semanticReplaceToggled: !this.state.semanticReplaceToggled
      },
      afterUpdate
    );
  };

  semanticToggle = (time = 160) => {
    if (typeof window === "object") {
      // emulate after toggle transition.
      const timeout = setTimeout(() => {
        const { semanticReplaceMode } = this.state;
        this.setState({
          semanticReplaceMode: !semanticReplaceMode
        });
      }, time);
      this.timeouts.push(timeout);
    }
  };

  render() {
    const { semanticReplaceMode, semanticReplaceToggled } = this.state;
    const { discussion, semanticRules } = this.props;
    const { title, authorBasicInfo, createdAt, content } = discussion;
    const displayName = authorBasicInfo
      ? authorBasicInfo.get("displayName")
      : "";
    const createdAtFromNow = moment(createdAt).fromNow();
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Card elevation={0}>
          <CardHeader
            avatar={<UserAvatar user={authorBasicInfo} />}
            action={
              <FormControlLabel
                control={
                  <Switch
                    onChange={this.onSemanticToggle}
                    checked={semanticReplaceToggled}
                  />
                }
                label={<WikiIcon />}
              />
            }
            title={
              authorBasicInfo ? authorBasicInfo.get("displayName") : "Guest"
            }
            subheader={createdAtFromNow}
          />
          <CardContent>
            <Editor
              rawContent={content}
              readOnly={true}
              semanticRules={semanticRules}
              semanticReplaceMode={semanticReplaceMode}
            />
          </CardContent>
        </Card>
        {this.props.divider ? <Divider /> : null}
      </div>
    );
  }
}

export default withStyles(styles)(DiscussionNode);
