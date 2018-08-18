import React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';
import { shallowEqualImmutable } from 'react-immutable-render-mixin';

import { Link } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ListItemText from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import RightArrowIcon from '@material-ui/icons/KeyboardArrowRight';

import { getForumBoardById } from '../ForumBoardReducer';

class ForumBoardGroupsList extends React.Component {
  static defaultProps = {
    groups: List(),
    defaultAllGroup: '全部',
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedGroup: props.forumBoardGroup,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.forumBoardGroup !== nextProps.forumBoardGroup) {
      this.setState({ selectedGroup: nextProps.forumBoardGroup });
    }
  }

  listItemHref = group => {
    const { forumBoardId, defaultAllGroup } = this.props;
    const query = group !== defaultAllGroup ? `?forumBoardGroup=${encodeURIComponent(group)}` : '';
    return `/forumBoards/${forumBoardId}/rootDiscussions${query}`;
  };

  sortBy = payload => {
    if (this.props.defaultAllGroup === payload) {
      return -2;
    } else if (payload === '綜合討論') {
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
          const selected = selectedGroup ? selectedGroup === group : group === defaultAllGroup;
          const to = this.listItemHref(group);
          return (
            <MenuItem
              key={group}
              component={Link}
              to={to}
              replace={true}
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
    groups: forumBoard ? forumBoard.get('groups') : groups,
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  {
    areStatePropsEqual: shallowEqualImmutable,
  }
)(ForumBoardGroupsList);
