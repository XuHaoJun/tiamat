import React from "react";
import PropTypes from "prop-types";
import { Scrollbars } from "react-custom-scrollbars";
import { Link } from "react-router";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { connect } from "react-redux";
import MaterialDivider from "material-ui/Divider";
import Subheader from "material-ui/Subheader";
import { List, ListItem, makeSelectable } from "material-ui/List";
import RaisedButton from "material-ui/RaisedButton";
import ActionSettings from "material-ui/svg-icons/action/settings";
import ActionHome from "material-ui/svg-icons/action/home";
import ActionHelp from "material-ui/svg-icons/action/help";
import GuestPersonIcon from "material-ui/svg-icons/social/person";
import WatchIcon from "material-ui/svg-icons/image/remove-red-eye";
import DiscussionIcon from "material-ui/svg-icons/communication/comment";
import ForumBoardIcon from "material-ui/svg-icons/av/library-books";
import WikiIcon from "material-ui/svg-icons/communication/import-contacts";
import AddIcon from "material-ui/svg-icons/content/add";

import { getCurrentUser } from "../../User/UserReducer";
import logOutRequestComposeEvent from "../../User/composes/logOutRequestComposeEvent";
import UserAvatar from "../../User/components/UserAvatar";

const LogOutListItem = logOutRequestComposeEvent(ListItem, "onClick");

const SelectableList = makeSelectable(List);

const Divider = props => {
  const { style, ...other } = props;
  const _style = Object.assign(
    {
      backgroundColor: "hsl(0, 0%, 93.3%)"
    },
    style
  );
  return <MaterialDivider {...other} style={_style} />;
};

export function getStyles(muiTheme) {
  return {
    whiteText: {
      color: "white"
    },
    userPanel: {
      background: muiTheme.palette.primary2Color,
      width: "100%",
      maxWidth: "100%",
      height: 150,
      padding: 20,
      boxSizing: "border-box"
    }
  };
}

class NavList extends React.Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    requestChangeNavDrawer: PropTypes.func,
    user: PropTypes.object
  };

  static defaultProps = {
    requestChangeNavDrawer: () => {},
    user: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  preventDefault = e => {
    e.preventDefault();
  };

  requestChangeNavDrawer = open => {
    if (this.props.requestChangeNavDrawer) {
      this.props.requestChangeNavDrawer(open);
    }
  };

  handleTouchTap = (path, e) => {
    if (e.nativeEvent.which === 3) {
      return;
    }
    this.requestChangeNavDrawer(false);
    this.context.router.push(path);
  };

  render() {
    const styles = getStyles(this.context.muiTheme);
    const { user, browser } = this.props;
    const userPanel = (
      <div style={styles.userPanel}>
        <UserAvatar user={user} />
        <div style={styles.whiteText}>
          {user ? user.get("displayName") : "Guest"}
        </div>
        <div
          style={{
            marginTop: 10
          }}
        >
          {!user ? (
            <Link
              to="/login"
              href="/login"
              onClick={this.requestChangeNavDrawer.bind(this, false)}
            >
              <RaisedButton label="登入" primary={true} />
            </Link>
          ) : null}
        </div>
      </div>
    );
    return (
      <Scrollbars universal={true} autoHide={true}>
        {browser.lessThan.medium ? userPanel : null}
        <SelectableList value={this.props.selectedIndex}>
          <ListItem
            primaryText="首頁"
            leftIcon={<ActionHome />}
            value="/"
            href="/"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/")}
          />
          <ListItem
            primaryText="我的文章(尚未完成)"
            leftIcon={<GuestPersonIcon />}
            value="/users/guest/discussions"
            href="/users/guest/discussions"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(
              this,
              "/users/guest/discussions"
            )}
          />
          <ListItem
            primaryText="我的訂閱(尚未完成)"
            leftIcon={<WatchIcon />}
            value="/users/guest/discussions"
            href="/users/guest/discussions"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(
              this,
              "/users/guest/discussions"
            )}
          />
          <Divider />
          <Subheader>瀏覽</Subheader>
          <ListItem
            primaryText="看板(尚未完成)"
            leftIcon={<ForumBoardIcon />}
            value="/forumBoards"
            href="/forumBoards"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/forumBoards")}
          />
          <ListItem
            primaryText="維基(尚未完成)"
            leftIcon={<WikiIcon />}
            value="/wikis"
            href="/wikis"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/wikis")}
          />
          <Divider />
          <Subheader>近期瀏覽(4個)尚未完成</Subheader>
          <ListItem
            primaryText="某個文章(尚未完成)"
            leftIcon={<DiscussionIcon />}
            value="/???"
            href="/???"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/???")}
          />
          <ListItem
            primaryText="某個維基(尚未完成)"
            leftIcon={<WikiIcon />}
            value="/???"
            href="/???"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/???")}
          />
          <Divider />
          <Subheader>App 相關</Subheader>
          <ListItem
            primaryText="建立看板"
            leftIcon={<AddIcon />}
            value="/create/forumBoard"
            href="/create/forumBoard"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/create/forumBoard")}
          />
          <ListItem
            primaryText="說明"
            leftIcon={<ActionHelp />}
            value="/about"
            href="/about"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/about")}
          />
          <ListItem
            primaryText="設定"
            leftIcon={<ActionSettings />}
            value="/setting"
            href="/setting"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/setting")}
          />
          {user ? (
            <LogOutListItem
              primaryText="登出"
              onClick={() => {
                this.requestChangeNavDrawer(false);
              }}
            />
          ) : null}
        </SelectableList>
      </Scrollbars>
    );
  }
}

function mapStateToProps(state) {
  const user = getCurrentUser(state);
  const { browser } = state;
  return { user, browser };
}

export default connect(mapStateToProps)(NavList);
