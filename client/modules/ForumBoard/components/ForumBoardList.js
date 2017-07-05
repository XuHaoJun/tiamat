import React from "react";
import { Set } from "immutable";
import { connect } from "react-redux";
import CommonList from "../../../components/List/CommonList";
import { getForumBoards } from "../ForumBoardReducer";
import { fetchForumBoards } from "../ForumBoardActions";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import Avatar from "material-ui/Avatar";

class ForumBoardList extends React.Component {
  static defaultProps = {
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
      enableLoadMore: true
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchForumBoards());
  }

  onRequestLoadMore = () => {
    const { page, limit, sort } = this.state;
    const nextPage = page + 1;
    this.props
      .dispatch(fetchForumBoards(nextPage, limit, sort))
      .then(forumBoardsJSON => {
        if (forumBoardsJSON.length < limit) {
          this.setState({ enableLoadMore: false });
        } else {
          this.setState({ page: nextPage });
        }
      })
      .catch(() => {
        this.setState({ enableLoadMore: false });
      });
  };

  listItemHref = payload => {
    return `/forumBoards/${payload.get("_id")}/rootDiscussions`;
  };

  listItemLeftAvatar = payload => {
    return (
      <Avatar>
        {payload.get("name")[0]}
      </Avatar>
    );
  };

  listItemSecondaryText = payload => {
    return `${payload.get("popularityCounter")} 人氣`;
  };

  sortBy = payload => {
    return -1 * payload.get("popularityCounter");
  };

  render() {
    const dataSource = this.props.dataSource.sortBy(this.sortBy);
    return (
      <CommonList
        dataSource={dataSource}
        listItemHref={this.listItemHref}
        listItemLeftAvatar={this.listItemLeftAvatar}
        listItemSecondaryText={this.listItemSecondaryText}
        onRequestLoadMore={this.onRequestLoadMore}
        enableLoadMore={this.state.enableLoadMore}
      />
    );
  }
}

function mapStateToProps(store) {
  const forumBoards = getForumBoards(store);
  return { dataSource: forumBoards };
}

export default connect(mapStateToProps)(ForumBoardList);
