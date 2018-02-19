import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import PropTypes from "prop-types";
import compose from "recompose/compose";
import { connect } from "react-redux";
import { goBack, replace, push } from "react-router-redux";
import { Link } from "react-router-dom";
import { matchPath } from "react-router";
import { Motion, spring } from "react-motion";

import { withStyles } from "material-ui-next/styles";
import AppBar from "material-ui-next/AppBar";
import Toolbar from "material-ui-next/Toolbar";
import Typography from "material-ui-next/Typography";
import Button from "material-ui-next/Button";
import IconButton from "material-ui-next/IconButton";
import SearchVerIcon from "material-ui-icons-next/Search";
import BackspaceIcon from "material-ui-icons-next/KeyboardBackspace";
import MenuIcon from "material-ui-icons-next/Menu";
import CircularProgress from "material-ui-next/Progress/CircularProgress";

import CurrentUserIconMenu from "../../User/components/CurrentUserIconMenu";
import SendButton from "./SendButton";
import SearchAutoComplete from "../../Search/components/SearchAutoComplete";
import makeLogInDialogable from "../../User/components/LogInDialog/makeLogInDialogable";

import { getUI, getIsFirstRender } from "../MyAppReducer";
import { getIsLoggedIn } from "../../User/UserReducer";

const LogInButton = makeLogInDialogable(Button);

const SearchButton = props => {
  return (
    <IconButton {...props} component={Link} to="/search">
      <SearchVerIcon />
    </IconButton>
  );
};

const LeftElementMotionHoc = Component => props => {
  const { initDeg, ...other } = props;
  const defaultStyle = {
    deg: initDeg || 45
  };
  const style = {
    deg: spring(0, {
      stiffness: 222,
      damping: 30
    })
  };
  return (
    <Motion defaultStyle={defaultStyle} style={style}>
      {({ deg }) => {
        return (
          <Component
            style={{
              transform: `rotate(${deg}deg)`
            }}
            {...other}
          />
        );
      }}
    </Motion>
  );
};

const AnimateBackspaceIcon = LeftElementMotionHoc(BackspaceIcon);

const BackspaceButton = props => {
  const { initDeg, ...other } = props;
  return (
    <IconButton {...other}>
      <AnimateBackspaceIcon initDeg={initDeg} />
    </IconButton>
  );
};

const AnimateMenuIcon = LeftElementMotionHoc(MenuIcon);

const MenuButton = props => {
  const { initDeg: initDegInput, ...other } = props;
  const initDeg = initDegInput || -45;
  return (
    <IconButton {...other}>
      <AnimateMenuIcon initDeg={initDeg} />
    </IconButton>
  );
};

const styles = {
  flex: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
};

