import React from "react";
import { connect } from "react-redux";
import { Set, OrderedSet } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import compose from "recompose/compose";
import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../../../util/createFastMemoizeDefaultOptions";
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
import { getSemanticRules } from "../../../SemanticRule/SemanticRuleReducer";

const styles = {
  root: {
    width: "100%",
    height: "100%",
    overflow: "auto"
  }
};

class DiscussionDetail extends React.Component {
  static defaultProps = {
    forumBoardId: "",
    forumBoard: null,
    parentDiscussionId: "",
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
      <div className={classNames(classes.root, this.props.className)}>
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
        <ReplyButton
          to={`/create/rootDiscussions/${parentDiscussionId}/childDiscussion`}
        />
      </div>
    );
  }
}

const getSemanticRulesHelper = (() => {
  const f = (rootWikiId, semanticRules) => {
    return semanticRules
      .filter(ele => ele.get("rootWikiId") === rootWikiId)
      .sortBy(ele => ele.get("name").length);
  };
  if (process.browser) {
    return memoize(f, createFastMemoizeDefaultOptions(1));
  } else {
    return f;
  }
})();

function mapStateToProps(state, props) {
  const { parentDiscussionId, forumBoardId } = props;
  const forumBoard = getForumBoardById(state, forumBoardId);
  const parentDiscussion = getDiscussionById(state, parentDiscussionId);
  const childDiscussions = getChildDiscussions(
    state,
    parentDiscussionId
  ).toSet();
  const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : null;
  const semanticRules = rootWikiId
    ? getSemanticRulesHelper(rootWikiId, getSemanticRules(state))
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
