import React, { Component } from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { List, ListItem, makeSelectable } from "material-ui/List";
import Avatar from "material-ui/Avatar";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import { fromJS, Map, List as ImmutableList } from "immutable";
import pathToRootWikiGroupTree from "../utils/pathToRootWikiGroupTree";
import getRootWikiHref from "../utils/getRootWikiHref";
import getWikisHref from "../utils/getWikisHref";
import { Link } from "react-router";

function wrapState(ComposedComponent) {
  return class _SelectableList extends Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
      defaultValue: PropTypes.string.isRequired
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

let SelectableList = makeSelectable(List);

SelectableList = wrapState(SelectableList);

class LinkableListItem extends ListItem {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  _handleLinkClick = e => {
    if (this.props.to) {
      e.preventDefault();
      this.context.router.replace(this.props.to);
    }
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  };

  render() {
    const { to, ...other } = this.props;
    // FIX
    // add href to listitem, can't disable rightIconButon preventDefault.
    return <ListItem {...other} onClick={this._handleLinkClick} />;
  }
}

function defaultGetHrefFunc() {
  return "";
}

export function getRootWikiGroupTreeListItemsHelper2(
  rootWikiGroupTree,
  path = [],
  getHrefFunc = defaultGetHrefFunc
) {
  if (Map.isMap(rootWikiGroupTree)) {
    return rootWikiGroupTree
      .map((node, k) => {
        const finalPath = path.concat(k);
        const nestedItems = getRootWikiGroupTreeListItemsHelper2(
          node,
          finalPath,
          getHrefFunc
        );
        const href = getHrefFunc(pathToRootWikiGroupTree(finalPath, false));
        const value = href;
        return (
          <LinkableListItem
            to={href}
            value={value}
            key={value}
            primaryText={k}
            nestedItems={nestedItems}
          />
        );
      })
      .toList();
  } else if (ImmutableList.isList(rootWikiGroupTree)) {
    return rootWikiGroupTree.map(leaf => {
      const finalPath = path.concat(leaf);
      const href = getHrefFunc(pathToRootWikiGroupTree(finalPath, true));
      const value = href;
      return (
        <LinkableListItem
          to={href}
          value={value}
          key={value}
          primaryText={leaf}
        />
      );
    });
  } else {
    return null;
  }
}

export function getRootWikiGroupTreeListItems2(rootWikiGroupTree, getHrefFunc) {
  return getRootWikiGroupTreeListItemsHelper2(
    rootWikiGroupTree,
    undefined,
    getHrefFunc
  );
}

export function getRootWikiGroupTreeListItemsIter(
  rootWikiGroupTree,
  path = [],
  getHrefFunc = defaultGetHrefFunc
) {
  if (Map.isMap(rootWikiGroupTree)) {
    const name = rootWikiGroupTree.get("name");
    const children = rootWikiGroupTree.get("children");
    const finalPath = path.concat(name);
    const nestedItems = children
      ? getRootWikiGroupTreeListItemsIter(
          children,
          finalPath,
          getHrefFunc
        ).toJSON()
      : undefined;
    const href = getHrefFunc(pathToRootWikiGroupTree(finalPath));
    const value = href;
    return (
      <LinkableListItem
        to={href}
        value={value}
        key={value}
        primaryText={name}
        nestedItems={nestedItems}
      />
    );
  } else if (ImmutableList.isList(rootWikiGroupTree)) {
    return rootWikiGroupTree.map(node => {
      return getRootWikiGroupTreeListItemsIter(node, path, getHrefFunc);
    });
  } else {
    return null;
  }
}

export function getRootWikiGroupTreeListItems(rootWikiGroupTree, getHrefFunc) {
  return getRootWikiGroupTreeListItemsIter(
    rootWikiGroupTree,
    undefined,
    getHrefFunc
  ).toJSON();
}

class RootWikiGroupTreeList extends React.Component {
  static defaultProps = {
    rootWikiId: "",
    baseRootWikiGroupTree: null,
    queryRootWikiGroupTree: null,
    enableSelectable: true
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  getRootWikiHref = () => {
    const { rootWikiId } = this.props;
    return getRootWikiHref(rootWikiId);
  };

  getWikisHref = rootWikiGroupTree => {
    const prefix = this.getRootWikiHref();
    const wikisHref = getWikisHref(rootWikiGroupTree);
    return `${prefix}${wikisHref}`;
  };

  render() {
    const { rootWikiId } = this.props;
    if (!rootWikiId) {
      return <div>需要建立主維基</div>;
    }
    const rootWikiGroupTree = fromJS([
      {
        name: "裝備",
        children: [
          {
            name: "武器",
            children: [
              {
                name: "長劍"
              },
              {
                name: "斧"
              },
              {
                name: "槍"
              }
            ]
          },
          {
            name: "防具",
            children: [
              {
                name: "皮甲"
              },
              {
                name: "重甲"
              }
            ]
          }
        ]
      },
      {
        name: "卡片",
        children: [
          {
            name: "法師"
          },
          {
            name: "盜賊"
          }
        ]
      },
      {
        name: "深度測試(一)",
        children: [
          {
            name: "深度測試(二)",
            children: [
              {
                name: "深度測試(三)",
                children: [
                  {
                    name: "深度測試(四)",
                    children: [
                      {
                        name: "深度測試(五)",
                        children: [
                          {
                            name: "你看見我了!"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    const { enableSelectable } = this.props;
    const rootWikiGroupTreeListItems = getRootWikiGroupTreeListItems(
      rootWikiGroupTree,
      this.getWikisHref
    );
    let defaultValue;
    if (this.props.queryRootWikiGroupTree) {
      defaultValue = this.getWikisHref(this.props.queryRootWikiGroupTree);
    } else {
      defaultValue = this.getRootWikiHref();
    }
    const ListComponent = enableSelectable ? SelectableList : List;
    return (
      <div>
        <h2>(尚未完成)</h2>
        <ListComponent defaultValue={defaultValue}>
          <LinkableListItem
            to={this.getRootWikiHref()}
            value={this.getRootWikiHref()}
            primaryText="維基首頁"
            leftAvatar={<Avatar>主</Avatar>}
          />
          <LinkableListItem
            to={this.getWikisHref("all")}
            value={this.getWikisHref("all")}
            primaryText="全部"
            leftAvatar={<Avatar>全</Avatar>}
          />{" "}
          {rootWikiGroupTreeListItems}
          <LinkableListItem
            to={this.getWikisHref("null")}
            value={this.getWikisHref("null")}
            primaryText="未分類"
            leftAvatar={<Avatar>未</Avatar>}
          />
        </ListComponent>
      </div>
    );
  }
}

export default RootWikiGroupTreeList;
