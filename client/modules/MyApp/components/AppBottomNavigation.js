import React, { Component } from "react";
import { connect } from "react-redux";

import {
  BottomNavigation,
  BottomNavigationItem
} from "material-ui/BottomNavigation";

import WhatsHotIcon from "material-ui/svg-icons/social/whatshot";
import ActionHomeIcon from "material-ui/svg-icons/action/home";
import ChatIcon from "material-ui/svg-icons/communication/chat";
import SubscriptionIcon from "material-ui/svg-icons/communication/rss-feed";

const whatsHotIcon = <WhatsHotIcon />;
const actionHomeIcon = <ActionHomeIcon />;
const chatIcon = <ChatIcon />;
const subscriptionIcon = <SubscriptionIcon />;

const indexToCursorMapping = [
  "/",
  "/whatsHotDiscussions",
  "/subscriptions",
  "chatRooms"
];

function getCursorByindex(i) {
  return indexToCursorMapping[i];
}

const cursorToIndexMapping = indexToCursorMapping.reduce(
  (result, cursor, index) => {
    return { ...result, [cursor]: index };
  },
  {}
);

function getIndexByCursor(cursor) {
  return cursorToIndexMapping[cursor];
}

class AppBottomNavigation extends Component {
  static defaultProps = {
    style: { position: "fixed", bottom: 0, left: 0, zIndex: 100 },
    selectedIndex: 0
  };

  select = nextIndex => {
    if (this.props.onSelect) {
      this.props.onSelect(nextIndex, this.props.selectedIndex);
    }
  };

  render() {
    const { browser } = this.props;
    if (browser && !browser.lessThan.medium) {
      return null;
    } else {
      return (
        <div style={this.props.style}>
          <BottomNavigation
            selectedIndex={this.props.selectedIndex}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <BottomNavigationItem
              label="首頁"
              icon={actionHomeIcon}
              onClick={() => this.select(0)}
            />
            <BottomNavigationItem
              label="熱門討論"
              icon={whatsHotIcon}
              onClick={() => this.select(1)}
            />
            <BottomNavigationItem
              label="訂閱內容"
              icon={subscriptionIcon}
              onClick={() => this.select(2)}
            />
            <BottomNavigationItem
              label="聊天室"
              icon={chatIcon}
              onClick={() => this.select(3)}
            />
          </BottomNavigation>
        </div>
      );
    }
  }
}

export const AppBottomNavigationWithoutConnect = AppBottomNavigation;

import { setHistoryCursor, dirtyPushState } from "../../History/HistoryActions";
import { getCursor, getStackByCursor } from "../../History/HistoryReducer";
import { push } from "react-router-redux";

function mapStateToProps(state) {
  const { browser } = state;
  const selectedIndex = getIndexByCursor(getCursor(state)) || 0;
  const _history = state.history; // never pass to props ignore by mergeProps function.
  return { browser, selectedIndex, _history };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { _history, ...otherStateProps } = stateProps;
  const _getStackByCursor = cursor =>
    getStackByCursor({ history: _history }, cursor);
  const { dispatch } = dispatchProps;
  const onSelect = (nextIndex, currentIndex) => {
    if (nextIndex === currentIndex) {
      const cursor = getCursorByindex(currentIndex);
      const pathname = cursor;
      dispatch(push(pathname));
    } else {
      const cursor = getCursorByindex(nextIndex);
      const stack = _getStackByCursor(cursor);
      dispatch(setHistoryCursor(cursor));
      if (stack && stack.length > 0) {
        for (const l of stack) {
          l.state = l.state || {};
          l.state = { ...l.state, oriKey: l.key };
        }
        // FIXME
        // push to global history stack
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
    onSelect
  });
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
  AppBottomNavigation
);
