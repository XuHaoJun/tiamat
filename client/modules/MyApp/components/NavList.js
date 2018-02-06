import React from "react";
import PropTypes from "prop-types";
import { Scrollbars } from "react-custom-scrollbars";
import { Link } from "react-router-dom";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { connect } from "react-redux";

import { withStyles } from "material-ui-next/styles";

import Button from "material-ui-next/Button";

import Divider from "material-ui-next/Divider";

import ListSubheader from "material-ui-next/List/ListSubheader";
import List, {
  ListItem as MuiListItem,
  ListItemIcon,
  ListItemText
} from "material-ui-next/List";

import WhatsHotIcon from "material-ui-icons-next/Whatshot";
import ActionHomeIcon from "material-ui-icons-next/Home";
import ChatIcon from "material-ui-icons-next/Chat";
import SubscriptionIcon from "material-ui-icons-next/RssFeed";
import HelpIcon from "material-ui-icons-next/Help";
import SettingsIcon from "material-ui-icons-next/Settings";
import AddIcon from "material-ui-icons-next/Add";

import { getCurrentUser } from "../../User/UserReducer";
import logOutRequestComposeEvent from "../../User/composes/logOutRequestComposeEvent";
import UserAvatar from "../../User/components/UserAvatar";
import { getIsFirstRender } from "../MyAppReducer";

const LogOutListItem = logOutRequestComposeEvent(MuiListItem, "onClick");

const userPanelStyles = muiTheme => {
  return {
    root: {
      background: muiTheme.palette.primary.light,
      width: "100%",
      maxWidth: "100%",
      height: 150,
      padding: 20,
      boxSizing: "border-box"
    },
    whiteText: {
      color: muiTheme.palette.primary.contrastText
    }
  };
};

const UserPanel = withStyles(userPanelStyles)(
  ({ user, classes, onClickLogin }) => {
    return (
      <div className={classes.root}>
        <UserAvatar user={user} />
        <div className={classes.whiteText}>
          {user ? user.get("displayName") : "Guest"}
        </div>
        <div
          style={{
            marginTop: 10
          }}
        >
          {!user ? (
            <Button
              raised
              color="primary"
              component={Link}
              to="/login"
              onClick={onClickLogin}
            >
              登入
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
);

const selectedListItemStyles = theme => {
  return {
    root: {
      backgroundColor: theme.palette.divider,
      "&:hover": {
        backgroundColor: theme.palette.divider
      }
    }
  };
};

const SelectedListItem = withStyles(selectedListItemStyles)(MuiListItem);

class NavList extends React.Component {
  static propTypes = {
    requestChangeNavDrawer: PropTypes.func,
    user: PropTypes.object,
    value: PropTypes.string
  };

  static defaultProps = {
    requestChangeNavDrawer: () => {},
    user: null,
    value: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  requestChangeNavDrawer = open => {
    if (this.props.requestChangeNavDrawer) {
      this.props.requestChangeNavDrawer(open);
    }
  };

  closeNavDrawer = () => {
    if (this.props.requestChangeNavDrawer) {
      this.props.requestChangeNavDrawer(false);
    }
  };

  ListItem = props => {
    const { value } = this.props;
    const { to } = props;
    if (typeof to === "string" && to === value) {
      return <SelectedListItem {...props} disableRipple />;
    } else {
      return <MuiListItem {...props} />;
    }
  };

  render() {
    const { user, browser } = this.props;
    const { ListItem } = this;
    return (
      <Scrollbars universal={true} autoHide={true}>
        <div style={{ overflow: "auto", height: "100%", width: "100%" }}>
          {browser.lessThan.medium ? (
            <React.Fragment>
              <UserPanel user={user} onClickLogin={this.closeNavDrawer} />
              <Divider />
            </React.Fragment>
          ) : null}
          <List style={{ paddingTop: 0 }}>
            <ListItem
              button
              component={Link}
              to="/"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <ActionHomeIcon />
              </ListItemIcon>
              <ListItemText inset primary="首頁" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/whatsHotDiscussions"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <WhatsHotIcon />
              </ListItemIcon>
              <ListItemText primary="熱門話題" />
            </ListItem>
            <Divider />
            <ListItem
              button
              component={Link}
              to="/subscriptions"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <SubscriptionIcon />
              </ListItemIcon>
              <ListItemText primary="訂閱內容" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/subscriptions/1"
              onClick={this.closeNavDrawer}
            >
              <ListItemText inset primary="訂閱內容近期更新01" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/subscriptions/2"
              onClick={this.closeNavDrawer}
            >
              <ListItemText inset primary="訂閱內容近期更新02" />
            </ListItem>
            <Divider />
            <ListItem
              button
              component={Link}
              to="/chatRooms"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="聊天室" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/chatRooms/1"
              onClick={this.closeNavDrawer}
            >
              <ListItemText inset primary="聊天室近期更新01" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/chatRooms/2"
              onClick={this.closeNavDrawer}
            >
              <ListItemText inset primary="聊天室近期更新02" />
            </ListItem>
            <Divider />
            <ListSubheader>App 相關</ListSubheader>
            <ListItem
              button
              component={Link}
              to="/create/forumBoard"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="建立看板" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/about"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="說明" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/settings"
              onClick={this.closeNavDrawer}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="設定" />
            </ListItem>
            {user ? (
              <LogOutListItem
                button
                component={Link}
                to="/logout"
                onClick={this.closeNavDrawer}
              >
                <ListItemText inset primary="登出" />
              </LogOutListItem>
            ) : null}
          </List>
        </div>
      </Scrollbars>
    );
  }
}

function mapStateToProps(state) {
  const { location } = state.routing;
  const isFirstRender = getIsFirstRender(state);
  let value;
  if (location && !isFirstRender) {
    value = location.pathname;
  }
  const user = getCurrentUser(state);
  const { browser } = state;
  return { user, value, browser };
}

export default connect(mapStateToProps)(NavList);
