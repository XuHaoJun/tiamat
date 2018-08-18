import React from 'react';
import { Set, is } from 'immutable';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import List from '../../../components/List/EnhancedList';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import { getForumBoards } from '../ForumBoardReducer';
import { fetchForumBoards } from '../ForumBoardActions';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';

import Avatar from '@material-ui/core/Avatar';
import Debug from 'debug';

const debug = Debug('app:ForumBoardList');

const defaultSortBy = d => {
  return -1 * d.get('popularityCounter');
};

class ForumBoardList extends React.Component {
  static defaultProps = {
    dataSource: Set(),
    sortBy: defaultSortBy,
    style: { width: '100%', height: '100%', overflow: 'auto' },
  };

  static getInitialAction() {
    return dispatch => {
      return dispatch(fetchForumBoards());
    };
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { dataSource } = props;
    const limit = props.limit || 10;
    const page = props.page || Math.floor(dataSource.count() / limit) || 1;
    this.state = {
      page,
      limit,
    };
  }

  handleRequestMore = ({ direction }) => {
    if (direction === 'top') {
      return this.props.dispatch(ForumBoardList.getInitialAction());
    } else {
      const { page, limit, sort } = this.state;
      const nextPage = page + 1;
      const prevDataSource = this.props.dataSource;
      debug('onRequestLoadMore start');
      return this.props.dispatch(fetchForumBoards(nextPage, limit, sort)).then(() => {
        debug('onRequestLoadMore end1');
        const currentDataSource = this.props.dataSource;
        const nextState = {};
        const changed = currentDataSource.count() > 0 && !is(prevDataSource, currentDataSource);
        if (changed) {
          nextState.page = nextPage;
        }
        this.setState(nextState);
        debug('onRequestLoadMore end2');
      });
    }
  };

  render() {
    const dataSource = this.props.sortBy
      ? this.props.dataSource.sortBy(this.props.sortBy)
      : this.props.dataSorce;
    const { id } = this.props;
    return (
      <List
        id={id ? `${id}/List` : undefined}
        onRequestMore={this.handleRequestMore}
        style={this.props.style}
      >
        {dataSource.map(forumBoard => {
          const _id = forumBoard.get('_id');
          const name = forumBoard.get('name');
          const popularityCounter = forumBoard.get('popularityCounter');
          const key = `ForumBoardList/${_id}`;
          const defaultAvatar = name[0];
          const primary = name;
          const secondary = `${popularityCounter} 人氣`;
          const to = `/forumBoards/${_id}/rootDiscussions`;
          return (
            <ListItem key={key} button divider component={Link} to={to}>
              <ListItemAvatar>
                <Avatar>{defaultAvatar}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={primary} secondary={secondary} />
            </ListItem>
          );
        })}
      </List>
    );
  }
}

function mapStateToProps(state) {
  const forumBoards = getForumBoards(state);
  return { dataSource: forumBoards };
}

export default connect(mapStateToProps)(ForumBoardList);
