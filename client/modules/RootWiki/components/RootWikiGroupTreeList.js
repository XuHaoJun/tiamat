import * as React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Link } from "react-router-dom";
import { fromJS, Map, List as ImmutableList } from "immutable";

import { withState } from "recompose";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";

import pathToRootWikiGroupTree from "../utils/pathToRootWikiGroupTree";
import getRootWikiHref from "../utils/getRootWikiHref";
import getWikisHref from "../utils/getWikisHref";

function defaultGetHrefFunc() {
  return "";
}

export function getRootWikiGroupTreeListItemsIter(
  rootWikiGroupTree,
  queryRootWikiGroupTree,
  getHrefFunc = defaultGetHrefFunc,
  path = [],
  depth = 0,
  base = Map()
) {
  if (Map.isMap(rootWikiGroupTree)) {
    const name = rootWikiGroupTree.get("name");
    const children = rootWikiGroupTree.get("children");
    const finalPath = path.concat(name);
    const nestedItems = children
      ? getRootWikiGroupTreeListItemsIter(
          children,
          queryRootWikiGroupTree,
          getHrefFunc,
          finalPath,
          depth + 1,
          base
        ).toJS()
      : null;
    const href = getHrefFunc(pathToRootWikiGroupTree(finalPath));
    const value = href;
    const enhance = withState("open", "setOpen", false);
    const Items = enhance(({ open, setOpen }) => {
      return (
        <React.Fragment>
          <ListItem
            button
            component={Link}
            replace={true}
            to={href}
            style={{ paddingLeft: 12 * depth + 5 }}
          >
            <ListItemText primary={name} />
            {nestedItems ? (
              <ListItemSecondaryAction
                onClick={() => {
                  setOpen(o => !o);
                }}
              >
                <IconButton>
                  {open ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </ListItemSecondaryAction>
            ) : null}
          </ListItem>
          {nestedItems ? (
            <Collapse component="li" in={open} timeout="auto" unmountOnExit>
              <List disablePadding>{nestedItems}</List>
            </Collapse>
          ) : null}
        </React.Fragment>
      );
    });
    return <Items key={value} />;
  } else if (ImmutableList.isList(rootWikiGroupTree)) {
    return rootWikiGroupTree.map(node => {
      return getRootWikiGroupTreeListItemsIter(
        node,
        queryRootWikiGroupTree,
        getHrefFunc,
        path,
        depth,
        base
      );
    });
  } else {
    return null;
  }
}

export function getRootWikiGroupTreeListItems(
  rootWikiGroupTree,
  queryRootWikiGroupTree,
  getHrefFunc
) {
  return getRootWikiGroupTreeListItemsIter(
    rootWikiGroupTree,
    queryRootWikiGroupTree,
    getHrefFunc,
    [],
    0,
    rootWikiGroupTree
  ).toJS();
}

const _rootWikiGroupTree = fromJS([
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
                name: "你看見我了!"
              }
            ]
          }
        ]
      }
    ]
  }
]);

class RootWikiGroupTreeList extends React.Component {
  static defaultProps = {
    baseRootWikiGroupTree: _rootWikiGroupTree
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
    const { baseRootWikiGroupTree, queryRootWikiGroupTree } = this.props;
    const rootWikiGroupTreeListItems = getRootWikiGroupTreeListItems(
      baseRootWikiGroupTree,
      queryRootWikiGroupTree,
      this.getWikisHref
    );
    return (
      <div>
        <h2>(尚未完成)</h2>
        <List>
          <ListItem
            button
            component={Link}
            replace={true}
            to={this.getRootWikiHref()}
            value={this.getRootWikiHref()}
          >
            <Avatar>主</Avatar>
            <ListItemText primary="維基首頁" />
          </ListItem>
          <ListItem
            button
            component={Link}
            replace={true}
            to={this.getWikisHref("all")}
            value={this.getWikisHref("all")}
          >
            <Avatar>全</Avatar>
            <ListItemText primary="全部" />
          </ListItem>
          {rootWikiGroupTreeListItems}
          <ListItem
            button
            component={Link}
            replace={true}
            to={this.getWikisHref("null")}
            value={this.getWikisHref("null")}
          >
            <Avatar>未</Avatar>
            <ListItemText primary="未分類" />
          </ListItem>
        </List>
      </div>
    );
  }
}

export default RootWikiGroupTreeList;
