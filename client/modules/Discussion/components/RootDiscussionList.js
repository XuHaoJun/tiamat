import React from "react";
import PropTypes from "prop-types";
import { Set, is, fromJS } from "immutable";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import moment from "moment";
import { Link } from "react-router-dom";

import compose from "recompose/compose";
import { withStyles } from "material-ui-next/styles";
import List from "../../../components/List/EnhancedList";
import { ListItem, ListItemText, ListItemAvatar } from "material-ui-next/List";

import UserAvatar from "../../User/components/UserAvatar";

import { fetchRootDiscussions } from "../DiscussionActions";
import { getRootDiscussions } from "../DiscussionReducer";
import { getIsFirstRender } from "../../MyApp/MyAppReducer";

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    height: "100%",
    overflow: "auto"
  }
});

class RootDiscussionList extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string,
    dataSource: PropTypes.object,
    isFirstRender: PropTypes.bool
  };

  static defaultProps = {
    forumBoardId: undefined,
    dataSource: Set(),
    isFirstRender: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const pageInfo = this.makePageInfo();
    const pageTable = fromJS({}).merge(pageInfo);
    this.state = {
      pageTable,
      sort: "-updatedAt"
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.forumBoardGroup !== nextProps.forumBoardGroup) {
      const nextPageTable = this.state.pageTable.merge(
        this.makePageInfo(nextProps, { page: 1 })
      );
      this.setState({ pageTable: nextPageTable }, () => {
        this.handleRequestMore("top");
      });
    }
  }

  getForumBoardGroup = (props = this.props) => {
    return props.getForumBoardGroup || "_all";
  };

  handleRequestMore = async ({ direction }) => {
    const { pageTable, sort } = this.state;
    const { forumBoardId, forumBoardGroup } = this.props;
    const pageInfo = pageTable.get(this.getForumBoardGroup());
    const { page, limit } = pageInfo;
    if (!forumBoardId) {
      return Promise.resolve(null);
    }
    const nextPage = direction === "bottom" ? page + 1 : 1;
    const prevDataSource = this.props.dataSource;
    // TODO
    // cancel fetch when componemntWillUnmount
    const discussionsJSON = await this.props.dispatch(
      fetchRootDiscussions(forumBoardId, {
        page: nextPage,
        limit,
        sort,
        forumBoardGroup
      })
    );
    const currentDataSource = this.props.dataSource;
    if (
      discussionsJSON.length < limit ||
      prevDataSource.count() === currentDataSource.count() ||
      is(prevDataSource, currentDataSource)
    ) {
      return null;
    } else {
      const currentPageTable = this.state.pageTable;
      const nextPageInfo = currentPageTable.get(
        pageInfo.get("forumBoardGroup")
      );
      const nextPageTable = pageTable.set(
        nextPageInfo.get("forumBoardGroup"),
        nextPageInfo.set("page", nextPageInfo.get("page") + 1)
      );
      this.setState({ pageTable: nextPageTable });
      return null;
    }
  };

  makePageInfo = (props = this.props) => {
    const { dataSource } = props;
    const forumBoardGroup = this.getForumBoardGroup(props);
    const limit = props.limit || 10;
    const page = props.page || Math.floor(dataSource.count() / limit) || 1;
    return fromJS({
      [forumBoardGroup]: {
        forumBoardGroup,
        limit,
        page
      }
    });
  };

  sortBy = payload => {
    return -1 * new Date(payload.get("updatedAt")).getTime();
  };

  listItemHref = payload => {
    return `/rootDiscussions/${payload.get("_id")}`;
  };

  listItemSecondaryText = discussion => {
    const { isFirstRender } = this.props;
    const fromNowTime = isFirstRender
      ? moment(discussion.get("updatedAt")).format("ll")
      : moment(discussion.get("updatedAt")).fromNow();
    const descendantCount = discussion.get("descendantCount") || 0;
    const Delimeter = () => <span style={{ margin: "0 4px" }}>•</span>;
    const authorBasicInfo = discussion.get("authorBasicInfo");
    const displayName = authorBasicInfo
      ? authorBasicInfo.get("displayName")
      : "Guest";
    return (
      <span>
        {displayName}
        <Delimeter />
        {`${fromNowTime}`}
        <Delimeter />
        {`${descendantCount}`}
        <span style={{ marginLeft: 4 }}>留言</span>
      </span>
    );
  };

  listItemLeftAvatar = discussion => {
    const authorBasicInfo = discussion.get("authorBasicInfo");
    return <UserAvatar user={authorBasicInfo} />;
  };

  render() {
    const { id, forumBoardId, forumBoardGroup } = this.props;
    if (!forumBoardId) {
      return <div>Loading...</div>;
    }
    let { dataSource } = this.props;
    if (forumBoardGroup) {
      dataSource = dataSource.filter(discussion => {
        return discussion.get("forumBoardGroup") === forumBoardGroup;
      });
    }
    dataSource = dataSource.sortBy(this.sortBy);
    const listId = this.props.id || "default";
    const { classes, isFirstRender } = this.props;
    return (
      <List
        id={id ? `${id}/List` : undefined}
        onRequestMore={this.handleRequestMore}
        className={classes.root}
      >
        {dataSource.map(discussion => {
          const key = `RootDiscussionList/${listId}/${discussion.get(
            "_id"
          )}/${String(isFirstRender)}`;
          const to = this.listItemHref(discussion);
          const avatar = this.listItemLeftAvatar(discussion);
          const primary = discussion.get("title");
          const secondary = this.listItemSecondaryText(discussion);
          return (
            <ListItem key={key} button component={Link} to={to} divider>
              <ListItemAvatar>{avatar}</ListItemAvatar>
              <ListItemText primary={primary} secondary={secondary} />
            </ListItem>
          );
        })}
      </List>
    );
  }
}

function mapStateToProps(store, props) {
  const { forumBoard, forumBoardGroup } = props;
  let { forumBoardId } = props;
  forumBoardId = forumBoard
    ? forumBoard.get("_id") || forumBoardId
    : forumBoardId;
  const dataSource = forumBoardId
    ? getRootDiscussions(store, forumBoardId)
    : Set();
  const isFirstRender = getIsFirstRender(store);
  return { forumBoardId, forumBoardGroup, dataSource, isFirstRender };
}

export default compose(withStyles(styles), connect(mapStateToProps))(
  RootDiscussionList
);
