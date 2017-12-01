import React from "react";
import PropTypes from "prop-types";
import CommonList from "../../../components/List/CommonList";
import { Set, is } from "immutable";
import { fetchRootDiscussions } from "../DiscussionActions";
import { getRootDiscussions } from "../DiscussionReducer";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import Avatar from "material-ui/Avatar";
import DiscussionIcon from "material-ui/svg-icons/communication/comment";
import moment from "moment";

class RootDiscussionList extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string.isRequired,
    dataSource: PropTypes.object
  };

  static defaultProps = {
    dataSource: Set()
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { dataSource } = props;
    const limit = props.limit || 10;
    const page = props.page || Math.floor(dataSource.count() / limit) || 1;
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
    const { forumBoardId, forumBoardGroup } = this.props;
    const nextPage = page + 1;
    const prevDataSource = this.props.dataSource;
    this.props.dispatch(
      fetchRootDiscussions(forumBoardId, 1, limit, sort, forumBoardGroup)
    );
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
          is(prevDataSource, currentDataSource)
        ) {
          this.setState({ enableLoadMore: false });
        } else {
          this.setState({ page: nextPage });
        }
      })
      .catch(() => {
        this.setState({ enableLoadMore: false });
      });
  };

  sortBy = payload => {
    return -1 * new Date(payload.get("updatedAt")).getTime();
  };

  listItemHref = payload => {
    return `/rootDiscussions/${payload.get("_id")}`;
  };

  listItemSecondaryText = payload => {
    const fromNowTime = moment(payload.get("updatedAt")).fromNow();
    const descendantCount = payload.get("descendantCount") || 0;
    return `${fromNowTime}, ${descendantCount} 留言`;
  };

  listItemLeftAvatar = payload => {
    return <Avatar icon={<DiscussionIcon />} />;
  };

  render() {
    const { enableLoadMore } = this.state;
    const { forumBoardGroup } = this.props;
    let { dataSource } = this.props;
    if (forumBoardGroup) {
      dataSource = dataSource.filter(rootDiscussion => {
        return rootDiscussion.get("forumBoardGroup") === forumBoardGroup;
      });
    }
    dataSource = dataSource.sortBy(this.sortBy);
    return (
      <CommonList
        dataSource={dataSource}
        enableRefreshIndicator={true}
        enableLoadMore={enableLoadMore}
        listItemHref={this.listItemHref}
        listItemSecondaryText={this.listItemSecondaryText}
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
