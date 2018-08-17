import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import _throttle from "lodash/throttle";

import ScrollContainerHoc from "../ScrollContainer/ScrollContainerHoc";

import PullRefresh, { Indicator } from "@xuhaojun/react-pullrefresh";

import Portal from "@material-ui/core/Portal";

import FlipMove from "react-flip-move";

import CircularProgress from "@material-ui/core/CircularProgress";
import RefreshIcon from "@material-ui/icons/Refresh";
import LazyLoad from "react-lazyload";

import compose from "recompose/compose";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { connect } from "react-redux";
import { getIsFirstRender } from "../../modules/MyApp/MyAppReducer";

function hasPropType(Component, name) {
  const ctype = typeof Component;
  if (ctype === "string") {
    return false;
  }
  if (ctype !== "function" || typeof name !== "string") {
    throw new Error("hasPropType require Component or name");
  } else {
    if (
      typeof Component.propTypes === "object" &&
      Component.propTypes !== null
    ) {
      return Object.prototype.hasOwnProperty.call(Component.propTypes, name);
    } else {
      return false;
    }
  }
}

const PortalIndicator = props => {
  const { y, yRefreshing } = props;
  if (y === 0 && yRefreshing === 0) {
    return null;
  } else {
    return (
      <Portal>
        <Indicator {...props} />
      </Portal>
    );
  }
};

function PullRefreshHoc(Component) {
  return class _PullRefreshHoc extends React.Component {
    static propTypes = {
      ...Component.propTypes,
      onRequestMore: PropTypes.func
    };

    handleRefresh = () => {
      if (this.props.onRequestMore) {
        const reason = "pullRefresh";
        const event = { reason, direction: "top" };
        return this.props.onRequestMore(event, reason);
      } else {
        return Promise.resolve(null);
      }
    };

    render() {
      const { pullRefreshProps, children, ...other } = this.props;
      if (!hasPropType(Component, "onRequestMore")) {
        delete other.onRequestMore;
      }
      const _pullRefreshProps = {
        wraperComponent: null,
        onRefresh: this.handleRefresh,
        IndicatorComponent: PortalIndicator,
        disableMouse: true,
        zIndex: 9999,
        color: "#3F51B5",
        ...pullRefreshProps,
        component: Component
      };
      return (
        <PullRefresh pullRefreshProps={_pullRefreshProps} {...other}>
          {children}
        </PullRefresh>
      );
    }
  };
}

const handleFlipPosition = node => {
  if (node.getBoundingClientRect) {
    return node.getBoundingClientRect();
  } else {
    return ReactDOM.findDOMNode(node).getBoundingClientRect();
  }
};

function FlipMoveHoc(Component) {
  return class _FlipMoveHoc extends React.Component {
    static propTypes = {
      ...Component.propTypes,
      flipMoveProps: PropTypes.object
    };

    static defaultProps = {
      flipMoveProps: {}
    };

    render() {
      const { children, flipMoveProps, ...other } = this.props;
      return (
        <Component {...other}>
          <FlipMove
            typeName={null}
            getPosition={handleFlipPosition}
            enterAnimation="fade"
            leaveAnimation="fade"
            {...flipMoveProps}
          >
            {children}
          </FlipMove>
        </Component>
      );
    }
  };
}

class LoadingListItemBase extends React.Component {
  static defaultProps = {
    enableMountRequestMore: true,
    throttle: 250
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.handleRequestMore = _throttle(this._handleRequestMore, props.throttle);
  }

  componentDidMount() {
    if (this.props.enableMountRequestMore && !this.props.isFirstRender) {
      this.handleRequestMore();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.type !== nextProps.type &&
      !this.state.loading &&
      !nextProps.isFirstRender
    ) {
      this.handleRequestMore();
    }
  }

  componentWillUnmount() {
    this.handleRequestMore.cancel();
  }

  _handleRequestMore = () => {
    if (this.props.onRequestMore) {
      this.setState({ loading: true }, () => {
        const reason = "lazyLoad";
        const event = { reason, direction: "bottom" };
        const p = this.props.onRequestMore(event, reason);
        if (p.then && p.finally) {
          p.finally(() => {
            this.setState({ loading: false });
          });
        } else {
          this.setState({ loading: false });
        }
      });
    }
  };

  LeftIcon = () => {
    const { loading } = this.state;
    if (loading) {
      return <CircularProgress size={16} />;
    } else {
      return <RefreshIcon />;
    }
  };

  render() {
    const { loading } = this.state;
    const { LeftIcon } = this;
    return (
      <ListItem button onClick={this.handleRequestMore} disabled={loading}>
        <LeftIcon />
        <ListItemText primary="Load More..." />
      </ListItem>
    );
  }
}

const LoadingListItem = connect(state => {
  return { isFirstRender: getIsFirstRender(state) };
})(LoadingListItemBase);

// TODO
// append lazyload to children?
function BottomLazyLoadHoc(Component) {
  return class _BottomLazyLoadHoc extends React.Component {
    static propTypes = {
      ...Component.propTypes,
      onRequestMore: PropTypes.func,
      bottomLazyLoadProps: PropTypes.object
    };

    static defaultProps = {
      bottomLazyLoadProps: {}
    };

    render() {
      const { children, bottomLazyLoadProps, ...other } = this.props;
      if (!hasPropType(Component, "onRequestMore")) {
        delete other.onRequestMore;
      }
      const { onRequestMore } = this.props;
      return (
        <Component {...other}>
          {children}
          <LazyLoad
            key="BottomLazyLoad"
            height={30}
            overflow={true}
            unmountIfInvisible={true}
            placeholder={
              <LoadingListItem
                type="placeholder"
                enableMountRequestMore={false}
                onRequestMore={onRequestMore}
              />
            }
            {...bottomLazyLoadProps}
          >
            <LoadingListItem type="instance" onRequestMore={onRequestMore} />
          </LazyLoad>
        </Component>
      );
    }
  };
}

const enhance = compose(
  ScrollContainerHoc,
  BottomLazyLoadHoc,
  FlipMoveHoc,
  PullRefreshHoc
);

const EnhancedList = enhance(List);

export {
  EnhancedList as default,
  enhance,
  ScrollContainerHoc,
  FlipMoveHoc,
  BottomLazyLoadHoc,
  PullRefreshHoc
};
