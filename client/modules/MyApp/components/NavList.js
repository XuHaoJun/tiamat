import React from "react";
import PropTypes from "prop-types";
import { Scrollbars } from "react-custom-scrollbars";
import Avatar from "material-ui/Avatar";
import Divider from "material-ui/Divider";
import Subheader from "material-ui/Subheader";
import { List, ListItem, makeSelectable } from "material-ui/List";
import ActionSettings from "material-ui/svg-icons/action/settings";
import ActionHome from "material-ui/svg-icons/action/home";
import ActionHelp from "material-ui/svg-icons/action/help";
import GuestPersonIcon from "material-ui/svg-icons/social/person";
import DiscussionIcon from "material-ui/svg-icons/communication/comment";
import ForumBoardIcon from "material-ui/svg-icons/av/library-books";
import WikiIcon from "material-ui/svg-icons/communication/import-contacts";
import AddIcon from "material-ui/svg-icons/content/add";
import RaisedButton from "material-ui/RaisedButton";
import { Link } from "react-router";

const SelectableList = makeSelectable(List);

export function getStyles(muiTheme) {
  return {
    whiteText: {
      color: "white"
    },
    login: {
      background: muiTheme.palette.primary2Color,
      width: "100%",
      maxWidth: "100%",
      height: 150,
      padding: 20,
      boxSizing: "border-box"
    }
  };
}

class NavList extends React.PureComponent {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  preventDefault = e => {
    e.preventDefault();
  };

  handleTouchTap = (path, e) => {
    if (e.nativeEvent.which === 3) {
      return;
    }
    this.props.onRequestChangeNavDrawer(false);
    this.context.router.push(path);
  };

  render() {
    const styles = getStyles(this.context.muiTheme);
    return (
      <Scrollbars universal={true} autoHide={true}>
        <div style={styles.login}>
          <Avatar icon={<GuestPersonIcon />} />
          <div style={styles.whiteText}>Guest</div>
          <div
            style={{
              marginTop: 10
            }}
          >
            <Link to="/login">
              <RaisedButton label="登入(尚未完成)" primary={true} />
            </Link>
          </div>
        </div>
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
          <Subheader>近期瀏覽</Subheader>
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
        </SelectableList>
      </Scrollbars>
    );
  }
}

export default NavList;
