import React from "react";
import { List } from "immutable";
import CommonList from "../../../components/List/CommonList";
import { connect } from "react-redux";
import { getForumBoardById } from "../ForumBoardReducer";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import RightArrowIcon from "material-ui/svg-icons/hardware/keyboard-arrow-right";

class ForumBoardGroupsList extends React.Component {
  static defaultProps = {
    groups: List(),
    defaultAllGroup: "全部",
    forumBoardId: "",
    forumBoard: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  listItemHref = payload => {
    const { forumBoardId, defaultAllGroup } = this.props;
    const query =
      payload !== defaultAllGroup
        ? `?forumBoardGroup=${encodeURIComponent(payload)}`
        : "";
    return `/forumBoards/${forumBoardId}/rootDiscussions${query}`;
  };

  sortBy = payload => {
    if (this.props.defaultAllGroup === payload) {
      return -2;
    } else if (payload === "綜合討論") {
      return -1;
    }
    return payload.length;
  };

  listItemValue = payload => {
    return payload;
  };

  listItemRightIcon = () => {
    return <RightArrowIcon />;
  };

  render() {
    const { groups, defaultAllGroup, forumBoardGroup } = this.props;
    const dataSource = groups.insert(0, defaultAllGroup).sortBy(this.sortBy);
    return (
      <CommonList
        dataSource={dataSource}
        enableLoadMore={false}
        enableSelectable={true}
        defaultValue={!forumBoardGroup ? defaultAllGroup : forumBoardGroup}
        listItemValue={this.listItemValue}
        listItemRouterMethod="replace"
        listItemRightIcon={this.listItemRightIcon}
        listItemHref={this.listItemHref}
      />
    );
  }
}

function mapStateToProps(store, props) {
  const { groups, forumBoardId, forumBoardGroup } = props;
  const forumBoard = props.forumBoard || getForumBoardById(store, forumBoardId);
  return {
    forumBoardId,
    forumBoard,
    forumBoardGroup,
    groups: forumBoard ? forumBoard.get("groups") : groups
  };
}

export default connect(mapStateToProps)(ForumBoardGroupsList);
