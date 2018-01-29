import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import _clone from "lodash/clone";

import ScrollContainer from "../ScrollContainer";

import PullRefresh, { Indicator } from "@xuhaojun/react-pullrefresh";

import Portal from "material-ui-next/Portal";
import pure from "recompose/pure";

import FlipMove from "@xuhaojun/react-flip-move";

import { CircularProgress } from "material-ui-next/Progress";
import LazyLoad from "react-lazyload";

import compose from "recompose/compose";
import List, { ListItem, ListItemText } from "material-ui-next/List";

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

const PureIndicator = pure(Indicator);

const PortalIndicator = props => {
  const { y, yRefreshing } = props;
  if (y === 0 && yRefreshing === 0) {
    return null;
  } else {
    return (
      <Portal>
        <PureIndicator {...props} />
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

    static defaultProps = {
      onRequestMore: null
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
      const _pullRefreshProps = Object.assign(
        {
          wraperComponent: null,
          onRefresh: this.handleRefresh,
          IndicatorComponent: PortalIndicator,
          disableMouse: true,
          zIndex: 9999,
          color: "#3F51B5"
        },
        _clone(pullRefreshProps) || {},
        { component: Component }
      );
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

class LoadingListItem extends React.Component {
  static defaultProps = {
    enableMountRequestMore: true
  };

  state = {
    loading: false
  };

  componentDidMount() {
    if (this.props.enableMountRequestMore) {
      this.handleRequestMore();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.type !== nextProps.type && !this.state.loading) {
      this.handleRequestMore();
    }
  }

  handleRequestMore = () => {
    if (this.props.onRequestMore) {
      this.setState({ loading: true }, () => {
        const reason = "lazyLoad";
        const event = { reason, direction: "bottom" };
        const p = this.props.onRequestMore(event, reason);
        if (p.then) {
          p.then(() => {
            this.setState({ loading: false });
          });
        } else {
          this.setState({ loading: false });
        }
      });
    } else {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading } = this.state;
    const progressSize = 32;
    return (
      <ListItem button onClick={this.handleRequestMore} disabled={loading}>
        {loading ? (
          <CircularProgress size={progressSize} />
        ) : (
          <CircularProgress
            color="primary"
            size={progressSize}
            mode="determinate"
            value={20}
            min={0}
            max={100}
          />
        )}
        <ListItemText primary="Load More..." />
      </ListItem>
    );
  }
}

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
      onRequestMore: null,
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
            offset={30}
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

function ScrollContainerHoc(Component) {
  return class _ScrollContainerHoc extends React.Component {
    static propTypes = Component.propTypes;

    render() {
      const { id } = this.props;
      if (typeof id === "string" && id !== "") {
        return (
          <ScrollContainer scrollKey={id}>
            <Component {...this.props} />
          </ScrollContainer>
        );
      } else {
        return <Component {...this.props} />;
      }
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