class AppHeader extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    onMenuButtonClick: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    let defaultQuery = "";
    if (this.isInSearchPage()) {
      defaultQuery = props.searchQuery;
    }
    this.state = {
      textValue: defaultQuery || "",
      textFieldFocused: false
    };
  }

  componentDidUpdate() {
    if (
      !this.isInSearchPage() &&
      this.state.textValue !== "" &&
      !this.state.textFieldFocused
    ) {
      this.setState({ textValue: "" });
    }
    if (this.isInSearchPage() && this.state.textFieldFocused === false) {
      const query = this.props.searchQuery;
      if (this.state.textValue === "" && query) {
        this.setState({ textValue: query });
      }
    }
  }

  handleOnSubmit = e => {
    e.preventDefault();
    this._fetchSearchResults(this.state.textValue);
    if (this._textField) {
      this._textField.blur();
    }
  };

  _bindTextField = tf => {
    this._textField = tf;
  };

  handleBack = () => {
    this.props.dispatch(goBack());
  };

  _fetchSearchResults = v => {
    const noSendRegex = /[\\/ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ]/g;
    const query = v.replace(noSendRegex, "");
    this.setState({ textValue: query });
    if (query) {
      // it will trigger search page and query it.
      let routerAction;
      if (this.isInSearchPage()) {
        routerAction = replace;
      } else {
        routerAction = push;
      }
      this.props.dispatch(routerAction(`/search?query=${query}`));
    }
  };

  handleBlur = () => {
    this.setState({ textFieldFocused: false });
  };

  handleFocus = () => {
    this.setState({ textFieldFocused: true });
  };

  handleTextChange = event => {
    const v = event.target.value;
    this.setState({ textValue: v });
    if (v === "" && !this.state.textFieldFocused) {
      // this.props.dispatch(clientInitSearchResults());
    }
  };

  // TODO
  // use getCurrentPage() ?
  isInSearchPage = () => {
    const { pathname } = this.props;
    return Boolean(matchPath(pathname, { path: "/search" }));
  };

  handleRequestChangeNavDrawer = open => {
    if (this.props.browser.lessThan.medium) {
      this.setState({ open });
    } else {
      if (!(this.state.open && !this.props.browser.lessThan.medium)) {
        this.setState({ open });
      }
    }
  };

  shouldBackspaceButton = (pathname = this.props.pathname) => {
    if (!this.props.browser.lessThan.medium) {
      return false;
    } else {
      // TODO
      // use getCurrentPage() ?
      const paths = [
        "/create",
        "/update",
        "/edit",
        "/setting",
        "/settings",
        "/about",
        "/search",
        "/rootWikis/:rootWikiId/wikis/:wikiName",
        "/rootDiscussions"
      ];
      return paths.some(path => {
        return Boolean(matchPath(pathname, { path }));
      });
    }
  };

  handleMenuButtonClick = e => {
    if (this.props.onMenuButtonClick) {
      this.props.onMenuButtonClick(e);
    }
  };

  LeftIconButton = buttonProps => {
    const enableBackspaceButton = this.shouldBackspaceButton();
    if (enableBackspaceButton) {
      return <BackspaceButton onClick={this.handleBack} {...buttonProps} />;
    } else {
      const { isFirstRender } = this.props;
      if (isFirstRender) {
        return (
          <IconButton {...buttonProps}>
            <CircularProgress size={24} color={buttonProps.color} />
          </IconButton>
        );
      } else {
        return (
          <MenuButton
            aria-label="Menu"
            onClick={this.handleMenuButtonClick}
            {...buttonProps}
          />
        );
      }
    }
  };

  RightIconButton = buttonProps => {
    const { pathname } = this.props;
    const enableSendButtonRules = ["/create", "/update"];
    const enableSendButton = enableSendButtonRules.some(path =>
      Boolean(matchPath(pathname, { path }))
    );
    if (enableSendButton) {
      return <SendButton {...buttonProps} />;
    } else {
      const { browser } = this.props;
      if (browser.lessThan.medium) {
        return <SearchButton {...buttonProps} />;
      } else {
        const { isLoggedIn } = this.props;
        if (isLoggedIn) {
          return <CurrentUserIconMenu {...buttonProps} />;
        } else {
          return <LogInButton {...buttonProps}>登入</LogInButton>;
        }
      }
    }
  };

  showSearch = () => {
    const { browser } = this.props;
    if (browser.greaterThan.small) {
      return true;
    } else {
      return this.isInSearchPage();
    }
  };

  showTitle = () => {
    const { browser } = this.props;
    if (browser.greaterThan.small) {
      return true;
    } else {
      return !this.isInSearchPage();
    }
  };

  render() {
    const { title, classes } = this.props;
    const { LeftIconButton, RightIconButton } = this;
    return (
      <React.Fragment>
        <AppBar elevation={0} position="fixed">
          <Toolbar>
            <LeftIconButton className={classes.menuButton} color="inherit" />
            {this.showTitle() ? (
              <Typography
                variant="title"
                color="inherit"
                className={classes.flex}
              >
                {title}
              </Typography>
            ) : null}
            {this.showSearch() ? <SearchAutoComplete /> : null}
            <RightIconButton color="inherit" />
          </Toolbar>
        </AppBar>
        <AppBar elevation={0} position="static">
          <Toolbar />
        </AppBar>
      </React.Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    state => {
      const { browser } = state;
      const isLoggedIn = getIsLoggedIn(state);
      const isFirstRender = getIsFirstRender(state);
      const { pathname, query: searchQuery } = state.routing.location;
      const ui = getUI(state);
      const title = ui.getIn(["header", "title"]);
      return {
        browser,
        isLoggedIn,
        pathname,
        searchQuery,
        isFirstRender,
        title
      };
    },
    dispatch => {
      return { dispatch };
    }
  )
)(AppHeader);
