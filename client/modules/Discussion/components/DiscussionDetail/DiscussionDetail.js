import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Set, OrderedSet } from "immutable";
import { immutableRenderDecorator } from "react-immutable-render-mixin";
import compose from "recompose/compose";
import { Link } from "react-router-dom";
import ScrollContainerHoc from "../../../../components/ScrollContainer/ScrollContainerHoc";

import classNames from "classnames";
import { withStyles } from "material-ui-next/styles";
import Typography from "material-ui-next/Typography";
import Button from "material-ui-next/Button";
import Grid from "material-ui-next/Grid";
import Divider from "material-ui-next/Divider";
import CenterCircularProgress from "../../../../components/CenterCircularProgress";
import DiscussionNode from "./DiscussionNode";
import ReplyButton from "./ReplyButton";

import {
  getDiscussions,
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

const GotoDiscussionButton = (
  { direction = "next", discussion, ...other } = {
    direction: "next",
    discussion: null
  }
) => {
  const id = discussion ? discussion.get("_id") : "";
  const title = discussion ? discussion.get("title") : "";
  const to = id ? `/discussions/${id}` : "";
  const LinkProps = to
    ? {
        component: Link,
        to
      }
    : null;
  return (
    <Button
      style={{ textTransform: "none", maxWidth: 100 }}
      {...LinkProps}
      {...other}
    >
      <Grid
        container
        wrap="nowrap"
        direction="column"
        justify="flex-start"
        alignItems="center"
        spacing={0}
      >
        <Grid item>
          <Typography variant="subheading">
            {direction === "next" ? "下一篇" : "上一篇"}
          </Typography>
        </Grid>
        {title ? (
          <Grid item xs zeroMinWidth>
            <Typography noWrap variant="caption">
              {title}
            </Typography>
          </Grid>
        ) : null}
      </Grid>
    </Button>
  );
};

class DiscussionDetail extends React.Component {
  static propTypes = {
    parentDiscussionId: PropTypes.string.isRequired,
    parentDiscussion: PropTypes.object,
    nextParentDiscussion: PropTypes.object,
    prevParentDiscussion: PropTypes.object,
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
    semanticReplaceMode: false,
    nextParentDiscussion: null,
    prevParentDiscussion: null
  };

  render() {
    const {
      parentDiscussion,
      parentDiscussionId,
      childDiscussions,
      semanticRules,
      semanticReplaceMode,
      nextParentDiscussion,
      prevParentDiscussion
    } = this.props;
    if (!parentDiscussion) {
      return <CenterCircularProgress />;
    }
    const forumBoardId = parentDiscussion.get("forumBoard");
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
          <div style={{ maxWidth: "100%" }}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
              spacing={0}
            >
              <Grid item>
                <GotoDiscussionButton
                  direction="prev"
                  discussion={prevParentDiscussion}
                />
              </Grid>
              <Grid item>
                <Button
                  component={Link}
                  to={`/forumBoards/${forumBoardId}/rootDiscussions`}
                >
                  返回列表
                </Button>
              </Grid>
              <Grid item>
                <GotoDiscussionButton
                  direction="next"
                  discussion={nextParentDiscussion}
                />
              </Grid>
            </Grid>
          </div>
          <h2>{parentDiscussion.get("title")}</h2>
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

// TODO
// rename and move to discussion reducer and memoized.
function getDiscussionByDirection(
  discussions,
  parentDiscussion,
  direction = "next",
  timestampField = "updatedAt"
) {
  const found = discussions
    .toOrderedSet()
    .filter(d => {
      const _id = d.get("_id");
      const forumBoard = d.get("forumBoard");
      const isRoot = d.get("isRoot");
      return (
        _id !== parentDiscussion.get("_id") &&
        forumBoard === parentDiscussion.get("forumBoard") &&
        isRoot === parentDiscussion.get("isRoot")
      );
    })
    .sortBy(d => {
      return direction === "next"
        ? -1 * new Date(d.get("updatedAt")).getTime()
        : new Date(d.get("updatedAt")).getTime();
    })
    .find(d => {
      const updatedAt = new Date(d.get("updatedAt"));
      return direction === "next"
        ? updatedAt.getTime() <=
            new Date(parentDiscussion.get("updatedAt")).getTime()
        : updatedAt.getTime() >=
            new Date(parentDiscussion.get("updatedAt")).getTime();
    });
  return found;
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
  const discussions = getDiscussions(state);
  const nextParentDiscussion = parentDiscussion
    ? getDiscussionByDirection(discussions, parentDiscussion, "next")
    : null;
  const prevParentDiscussion = parentDiscussion
    ? getDiscussionByDirection(discussions, parentDiscussion, "prev")
    : null;
  return {
    parentDiscussionId,
    forumBoardId,
    forumBoard,
    parentDiscussion,
    childDiscussions,
    semanticRules,
    nextParentDiscussion,
    prevParentDiscussion
  };
}

export default compose(
  ScrollContainerHoc,
  withStyles(styles),
  connect(mapStateToProps, null, null, { pure: false }),
  immutableRenderDecorator
)(DiscussionDetail);
