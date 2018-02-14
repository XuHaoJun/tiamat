import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { connect } from "react-redux";

import { Scrollbars } from "react-custom-scrollbars";
import { Link, Route } from "react-router-dom";

import { withStyles } from "material-ui-next/styles";
import Button from "material-ui-next/Button";
import Divider from "material-ui-next/Divider";
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
  ({ user, classes, onClickLoginButton }) => {
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
              variant="raised"
              color="primary"
              component={Link}
              to="/login"
              onClick={onClickLoginButton}
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

const ListItemBase = props => {
  const { location, to, ...listItemProps } = props;
  const routeChildren = ({ match }) => {
    if (match) {
      return <SelectedListItem to={to} {...listItemProps} disableRipple />;
    } else {
      return <MuiListItem to={to} {...listItemProps} />;
    }
  };
  if (to) {
    return (
      <Route location={location} path={to} exact>
        {routeChildren}
      </Route>
    );
  } else {
    return <MuiListItem {...listItemProps} />;
  }
};

const ListItem = connect(
  state => {
    return { location: state.routing.location };
  },
  () => Object.create(null)
)(ListItemBase);

class NavList extends React.Component {
  static propTypes = {
    onChangeDrawer: PropTypes.func,
    user: PropTypes.object
  };

  static defaultProps = {
    onChangeDrawer: null,
    user: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  closeNavDrawer = e => {
    if (this.props.onChangeDrawer) {
      const reason = "navListItemClick";
      const open = false;
      this.props.onChangeDrawer(e, reason, open);
    }
  };

  render() {
    const { user, browser } = this.props;
    return (
      <Scrollbars
        universal={true}
        autoHide={true}
        style={{ overflow: "auto", height: "100%", width: "100%" }}
      >
        <div>
          {browser.lessThan.medium ? (
            <React.Fragment>
              <UserPanel user={user} onClickLoginButton={this.closeNavDrawer} />
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
              <LogOutListItem button onClick={this.closeNavDrawer}>
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
  const user = getCurrentUser(state);
  const { browser } = state;
  return { user, browser };
}

export default connect(mapStateToProps)(NavList);
