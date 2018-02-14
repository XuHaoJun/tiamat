import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Set, OrderedSet } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import compose from "recompose/compose";
import ScrollContainerHoc from "../../../../components/ScrollContainer/ScrollContainerHoc";

import classNames from "classnames";
import { withStyles } from "material-ui-next/styles";
import Divider from "material-ui-next/Divider";
import CenterCircularProgress from "../../../../components/CenterCircularProgress";
import DiscussionNode from "./DiscussionNode";
import ReplyButton from "./ReplyButton";

import {
  getDiscussionById,
  getChildDiscussions
} from "../../DiscussionReducer";
import { getForumBoardById } from "../../../ForumBoard/ForumBoardReducer";
import { getSemanticRulesByRootWikiId } from "../../../SemanticRule/SemanticRuleReducer";

const styles = {
  root: {
    width: "100%",
    height: "100%",
    overflow: "auto"
  }
};

class DiscussionDetail extends React.Component {
  static propTypes = {
    parentDiscussionId: PropTypes.string.isRequired,
    parentDiscussion: PropTypes.object,
    forumBoardId: PropTypes.string,
    forumBoard: PropTypes.object,
    childDiscussions: PropTypes.object,
    semanticReplaceMode: PropTypes.bool
  };

  static defaultProps = {
    forumBoardId: "",
    forumBoard: null,
    parentDiscussion: null,
    childDiscussions: null,
    semanticReplaceMode: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const {
      parentDiscussion,
      parentDiscussionId,
      childDiscussions,
      semanticRules,
      semanticReplaceMode
    } = this.props;
    if (!parentDiscussion) {
      return <CenterCircularProgress />;
    }
    const discussions = OrderedSet()
      .add(parentDiscussion)
      .union(childDiscussions)
      .sortBy(d => {
        return new Date(d.get("updatedAt")).getTime();
      });
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classNames(classes.root, this.props.className)}>
          <h1>{parentDiscussion.get("title")}</h1>
          <Divider />
          {discussions.map(d => {
            return (
              <DiscussionNode
                key={d.get("_id")}
                discussion={d}
                semanticRules={semanticRules}
                onSemanticToggle={this.props.onSemanticToggle}
                semanticReplaceMode={semanticReplaceMode}
                divider={true}
              />
            );
          })}
        </div>
        <ReplyButton
          to={`/create/rootDiscussions/${parentDiscussionId}/childDiscussion`}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, props) {
  const { parentDiscussionId, forumBoardId } = props;
  const parentDiscussion = getDiscussionById(state, parentDiscussionId);
  const childDiscussions = getChildDiscussions(
    state,
    parentDiscussionId
  ).toSet();
  const forumBoard = getForumBoardById(state, forumBoardId);
  const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
  const semanticRules = rootWikiId
    ? getSemanticRulesByRootWikiId(state, rootWikiId)
    : Set();
  return {
    parentDiscussionId,
    forumBoardId,
    forumBoard,
    parentDiscussion,
    childDiscussions,
    semanticRules
  };
}

export default compose(
  ScrollContainerHoc,
  withStyles(styles),
  connect(mapStateToProps)
)(DiscussionDetail);
