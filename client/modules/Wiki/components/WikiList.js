import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import car from "lodash/first";
import cdr from "lodash/tail";
import { Set, List } from "immutable";
import memoize from "fast-memoize";
import moment from "moment";

import Avatar from "material-ui/Avatar";
import WikiIcon from "material-ui/svg-icons/communication/import-contacts";

import CommonList from "../../../components/List/CommonList";
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
      sort: "-updatedAt",
      enableLoadMore: true
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource.count() === 0) {
      this.onRequestLoadMore();
    }
  }

  onRequestLoadMore = () => {
    const { page, limit, sort } = this.state;
    const { rootWikiId, rootWikiGroupTree } = this.props;
    if (rootWikiId) {
      const nextPage = page + 1;
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
          if (wikisJSON.length < limit) {
            this.setState({ enableLoadMore: false });
          } else {
            this.setState({ page: nextPage });
          }
        })
        .catch(() => {
          this.setState({ enableLoadMore: false });
        });
    } else {
      return undefined;
    }
  };

  sortBy = payload => {
    return -1 * new Date(payload.get("updatedAt")).getTime();
  };

  listItemHref = payload => {
    return `/wikis/${payload.get("_id")}`;
  };

  listItemSecondaryText = payload => {
    const fromNowTime = moment(payload.get("updatedAt")).fromNow();
    return `${fromNowTime}(應該還要顯示分類訊息)`;
  };

  listItemLeftAvatar = payload => {
    return <Avatar icon={<WikiIcon />} />;
  };

  render() {
    const { enableLoadMore } = this.state;
    let { dataSource } = this.props;
    dataSource = dataSource.sortBy(this.sortBy);
    return (
      <CommonList
        dataSource={dataSource}
        enableLoadMore={enableLoadMore}
        enableRefreshIndicator={true}
        listItemHref={this.listItemHref}
        listItemSecondaryText={this.listItemSecondaryText}
        listItemLeftAvatar={this.listItemLeftAvatar}
        onRequestLoadMore={this.onRequestLoadMore}
      />
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
      List.isList(rootWikiGroupTree) &&
      List.isList(queryRootWikiGroupTree)
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
