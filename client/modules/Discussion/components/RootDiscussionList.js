import React from "react";
import PropTypes from "prop-types";
import CommonList from "../../../components/List/CommonList";
import { Set } from "immutable";
import { fetchRootDiscussions } from "../DiscussionActions";
import { getRootDiscussions } from "../DiscussionReducer";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import Avatar from "material-ui/Avatar";
import DiscussionIcon from "material-ui/svg-icons/communication/comment";
import moment from "moment";

moment.locale("zh-tw");

class RootDiscussionList extends React.Component {
  static propTypes = {
    forumBoardId: PropTypes.string.isRequired
  };

  static defaultProps = {
    forumBoardId: "",
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
    const { forumBoardId, forumBoardGroup } = this.props;
    const nextPage = page + 1;
    this.props
      .dispatch(
        fetchRootDiscussions(forumBoardId, {
          page: nextPage,
          limit,
          sort,
          forumBoardGroup
        })
      )
      .then(discussionsJSON => {
        if (discussionsJSON.length < limit) {
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
    return `/forumBoards/${payload.get(
      "forumBoard"
    )}/rootDiscussions/${payload.get("_id")}`;
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
    const dataSource = this.props.dataSource.sortBy(this.sortBy);
    return (
      <CommonList
        dataSource={dataSource}
        listItemHref={this.listItemHref}
        listItemSecondaryText={this.listItemSecondaryText}
        listItemLeftAvatar={this.listItemLeftAvatar}
        onRequestLoadMore={this.onRequestLoadMore}
        enableLoadMore={this.state.enableLoadMore}
      />
    );
  }
}

function mapStateToProps(store, props) {
  const { forumBoardId, forumBoardGroup } = props;
  let dataSource = forumBoardId
    ? getRootDiscussions(store, forumBoardId)
    : Set();
  if (forumBoardGroup) {
    dataSource = dataSource.filter(rootDiscussion => {
      return rootDiscussion.get("forumBoardGroup") === forumBoardGroup;
    });
  }
  return { forumBoardId, forumBoardGroup, dataSource };
}

export default connect(mapStateToProps)(RootDiscussionList);
