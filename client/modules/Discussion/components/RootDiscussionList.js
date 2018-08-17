import React from "react";
import PropTypes from "prop-types";
import { Set, Map, is, Record } from "immutable";
import { connect } from "react-redux";
import { shallowEqualImmutable } from "react-immutable-render-mixin";
import moment from "moment";
import { Link } from "react-router-dom";

import compose from "recompose/compose";
import { withStyles } from "@material-ui/core/styles";
import List from "../../../components/List/EnhancedList";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";

import UserAvatar from "../../User/components/UserAvatar";

import { DiscussionRemote } from "../DiscussionActions";
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

const FORUM_BOARD_GROUP_ALL = "_all";

const PageInfo = Record({
  forumBoardGroup: FORUM_BOARD_GROUP_ALL,
  limit: 10,
  page: 1
});

class RootDiscussionList extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string,
    forumBoardGroup: PropTypes.string,
    dataSource: PropTypes.object,
    isFirstRender: PropTypes.bool,
    sort: PropTypes.string
  };

  static defaultProps = {
    forumBoardGroup: FORUM_BOARD_GROUP_ALL,
    dataSource: Set(),
    isFirstRender: false,
    sort: "-updatedAt"
  };

  constructor(props) {
    super(props);
    const pageInfo = this.createPageInfo();
    const pageTable = Map().merge(pageInfo);
    this.state = {
      pageTable
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.forumBoardGroup !== nextProps.forumBoardGroup) {
      const nextPageTable = this.state.pageTable.merge(
        this.createPageInfo(nextProps, { page: 1 })
      );
      this.setState({ pageTable: nextPageTable }, () => {
        this.handleRequestMore({ direction: "top" });
      });
    }
  }

  getForumBoardGroup = (props = this.props) => {
    return props.forumBoardGroup || FORUM_BOARD_GROUP_ALL;
  };

  handleRequestMore = async ({ direction }) => {
    const { pageTable } = this.state;
    const { forumBoardId, forumBoardGroup, sort } = this.props;
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
      DiscussionRemote.getRootDiscussions(forumBoardId, {
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

  createPageInfo = (props = this.props) => {
    const { dataSource } = props;
    const forumBoardGroup = this.getForumBoardGroup(props);
    const limit = props.limit || 10;
    const page = props.page || Math.floor(dataSource.count() / limit) || 1;
    return Map({
      [forumBoardGroup]: new PageInfo({
        forumBoardGroup,
        limit,
        page
      })
    });
  };

  sortBy = payload => {
    return -1 * new Date(payload.get("updatedAt")).getTime();
  };

  listItemHref = payload => {
    return `/discussions/${payload.get("_id")}`;
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
    const { id, forumBoardId } = this.props;
    if (!forumBoardId) {
      return <div>Loading...</div>;
    }
    const { dataSource: dataSourceInput } = this.props;
    const dataSource = dataSourceInput.sortBy(this.sortBy);
    const { classes } = this.props;
    return (
      <List
        id={id ? `${id}/List` : undefined}
        onRequestMore={this.handleRequestMore}
        className={classes.root}
      >
        {dataSource.map(discussion => {
          const key = discussion._id;
          const to = this.listItemHref(discussion);
          const avatar = this.listItemLeftAvatar(discussion);
          const primary = discussion.title;
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
  forumBoardId = forumBoard ? forumBoard._id || forumBoardId : forumBoardId;
  const dataSource = forumBoardId
    ? getRootDiscussions(store, forumBoardId, forumBoardGroup)
    : Set();
  const isFirstRender = getIsFirstRender(store);
  return { forumBoardId, forumBoardGroup, dataSource, isFirstRender };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    dispatch => {
      return { dispatch };
    },
    null,
    {
      areStatePropsEqual: shallowEqualImmutable
    }
  )
)(RootDiscussionList);
