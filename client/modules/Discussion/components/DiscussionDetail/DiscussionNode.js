import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Set } from "immutable";
import Toggle from "material-ui/Toggle";
import moment from "moment";
import WikiIcon from "material-ui/svg-icons/communication/import-contacts";

import Editor from "../../../../components/Slate/Editor";
import UserAvatar from "../../../User/components/UserAvatar";

const styles = {
  title: {
    padding: "5px 5px 0px 5px"
  },
  content: {
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
    semanticRules: Set()
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
        this.props.onSemanticToggle(
          event,
          this.state.semanticReplaceToggled,
          this
        );
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
    return (
      <div>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.simpleInfo}>
          <div>
            <div style={styles.avatarContainer}>
              <UserAvatar user={authorBasicInfo} />
              <span style={{ marginLeft: 5 }}>{displayName || "Guset"} </span>
            </div>
          </div>
          <div>
            <Toggle
              label={<WikiIcon />}
              onToggle={this.onSemanticToggle}
              toggled={semanticReplaceToggled}
            />
            <div style={styles.smallFont}>{createdAtFromNow}</div>
          </div>
        </div>
        <div style={styles.content}>
          <Editor
            rawContent={content}
            readOnly={true}
            semanticRules={semanticRules}
            semanticReplaceMode={semanticReplaceMode}
          />
        </div>
      </div>
    );
  }
}

export default DiscussionNode;
