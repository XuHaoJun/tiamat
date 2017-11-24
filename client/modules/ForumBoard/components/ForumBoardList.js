import React from "react";
import { Set, is } from "immutable";
import { connect } from "react-redux";
import CommonList from "../../../components/List/CommonList";
import { getForumBoards } from "../ForumBoardReducer";
import { fetchForumBoards } from "../ForumBoardActions";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import Avatar from "material-ui/Avatar";
import Debug from "debug";

const debug = Debug("app:ForumBoardList");

class ForumBoardList extends React.Component {
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
      enableLoadMore: true
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchForumBoards());
  }

  onRequestLoadMore = () => {
    const { page, limit, sort } = this.state;
    const nextPage = page + 1;
    const prevDataSource = this.props.dataSource;
    debug("onRequestLoadMore start");
    return this.props
      .dispatch(fetchForumBoards(nextPage, limit, sort))
      .then(() => {
        debug("onRequestLoadMore end1");
        const currentDataSource = this.props.dataSource;
        const nextState = {};
        const changed = !is(prevDataSource, currentDataSource);
        if (changed) {
          nextState.enableLoadMore = true;
          nextState.page = nextPage;
        } else {
          nextState.enableLoadMore = false;
        }
        this.setState(nextState);
        debug("onRequestLoadMore end2");
      })
      .catch(() => {
        this.setState({ enableLoadMore: false });
      });
  };

  listItemHref = payload => {
    return `/forumBoards/${payload.get("_id")}/rootDiscussions`;
  };

  listItemLeftAvatar = payload => {
    return <Avatar>{payload.get("name")[0]}</Avatar>;
  };

  listItemSecondaryText = payload => {
    return `${payload.get("popularityCounter")} 人氣`;
  };

  sortBy = payload => {
    return -1 * payload.get("popularityCounter");
  };

  render() {
    const { enableLoadMore } = this.state;
    const dataSource = this.props.dataSource.sortBy(this.sortBy);
    return (
      <CommonList
        dataSource={dataSource}
        enableLoadMore={enableLoadMore}
        enableRefreshIndicator={true}
        listItemHref={this.listItemHref}
        listItemLeftAvatar={this.listItemLeftAvatar}
        listItemSecondaryText={this.listItemSecondaryText}
        onRequestLoadMore={this.onRequestLoadMore}
      />
    );
  }
}

function mapStateToProps(store) {
  const forumBoards = getForumBoards(store);
  return { dataSource: forumBoards };
}

export default connect(mapStateToProps)(ForumBoardList);
