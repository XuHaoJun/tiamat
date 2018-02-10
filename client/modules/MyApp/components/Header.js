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
import AppNavDrawer from "./AppNavDrawer";
import SendButton from "./SendButton";
import SearchAutoComplete from "../../Search/components/SearchAutoComplete";
import makeLogInDialogable from "../../User/components/LogInDialog/makeLogInDialogable";

import { getIsLoggedIn } from "../../User/UserReducer";
import { getIsFirstRender } from "../../MyApp/MyAppReducer";

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
        const divStyle = {
          transform: `rotate(${deg}deg)`
        };
        return <Component style={divStyle} {...other} />;
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
  const { initDeg, ...other } = props;
  return (
    <IconButton {...other}>
      <AnimateMenuIcon initDeg={initDeg || -45} />
    </IconButton>
  );
};

const styles = theme => {
  return {
    flex: {
      flex: 1
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    }
  };
};

class Header extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    onMenuButtonClick: PropTypes.func
  };

  static defaultProps = {
    defaultQuery: "",
    title: "",
    onMenuButtonClick: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    let defaultQuery = "";
    if (this._isInSearchPage()) {
      defaultQuery = props.searchQuery;
    }
    this.state = {
      textValue: defaultQuery || "",
      textFieldFocused: false
    };
  }

  componentDidUpdate() {
    if (
      !this._isInSearchPage() &&
      this.state.textValue !== "" &&
      !this.state.textFieldFocused
    ) {
      this.setState({ textValue: "" });
    }
    if (this._isInSearchPage() && this.state.textFieldFocused === false) {
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
      if (this._isInSearchPage()) {
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
  _isInSearchPage = () => {
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

  LeftIconButton = props => {
    const enableBackspaceButton = this.shouldBackspaceButton();
    if (enableBackspaceButton) {
      return <BackspaceButton onClick={this.handleBack} {...props} />;
    } else {
      const { isFirstRender } = this.props;
      if (isFirstRender) {
        return (
          <IconButton {...props}>
            <CircularProgress size={24} color={props.color} />
          </IconButton>
        );
      } else {
        return (
          <MenuButton
            aria-label="Menu"
            onClick={this.handleMenuButtonClick}
            {...props}
          />
        );
      }
    }
  };

  RightIconButton = props => {
    const { pathname } = this.props;
    const enableSendButtonRules = ["/create", "/update"];
    const enableSendButton = enableSendButtonRules.some(path =>
      Boolean(matchPath(pathname, { path }))
    );
    if (enableSendButton) {
      return <SendButton {...props} />;
    } else {
      const { browser } = this.props;
      if (browser.lessThan.medium) {
        return <SearchButton {...props} />;
      } else {
        const { isLoggedIn } = this.props;
        if (isLoggedIn) {
          return <CurrentUserIconMenu {...props} />;
        } else {
          return <LogInButton {...props}>登入</LogInButton>;
        }
      }
    }
  };

  render() {
    let { title } = this.props;
    if (this._isInSearchPage()) {
      title = <SearchAutoComplete />;
    }
    const appBarZDepth = this.props.appBarZDepth || 0;
    const { classes } = this.props;
    const { LeftIconButton, RightIconButton } = this;
    return (
      <AppBar elevation={appBarZDepth} position="static">
        <Toolbar>
          <LeftIconButton className={classes.menuButton} color="inherit" />
          <Typography variant="title" color="inherit" className={classes.flex}>
            {title}
          </Typography>
          <RightIconButton color="inherit" />
        </Toolbar>
      </AppBar>
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
      return { browser, isLoggedIn, pathname, searchQuery, isFirstRender };
    },
    dispatch => {
      return { dispatch };
    }
  )
)(Header);
