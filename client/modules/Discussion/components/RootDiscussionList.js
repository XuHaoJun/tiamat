import React from "react";
import PropTypes from "prop-types";
import CommonList from "../../../components/List/CommonList";
import { Set, is, fromJS } from "immutable";
import { fetchRootDiscussions } from "../DiscussionActions";
import { getRootDiscussions } from "../DiscussionReducer";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import UserAvatar from "../../User/components/UserAvatar";
import moment from "moment";

class RootDiscussionList extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string,
    dataSource: PropTypes.object
  };

  static defaultProps = {
    forumBoardId: undefined,
    dataSource: Set()
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const pageInfo = this.makePageInfo();
    const pageTable = fromJS({}).merge(pageInfo);
    this.state = {
      pageTable,
      sort: "-updatedAt",
      enableLoadMore: true,
      isFirstRender: true
    };
  }

  componentDidMount() {
    this.setIsFirstRender(false);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.forumBoardGroup !== nextProps.forumBoardGroup) {
      const nextPageTable = this.state.pageTable.merge(
        this.makePageInfo(nextProps)
      );
      this.setState({ enableLoadMore: true, pageTable: nextPageTable }, () => {
        this.onRequestLoadMore();
      });
    }
  }

  onRequestLoadMore = () => {
    const { pageTable, sort } = this.state;
    const { forumBoardId, forumBoardGroup } = this.props;
    const pageInfo = pageTable.get(this.getForumBoardGroup());
    const { page, limit } = pageInfo;
    if (!forumBoardId) {
      return null;
    }
    const nextPage = page + 1;
    const prevDataSource = this.props.dataSource;
    // TODO
    // cancel fetch when componemntWillUnmount
    return this.props
      .dispatch(
        fetchRootDiscussions(forumBoardId, {
          page: nextPage,
          limit,
          sort,
          forumBoardGroup
        })
      )
      .then(discussionsJSON => {
        const currentDataSource = this.props.dataSource;
        if (
          discussionsJSON.length < limit ||
          currentDataSource.count() === 0 ||
          is(prevDataSource, currentDataSource)
        ) {
          this.setState({ enableLoadMore: false });
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
        }
      })
      .catch(() => {
        this.setState({ enableLoadMore: false });
      });
  };

  setIsFirstRender = bool => {
    if (bool !== this.state.isFirstRender) {
      this.setState({ isFirstRender: bool });
    }
  };

  getForumBoardGroup = (props = this.props) => {
    return props.getForumBoardGroup || "_all";
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
    const { isFirstRender } = this.state;
    const fromNowTime = isFirstRender
      ? moment(discussion.get("updatedAt")).format("ll")
      : moment(discussion.get("updatedAt")).fromNow();
    const descendantCount = discussion.get("descendantCount") || 0;
    return `${fromNowTime} • 留言次數: ${descendantCount}`;
  };

  listItemLeftAvatar = discussion => {
    const authorBasicInfo = discussion.get("authorBasicInfo");
    return <UserAvatar user={authorBasicInfo} />;
  };

  render() {
    const { enableLoadMore } = this.state;
    const { forumBoardId, forumBoardGroup } = this.props;
    if (forumBoardId === undefined) {
      return <div>Loading...</div>;
    }
    let { dataSource } = this.props;
    if (forumBoardGroup) {
      dataSource = dataSource.filter(rootDiscussion => {
        return rootDiscussion.get("forumBoardGroup") === forumBoardGroup;
      });
    }
    dataSource = dataSource.sortBy(this.sortBy);
    const { isFirstRender } = this.state;
    const listItemSecondaryText = isFirstRender
      ? this.listItemSecondaryText.bind(this)
      : this.listItemSecondaryText;
    return (
      <CommonList
        dataSource={dataSource}
        enableLoadMore={enableLoadMore}
        listItemHref={this.listItemHref}
        listItemSecondaryText={listItemSecondaryText}
        listItemLeftAvatar={this.listItemLeftAvatar}
        onRequestLoadMore={this.onRequestLoadMore}
      />
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
  return { forumBoardId, forumBoardGroup, dataSource };
}

export default connect(mapStateToProps)(RootDiscussionList);
