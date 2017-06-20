import React from 'react';
import PropTypes from 'prop-types';
import Immutable, {Map, OrderedSet} from 'immutable';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import CircularProgress from 'material-ui/CircularProgress';
import LazyLoad from 'react-lazyload';
import {shouldComponentUpdate} from 'react-immutable-render-mixin';
import memoize from 'fast-memoize';
import createFastMemoizeDefaultOptions from '../../util/createFastMemoizeDefaultOptions';

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectableList_ extends React.Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
      defaultValue: PropTypes.any.isRequired
    };

    componentWillMount() {
      this.setState({selectedIndex: this.props.defaultValue});
    }

    handleRequestChange = (event, index) => {
      this.setState({selectedIndex: index});
    };

    render() {
      return (
        <ComposedComponent value={this.state.selectedIndex} onChange={this.handleRequestChange}>
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

export class DefaultCircularProgress extends React.PureComponent {
  static defaultProps = {
    size: 48,
    thickness: 7,
    style: {
      margin: 0
    }
  };

  render() {
    return (<CircularProgress {...this.props}/>);
  }
}

export class LoadingListItem extends React.Component {
  static defaultProps = {
    onRequestLoadMore: undefined
  };

  componentDidMount() {
    if (this.props.onRequestLoadMore) {
      this
        .props
        .onRequestLoadMore(this);
    }
  }

  render() {
    const styles = {
      listItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderSizing: 'border-box'
      }
    };
    return (
      <ListItem disabled={true} style={styles.listItem}><DefaultCircularProgress/></ListItem>
    );
  }
}

export class CommonListItem extends ListItem {
  static defaultProps = {
    href: '',
    routerMethod: 'push',
    nestedItems: []
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  onTouchTap = (e) => {
    if (e.nativeEvent.which === 3) {
      return;
    }
    const {href, routerMethod} = this.props;
    if (href) {
      this.context.router[routerMethod](href);
      e.preventDefault();
    }
    if (this.props.onTouchTap) {
      this
        .props
        .onTouchTap(e);
    }
  }

  onClick = (e) => {
    e.preventDefault();
    if (this.props.onClick) {
      this
        .props
        .onClick(e);
    }
  }

  render() {
    const {
      href,
      routerMethod,
      ...other
    } = this.props;
    return (
      <ListItem {...other} href={href} onTouchTap={this.onTouchTap} onClick={this.onClick}>{this.props.children}</ListItem>
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
    onRequestLoadMore: () => {},
    enableLoadMore: true,
    enableSelectable: false,
    defaultValue: 0,
    listItemHref: () => '',
    listStyle: {
      // padding: 0
    },
    listItemRightIcon: () => {},
    listItemStyle: {},
    listItemRouterMethod: 'push',
    listItemLeftAvatar: () => {},
    listItemValue: (payload) => {
      return Map.isMap(payload)
        ? (payload.get('_id') || payload.get('name') || payload.get('title') || payload.hashCode())
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
    this.getListItems = memoize(this.getListItems.bind(this), createFastMemoizeDefaultOptions(3));
  }

  getListItemKeyByPayload = (payload) => {
    const _id = Map.isMap(payload)
      ? payload.get('_id') || Math.random()
      : Math.random();
    const updatedAt = Map.isMap(payload)
      ? payload.get('updatedAt') || ''
      : '';
    return `ListItem/${_id}${updatedAt}`;
  }

  getListItems(dataSource) {
    const listItems = dataSource.reduce((eles, payload, index) => {
      const dividerKey = `Divider/${index}`;
      return eles
        .add(this.customListItemRender(payload))
        .add(<Divider key={dividerKey}/>);
    },
      OrderedSet()
    );
    return listItems;
  }

  customListItemRender = (payload) => {
    if (this.props.customListItemRender) {
      return this
        .props
        .customListItemRender(payload, this);
    }
    const name = Map.isMap(payload)
      ? payload.get('name')
      : payload;
    const title = Map.isMap(payload)
      ? payload.get('title')
      : '';
    const href = this
      .props
      .listItemHref(payload, this);
    const key = this.getListItemKeyByPayload(payload);
    const text = title || name || '';
    const {listItemRouterMethod} = this.props;
    const leftAvatar = this
      .props
      .listItemLeftAvatar(payload, this);
    const secondaryText = this
      .props
      .listItemSecondaryText(payload, this);
    const rightIcon = this
      .props
      .listItemRightIcon(payload, this);
    const value = this
      .props
      .listItemValue(payload, this);
    return (
      <CommonListItem
        key={key}
        value={value}
        href={href}
        secondaryText={secondaryText}
        leftAvatar={leftAvatar}
        rightIcon={rightIcon}
        routerMethod={listItemRouterMethod}>{text}</CommonListItem>
    );
  }

  render() {
    const {dataSource, enableLoadMore, enableSelectable, onRequestLoadMore, defaultValue} = this.props;
    const listItems = this.getListItems(dataSource);
    const ListComponent = enableSelectable
      ? SelectableList
      : List;
    return (
      <ListComponent style={this.props.listStyle} defaultValue={defaultValue}>
        {listItems}
        {
          enableLoadMore
            ? (
              <LazyLoad height={80} overflow={true} unmountIfInvisible={true}><LoadingListItem onRequestLoadMore={onRequestLoadMore}/></LazyLoad>
            )
            : null
        }
        {
          (!enableLoadMore && dataSource.count() === 0)
            ? (
              <ListItem>沒有任何內容</ListItem>
            )
            : null
        }
      </ListComponent>
    );
  }
}

export default CommonList;
