import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Set, OrderedSet } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../../../util/createFastMemoizeDefaultOptions";

import ScrollContainer from "../../../../components/ScrollContainer";

import compose from "recompose/compose";
import { withStyles } from "material-ui-next/styles";
import MuiDivider from "material-ui-next/Divider";
import CenterCircularProgress from "../../../../components/CenterCircularProgress";
import DiscussionNode from "./DiscussionNode";
import ReplyButton from "./ReplyButton";
import slideHeightStyles from "../../../MyApp/styles/slideHeight";

import { getDiscussion, getDiscussions } from "../../DiscussionReducer";
import { getForumBoardById } from "../../../ForumBoard/ForumBoardReducer";
import { getSemanticRules } from "../../../SemanticRule/SemanticRuleReducer";

const dividerStyles = theme => {
  return {
    default: {
      backgroundColor: theme.palette.primary.light
    }
  };
};

const Divider = withStyles(dividerStyles)(MuiDivider);

export function styles(theme) {
  const heightStyle = slideHeightStyles(theme);
  return {
    root: Object.assign(
      {
        overflow: "auto"
      },
      heightStyle.slideHeight
    ),
    list: {
      height: "100%",
      overflow: "auto"
    }
  };
}

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
  componentDidMount() {
    const list = ReactDOM.findDOMNode(this.list);
    if (list) {
      list.addEventListener("scroll", this.handleScroll);
    }
  }

  componentWillUnmount() {
    const list = ReactDOM.findDOMNode(this.list);
    list.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = e => {
    console.log("e scroll", e);
  };

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
      <div className={classes.root}>
        <ScrollContainer scrollKey={parentDiscussionId}>
          <div
            className={classes.list}
            onScroll={this.handleScroll}
            ref={ele => {
              this.list = ele;
            }}
          >
            {discussions
              .map((d, i) => {
                const dividerKey = `divider-${i}`;
                return [
                  <DiscussionNode
                    onSemanticToggle={this.props.onSemanticToggle}
                    semanticReplaceMode={semanticReplaceMode}
                    discussion={d}
                    semanticRules={semanticRules}
                    key={d.get("_id")}
                  />,
                  <Divider key={dividerKey} />
                ];
              })
              .toJS()}
          </div>
        </ScrollContainer>
        <ReplyButton
          href={`/create/rootDiscussions/${parentDiscussionId}/childDiscussion`}
        />
      </div>
    );
  }
}

const getSemanticRulesHelper = (() => {
  let f = (rootWikiId, semanticRules) => {
    return semanticRules
      .filter(ele => ele.get("rootWikiId") === rootWikiId)
      .sortBy(ele => ele.get("name").length);
  };
  if (typeof window === "object") {
    f = memoize(f, createFastMemoizeDefaultOptions(1));
  }
  return f;
})();

const getChildrenDiscussionsHelper = (() => {
  let f = (parentDiscussionId, discussions) => {
    return discussions
      .filter(v => v.get("parentDiscussion") === parentDiscussionId)
      .toSet();
  };
  if (typeof window === "object") {
    f = memoize(f, createFastMemoizeDefaultOptions(1));
  }
  return f;
})();

function mapStateToProps(store, props) {
  const { parentDiscussionId, forumBoardId } = props;
  const forumBoard = getForumBoardById(store, forumBoardId);
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  const childDiscussions = getChildrenDiscussionsHelper(
    parentDiscussionId,
    getDiscussions(store)
  );
  const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : null;
  const semanticRules = rootWikiId
    ? getSemanticRulesHelper(rootWikiId, getSemanticRules(store))
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

export default compose(withStyles(styles), connect(mapStateToProps))(
  DiscussionDetail
);
