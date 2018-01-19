import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Immutable, { Map, OrderedSet } from "immutable";
import { List, ListItem, makeSelectable } from "material-ui/List";
import MaterialDivider from "material-ui/Divider";
import CircularProgress from "material-ui/CircularProgress";
import LazyLoad from "react-lazyload";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import FlipMove from "react-flip-move";
import PullRefresh from "react-pullrefresh";
import Portal from "../Portal";
import NextList, {
  ListItem as NextListItem,
  ListItemText as NextListItemText
} from "material-ui-next/List";

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
      <ListItem {...other} href={href} onClick={this.onTouchTap}>
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
    const empty =
      !enableLoadMore && dataSource.count() === 0 ? (
        <ListItem key="empty" disabled={true}>
          沒有任何內容
        </ListItem>
      ) : null;
    const listItems = (
      <FlipMove
        typeName={null}
        getPosition={node => {
          const rect = (() => {
            if (node.getBoundingClientRect) {
              return node.getBoundingClientRect();
            } else {
              return ReactDOM.findDOMNode(node).getBoundingClientRect();
            }
          })();
          return rect;
        }}
      >
        {this.getListItems(dataSource)}
      </FlipMove>
    );
    const ListComponent = enableSelectable ? SelectableList : List;
    const listProps = {
      style: listStyle,
      defaultValue
    };
    let list = (
      <ListComponent key="list" {...listProps}>
        {listItems}
      </ListComponent>
    );
    list = (
      <PullRefresh
        key="list"
        zIndex={9999}
        as={React.Fragment}
        onRefresh={() => {
          alert("hello");
        }}
        render={(...args) => {
          return <Portal>{PullRefresh.defaultProps.render(...args)}</Portal>;
        }}
      >
        {list}
      </PullRefresh>
    );
    //     <NextList>
    //       {[...Array(3).keys()].map(i => {
    //         return (
    //           <NextListItem key={i} button>
    //             <NextListItemText primary="Drafts" />
    //           </NextListItem>
    //         );
    //       })}
    //     </NextList>
    const bottom = (
      <ListComponent key="foo" {...listProps}>
        {empty}
        {lazyLoadBottom}
        {/* {refreshIndicator} */}
      </ListComponent>
    );
    return (
      <React.Fragment>
        {list}
        {bottom}
      </React.Fragment>
    );
  }
}

export default CommonList;
