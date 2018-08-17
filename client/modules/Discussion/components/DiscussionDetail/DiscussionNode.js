import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import moment from "moment";

import Switch from "@material-ui/core/Switch";
import WikiIcon from "@material-ui/icons/ImportContacts";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";

import UserAvatar from "../../../User/components/UserAvatar";
import Editor from "../../../../components/Slate/Editor";

class DiscussionNode extends React.Component {
  static defaultProps = {
    semanticReplaceMode: false,
    semanticRules: null
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
    if (process.browser) {
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
    const {
      index,
      discussion,
      semanticRules,
      onSemanticToggle,
      semanticReplaceMode: semanticReplaceModeInput,
      ...other
    } = this.props;
    const { authorBasicInfo, createdAt, content } = discussion;
    const displayName = authorBasicInfo ? authorBasicInfo.displayName : "Guest";
    const indexDisplay = typeof index === "number" ? `#${index}` : index || "";
    const cardHeaderTitle = `${displayName} ${indexDisplay}`;
    const createdAtFromNow = moment(createdAt).fromNow();
    return (
      <Card {...other}>
        <CardHeader
          avatar={<UserAvatar user={authorBasicInfo} />}
          action={
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  onChange={this.onSemanticToggle}
                  checked={semanticReplaceToggled}
                />
              }
              label={<WikiIcon />}
            />
          }
          title={cardHeaderTitle}
          subheader={createdAtFromNow}
        />
        <CardContent>
          {content ? (
            <Editor
              rawContent={content}
              readOnly={true}
              semanticRules={semanticRules}
              semanticReplaceMode={semanticReplaceMode}
            />
          ) : (
            <CircularProgress />
          )}
        </CardContent>
        <CardActions>
          <IconButton aria-label="Add to favorites">
            <FavoriteIcon />
          </IconButton>
          <IconButton aria-label="Share">
            <ShareIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }
}

export default DiscussionNode;
