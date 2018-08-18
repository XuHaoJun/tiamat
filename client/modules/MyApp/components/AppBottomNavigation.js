import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import WhatsHotIcon from '@material-ui/icons/Whatshot';
import ActionHomeIcon from '@material-ui/icons/Home';
import ChatIcon from '@material-ui/icons/Chat';
import SubscriptionIcon from '@material-ui/icons/RssFeed';

const styles = theme => {
  const { breakpoints } = theme;
  return {
    root: {
      width: '100%',
      position: 'fixed',
      bottom: 0,
      left: 0,
      zIndex: 100,
      display: 'block',
      [`${breakpoints.up('sm')}`]: {
        display: 'none',
      },
    },
  };
};

class AppBottomNavigation extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    selectedIndex: PropTypes.string,
  };

  static defaultProps = {
    selectedIndex: '/',
  };

  handleChange = (event, nextIndex) => {
    if (this.props.onSelect) {
      this.props.onSelect(event, nextIndex, this.props.selectedIndex);
    }
  };

  render() {
    const { classes, selectedIndex } = this.props;
    return (
      <div className={classes.root}>
        <BottomNavigation value={selectedIndex} onChange={this.handleChange} showLabels>
          <BottomNavigationAction value="/" label="首頁" icon={<ActionHomeIcon />} />
          <BottomNavigationAction
            value="/whatsHotDiscussions"
            label="熱門話題"
            icon={<WhatsHotIcon />}
          />
          <BottomNavigationAction
            value="/subscriptions"
            label="訂閱內容"
            icon={<SubscriptionIcon />}
          />
          <BottomNavigationAction value="/chatRooms" label="聊天室" icon={<ChatIcon />} />
        </BottomNavigation>
      </div>
    );
  }
}

import { setHistoryCursor, clearHistoryByCursor } from '../../History/HistoryActions';
import { getCursor, getStackByCursor } from '../../History/HistoryReducer';
import { push } from 'react-router-redux';

function mapStateToProps(state) {
  const selectedIndex = getCursor(state);
  // never pass to props ignore by mergeProps function.
  const _history = state.history;
  return { selectedIndex, _history };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { _history, ...otherStateProps } = stateProps;
  const _getStackByCursor = cursor => getStackByCursor({ history: _history }, cursor);
  const { dispatch } = dispatchProps;
  const onSelect = (event, nextIndex, currentIndex) => {
    if (nextIndex === currentIndex) {
      const cursor = currentIndex;
      const pathname = cursor;
      dispatch(clearHistoryByCursor(cursor));
      dispatch(push(pathname));
    } else {
      const cursor = nextIndex;
      const stack = _getStackByCursor(cursor);
      dispatch(setHistoryCursor(cursor));
      dispatch(clearHistoryByCursor(cursor));
      // append stack to global history stack
      if (stack && stack.length > 0) {
        for (const l of stack) {
          l.state = l.state || {};
          l.state = { ...l.state, oriKey: l.key };
        }
        // FIXME
        // dirty push to global history stack
        const reversedStackNoHead = stack.slice(1, stack.length).reverse();
        for (const location of reversedStackNoHead) {
          dispatch(push(location));
        }
        // only trigger last push for re-render page.
        const head = stack[0];
        dispatch(push(head));
      } else {
        const pathname = cursor;
        dispatch(push(pathname));
      }
    }
  };
  return Object.assign({}, ownProps, otherStateProps, dispatchProps, {
    onSelect,
  });
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )
)(AppBottomNavigation);
