import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Immutable, { Map, OrderedSet } from "immutable";
import { List, ListItem, makeSelectable } from "material-ui/List";
import MaterialDivider from "material-ui/Divider";
import CircularProgress from "material-ui/CircularProgress";
import LazyLoad from "react-lazyload";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import memoize from "fast-memoize";
import createFastMemoizeDefaultOptions from "../../util/createFastMemoizeDefaultOptions";
import FlipMove from "react-flip-move";
import RefreshIndicator from "material-ui/RefreshIndicator";

import Debug from "debug";

const debug = Debug("app:CommonList");

// FlipMove need non-stateless compoent,
// but material-ui divider is stateless functional component.
class Divider extends React.Component {
  render() {
    return <MaterialDivider {...this.props} />;
  }
}

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList_ extends React.Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
      defaultValue: PropTypes.any.isRequired
    };

    componentWillMount() {
      this.setState({ selectedIndex: this.props.defaultValue });
    }

    handleRequestChange = (event, index) => {
      this.setState({ selectedIndex: index });
    };

    render() {
      return (
        <ComposedComponent
          value={this.state.selectedIndex}
          onChange={this.handleRequestChange}
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

export class DefaultCircularProgress extends React.PureComponent {
  static defaultProps = {
    size: 32,
    thickness: 6,
    style: {
      margin: 0
    }
  };

  render() {
    // FIXME
    // Progress Indicators Animation
    // https://github.com/callemall/material-ui/issues/5252
    return <CircularProgress {...this.props} />;
    // return "Loading...";
  }
}

export class LoadingListItem extends ListItem {
  static propTypes = {
    onRequestLoadMore: PropTypes.func,
    direction: PropTypes.oneOf(["bottom", "top"])
  };

  static defaultProps = {
    onRequestLoadMore: undefined,
    direction: "bottom"
  };

  componentDidMount() {
    if (this.props.onRequestLoadMore) {
      debug("componentDidMount");
      const { direction } = this.props;
      this.props.onRequestLoadMore(direction, this);
    }
  }

  render() {
    const styles = {
      listItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderSizing: "border-box"
      }
    };
    return (
      <ListItem style={styles.listItem}>
        <DefaultCircularProgress />
      </ListItem>
    );
  }
}

class RefreshIndicatorListItem extends ListItem {
  state = {
    status: "ready"
  };

  timeouts = [];

  componentWillUnmount() {
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
  }

  handleClick = e => {
    if (this.props.onRequestLoadMore) {
      e.preventDefault();
      this.setState({ status: "loading" });
      const p = this.props.onRequestLoadMore("bottom");
      if (p && p.then) {
        p.then(() => {
          const t = setTimeout(() => {
            this.setState({ status: "ready" });
          }, 500);
          this.timeouts.push(t);
        });
      } else {
        const t = setTimeout(() => {
          this.setState({ status: "ready" });
        }, 3000);
        this.timeouts.push(t);
      }
    }
  };

  render() {
    const { status } = this.state;
    return (
      <ListItem
        disabled={true}
        style={{ display: "flex", justifyContent: "center" }}
      >
        <RefreshIndicator
          onClick={this.handleClick}
          percentage={100}
          size={60}
          left={0}
          top={0}
          status={status}
          zDepth={0}
        />
      </ListItem>
    );
  }
}

export class CommonListItem extends ListItem {
  static defaultProps = {
    href: "",
    routerMethod: "push",
    nestedItems: []
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  onTouchTap = e => {
    // if (e.nativeEvent.which === 3) {
    //   return;
    // }
    const { href, routerMethod } = this.props;
    if (href) {
      this.context.router[routerMethod](href);
      e.preventDefault();
    }
    // if (this.props.onTouchTap) {
    //   this.props.onTouchTap(e);
    // }
    // FIX
    // Due to material-ui turn onTouchTap to onClick, not prepare migrate to onClick.
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  };

  onClick = e => {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  };

  render() {
    const { href, routerMethod, ...other } = this.props;
    return (
      <ListItem
        {...other}
        href={href}
        // onTouchTap={this.onTouchTap}
        onClick={this.onTouchTap}
      >
        {this.props.children}
      </ListItem>
    );
  }
}

class CommonList extends React.Component {
  static propTypes = {
    dataSource: PropTypes.object,
    customListItemRender: PropTypes.func,
    onRequestLoadMore: PropTypes.func,
    enableLoadMore: PropTypes.bool,
    enableSelectable: PropTypes.bool,
    enableRefreshIndicator: PropTypes.bool,
    defaultValue: PropTypes.any,
    listItemHref: PropTypes.func,
    listItemRouterMethod: PropTypes.string,
    listItemLeftAvatar: PropTypes.func,
    listItemSecondaryText: PropTypes.func,
    listItemValue: PropTypes.func
  };

  static defaultProps = {
    dataSource: Immutable.List(),
    customListItemRender: null,
    onRequestLoadMore: () => {},
    enableLoadMore: true,
    enableSelectable: false,
    enableRefreshIndicator: false,
    defaultValue: 0,
    listItemHref: () => "",
    listStyle: {
      // padding: 0
    },
    listItemRightIcon: () => {},
    listItemStyle: {},
    listItemRouterMethod: "push",
    listItemLeftAvatar: () => {},
    listItemValue: payload => {
      return Map.isMap(payload)
        ? payload.get("_id") ||
            payload.get("name") ||
            payload.get("title") ||
            payload.hashCode()
        : payload;
    },
    listItemSecondaryText: () => {}
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.getListItems = memoize(
      this.getListItems.bind(this),
      createFastMemoizeDefaultOptions(2)
    );
  }

  getListItemKeyByPayload = payload => {
    const _id = Map.isMap(payload)
      ? payload.get("_id") || Math.random()
      : Math.random();
    const updatedAt = Map.isMap(payload) ? payload.get("updatedAt") || "" : "";
    return `ListItem/${_id}/${updatedAt}`;
  };

  getListItems(dataSource) {
    const listItems = dataSource.reduce((eles, payload, index) => {
      const dividerKey = `Divider/${index}`;
      return eles
        .add(this.customListItemRender(payload))
        .add(<Divider key={dividerKey} />);
    }, OrderedSet());
    return listItems;
  }

  customListItemRender = payload => {
    if (this.props.customListItemRender) {
      return this.props.customListItemRender(payload, this);
    }
    const name = Map.isMap(payload) ? payload.get("name") : payload;
    const title = Map.isMap(payload) ? payload.get("title") : "";
    const href = this.props.listItemHref(payload, this);
    const key = this.getListItemKeyByPayload(payload);
    const text = title || name || "";
    const { listItemRouterMethod } = this.props;
    const leftAvatar = this.props.listItemLeftAvatar(payload, this);
    const secondaryText = this.props.listItemSecondaryText(payload, this);
    const rightIcon = this.props.listItemRightIcon(payload, this);
    const value = this.props.listItemValue(payload, this);
    return (
      <CommonListItem
        key={key}
        value={value}
        href={href}
        secondaryText={secondaryText}
        leftAvatar={leftAvatar}
        rightIcon={rightIcon}
        routerMethod={listItemRouterMethod}
      >
        {text}
      </CommonListItem>
    );
  };

  render() {
    const {
      dataSource,
      enableLoadMore,
      enableSelectable,
      enableRefreshIndicator,
      onRequestLoadMore,
      defaultValue,
      listStyle
    } = this.props;
    const lazyLoadBottom = enableLoadMore ? (
      <LazyLoad
        key="loader"
        offset={72}
        height={72}
        overflow={true}
        unmountIfInvisible={true}
      >
        <LoadingListItem
          key="loading"
          onRequestLoadMore={onRequestLoadMore}
          direction="bottom"
        />
      </LazyLoad>
    ) : null;
    // const refreshIndicator =
    //   enableRefreshIndicator && !enableLoadMore ? (
    //     <RefreshIndicatorListItem
    //       key="refresh-more"
    //       onRequestLoadMore={onRequestLoadMore}
    //       direction="bottom"
    //     />
    //   ) : null;
    const empty =
      !enableLoadMore && dataSource.count() === 0 ? (
        <ListItem key="empty" disabled={true}>
          沒有任何內容
        </ListItem>
      ) : null;
    const listItems = this.getListItems(dataSource);
    const ListComponent = enableSelectable ? SelectableList : List;
    const listProps = {
      style: listStyle,
      defaultValue
    };
    const flipMoveProps = {
      typeName: ListComponent,
      getPosition: node => {
        const rect = (() => {
          if (node.getBoundingClientRect) {
            return node.getBoundingClientRect();
          } else {
            return ReactDOM.findDOMNode(node).getBoundingClientRect();
          }
        })();
        return rect;
      }
    };
    const list = (
      <FlipMove key="list" {...flipMoveProps} {...listProps}>
        {listItems}
      </FlipMove>
    );
    const bottom = (
      <ListComponent key="foo" {...listProps}>
        {empty}
        {lazyLoadBottom}
        {/* {refreshIndicator} */}
      </ListComponent>
    );
    return [list, bottom];
  }
}

export default CommonList;
