import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import car from "lodash/first";
import cdr from "lodash/tail";
import { Set, List as ImmutableList } from "immutable";
import memoize from "fast-memoize";
import moment from "moment";
import { Link } from "react-router-dom";

import List from "../../../components/List/EnhancedList";
import { ListItem, ListItemText } from "material-ui-next/List";
import Avatar from "material-ui-next/Avatar";
import WikiIcon from "material-ui-icons-next/ImportContacts";

import { fetchWikis } from "../WikiActions";
import { getWikisByRootWikiId } from "../WikiReducer";
import createFastMemoizeDefaultOptions from "../../../util/createFastMemoizeDefaultOptions";

class WikiList extends React.Component {
  static propTypes = {
    rootWikiId: PropTypes.string,
    rootWikiGroupTree: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]),
    dataSource: PropTypes.object
  };

  static defaultProps = {
    rootWikiId: "",
    rootWikiGroupTree: "all",
    dataSource: Set()
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const limit = props.limit || 10;
    const page = props.page || 1;
    this.state = {
      page,
      limit,
      sort: "-updatedAt"
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rootWikiGroupTree !== this.props.rootWikiGroupTree) {
      this.setState({
        page: 1
      });
    }
    if (nextProps.dataSource.count() === 0) {
      this.handleRequestMore({ reason: "sync" });
    }
  }

  handleRequestMore = ({ direction, reason }) => {
    const { rootWikiId, rootWikiGroupTree } = this.props;
    if (rootWikiId) {
      const { page, limit, sort } = this.state;
      let nextPage;
      if (reason === "pullRefresh") {
        nextPage = 1;
      } else if (reason === "sync") {
        nextPage = page;
      } else {
        if (direction === "bottom") {
          nextPage = page + 1;
        } else if (direction === "top") {
          nextPage = page - 1 > 0 ? page - 1 : 1;
        } else {
          nextPage = page;
        }
      }
      return this.props
        .dispatch(
          fetchWikis(rootWikiId, {
            page: nextPage,
            limit,
            sort,
            rootWikiGroupTree
          })
        )
        .then(wikisJSON => {
          if (wikisJSON.length >= limit) {
            this.setState({ page: nextPage });
          }
        });
    } else {
      return Promise.resolve(null);
    }
  };

  sortBy = payload => {
    return -1 * new Date(payload.get("updatedAt")).getTime();
  };

  listItemHref = wiki => {
    const { _id, rootWiki, name } = wiki;
    if (rootWiki && name) {
      return `/rootWikis/${rootWiki}/wikis/${encodeURIComponent(name)}`;
    } else {
      return `/wikis/${_id}`;
    }
  };

  listItemSecondaryText = payload => {
    const fromNowTime = moment(payload.get("updatedAt")).fromNow();
    return `${fromNowTime}(顯示分類訊息...)`;
  };

  listItemLeftAvatar = payload => {
    return (
      <Avatar>
        <WikiIcon />
      </Avatar>
    );
  };

  render() {
    let { dataSource } = this.props;
    dataSource = dataSource.sortBy(this.sortBy);
    return (
      <List onRequestMore={this.handleRequestMore}>
        {dataSource.map(wiki => {
          const name = wiki.get("name");
          const avatar = this.listItemLeftAvatar(wiki);
          const to = this.listItemHref(wiki);
          const key = wiki.get("_id");
          return (
            <ListItem key={key} button component={Link} to={to}>
              {avatar}
              <ListItemText primary={name} />
            </ListItem>
          );
        })}
      </List>
    );
  }
}

function treeWeakHasIn(tree, path = []) {
  if (path.length === 1) {
    return tree.some(node => {
      return node.get("name") === car(path);
    });
  } else if (path.length > 0) {
    return tree.some(node => {
      const isFound = node.get("name") === car(path);
      const children = node.get("children");
      if (children && isFound) {
        return treeWeakHasIn(children, cdr(path));
      }
      return isFound;
    });
  } else {
    return false;
  }
}

function weakEqualIter(tree, queryTree, path = []) {
  return queryTree.every(node => {
    const name = node.get("name");
    const children = node.get("children");
    const isLeaf = !children;
    if (isLeaf) {
      return treeWeakHasIn(tree, path.concat(name));
    } else {
      return weakEqualIter(tree, children, path.concat(name));
    }
  });
}

// if queryTree have path in tree return true.
function weakEqual(tree, queryTree) {
  return weakEqualIter(tree, queryTree, []);
}

const filterByRootWikiGroupTree = memoize((wikis, queryRootWikiGroupTree) => {
  return wikis.filter(wiki => {
    const rootWikiGroupTree = wiki.get("rootWikiGroupTree");
    if (queryRootWikiGroupTree === "all") {
      return true;
    } else if (queryRootWikiGroupTree === "null") {
      return (
        rootWikiGroupTree === null ||
        rootWikiGroupTree === undefined ||
        rootWikiGroupTree === "null"
      );
    } else if (
      ImmutableList.isList(rootWikiGroupTree) &&
      ImmutableList.isList(queryRootWikiGroupTree)
    ) {
      return weakEqual(rootWikiGroupTree, queryRootWikiGroupTree);
    } else {
      return false;
    }
  });
}, createFastMemoizeDefaultOptions(3));

function mapStateToProps(store, props) {
  const { rootWikiId, rootWikiGroupTree } = props;
  const dataSource = rootWikiId
    ? getWikisByRootWikiId(store, rootWikiId)
    : Set();
  const filtedDataSource = filterByRootWikiGroupTree(
    dataSource,
    rootWikiGroupTree
  );
  return { rootWikiId, rootWikiGroupTree, dataSource: filtedDataSource };
}

export default connect(mapStateToProps)(WikiList);
