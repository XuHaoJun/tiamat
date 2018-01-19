import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Set, OrderedSet } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import Divider from "material-ui/Divider";
import memoize from "fast-memoize";
import { ScrollContainer } from "react-router-scroll";

import { getDiscussion, getDiscussions } from "../../DiscussionReducer";
import { getForumBoardById } from "../../../ForumBoard/ForumBoardReducer";
import { getSemanticRules } from "../../../SemanticRule/SemanticRuleReducer";
import CenterCircularProgress from "../../../../components/CenterCircularProgress";
import createFastMemoizeDefaultOptions from "../../../../util/createFastMemoizeDefaultOptions";
import DiscussionNode from "./DiscussionNode";
import ReplyButton from "./ReplyButton";

export function getStyles(propStyles, context) {
  const appBarHeight = context.muiTheme.appBar.height;
  const styles = {
    listContainer: {
      overflow: "auto",
      height: `calc(100vh - ${appBarHeight}px)`,
      WebkitOverflowScrolling: "touch"
    }
  };
  return Object.assign(styles, propStyles);
}

class DiscussionDetail extends React.Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  static defaultProps = {
    forumBoardId: "",
    forumBoard: undefined,
    parentDiscussionId: "",
    parentDiscussion: undefined,
    childDiscussions: undefined,
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
    const { listContainerStyle } = this.props;
    const propStyles = {
      listContainerStyle
    };
    const styles = getStyles(propStyles, this.context);
    const discussions = OrderedSet()
      .add(parentDiscussion)
      .union(childDiscussions)
      .sortBy(d => {
        return new Date(d.get("updatedAt")).getTime();
      });
    return (
      <div>
        <ScrollContainer scrollKey={parentDiscussionId}>
          <div
            style={styles.listContainer}
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
  const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : undefined;
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

export default connect(mapStateToProps)(DiscussionDetail);
