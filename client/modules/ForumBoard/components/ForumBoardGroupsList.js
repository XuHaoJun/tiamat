import React from "react";
import { connect } from "react-redux";
import { List } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import { replace } from "react-router-redux";
import { MenuItem, MenuList } from "material-ui-next/Menu";
import { ListItemText, ListItemIcon } from "material-ui-next/List";
import RightArrowIcon from "material-ui-icons-next/KeyboardArrowRight";

import { getForumBoardById } from "../ForumBoardReducer";

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
    this.state = {
      selectedGroup: props.forumBoardGroup
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.forumBoardGroup !== nextProps.forumBoardGroup) {
      this.setState({ selectedGroup: nextProps.forumBoardGroup });
    }
  }

  listItemHref = group => {
    const { forumBoardId, defaultAllGroup } = this.props;
    const query =
      group !== defaultAllGroup
        ? `?forumBoardGroup=${encodeURIComponent(group)}`
        : "";
    return `/forumBoards/${forumBoardId}/rootDiscussions${query}`;
  };

  sortBy = payload => {
    if (this.props.defaultAllGroup === payload) {
      return -2;
    } else if (payload === "綜合討論") {
      return -1;
    }
    return 0;
  };

  handleMenuItemClick = (event, group) => {
    if (group !== this.state.selectedGroup) {
      this.setState({ selectedGroup: group });
    }
    if (this.props.onMenuItemClick) {
      this.props.onMenuItemClick(event, group, this.listItemHref(group));
    }
  };

  render() {
    const { groups, defaultAllGroup } = this.props;
    const dataSource = groups.insert(0, defaultAllGroup).sortBy(this.sortBy);
    const { selectedGroup } = this.state;
    return (
      <MenuList role="menu">
        {dataSource.map(group => {
          const selected = selectedGroup
            ? selectedGroup === group
            : group === defaultAllGroup;
          return (
            <MenuItem
              key={group}
              selected={selected}
              onClick={event => this.handleMenuItemClick(event, group)}
            >
              <ListItemText primary={group} />
              <ListItemIcon>
                <RightArrowIcon />
              </ListItemIcon>
            </MenuItem>
          );
        })}
      </MenuList>
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

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onMenuItemClick(event, group, href) {
      if (ownProps.onMenuItemClick) {
        ownProps.onMenuItemClick(event, group, href);
      }
      dispatch(replace(href));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  ForumBoardGroupsList
);
