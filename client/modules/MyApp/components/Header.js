import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router";

import { Motion, spring } from "react-motion";

import compose from "recompose/compose";
import { withStyles } from "material-ui-next/styles";
import AppBar from "material-ui-next/AppBar";
import Toolbar from "material-ui-next/Toolbar";
import Typography from "material-ui-next/Typography";
import Button from "material-ui-next/Button";
import IconButton from "material-ui-next/IconButton";
import SearchVerIcon from "material-ui-icons-next/Search";
import BackspaceIcon from "material-ui-icons-next/KeyboardBackspace";
import MenuIcon from "material-ui-icons-next/Menu";

import CurrentUserIconMenu from "../../User/components/CurrentUserIconMenu";
import AppNavDrawer from "./AppNavDrawer";
import SendButton from "./SendButton";
import SearchAutoComplete from "../../Search/components/SearchAutoComplete";
import makeLogInDialogable from "../../User/components/LogInDialog/makeLogInDialogable";

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
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    classes: PropTypes.object.isRequired
  };

  static defaultProps = {
    defaultQuery: "",
    title: "",
    onChangeDrawerOpen: undefined,
    onDrawerOpen: undefined,
    onDrawerClose: undefined
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    let defaultQuery = "";
    if (this._isInSearchPage()) {
      defaultQuery = props.searchQuery;
    }
    const open = !props.browser.lessThan.medium;
    this.state = {
      open,
      textValue: defaultQuery || "",
      textFieldFocused: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const nextState = {};
    if (nextProps.browser !== this.props.browser) {
      const open = !nextProps.browser.lessThan.medium;
      if (this.state.open !== open) {
        nextState.open = open;
      }
    }
    if (Object.keys(nextState).length > 0) {
      this.setState(nextState);
    }
  }

  componentDidUpdate(prevProps, prevState) {
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
    if (prevState.open !== this.state.open) {
      if (this.props.onChangeDrawerOpen) {
        this.props.onChangeDrawerOpen(this.state.open);
      }
      if (this.state.open) {
        if (this.props.onDrawerOpen) {
          this.props.onDrawerOpen();
        }
      } else {
        if (this.props.onDrawerClose) {
          this.props.onDrawerClose();
        }
      }
    }
  }

  getDrawerIsOpen = () => {
    return this.state.open;
  };

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
    setTimeout(this.context.router.goBack, 0);
  };

  _fetchSearchResults = v => {
    const noSendRegex = /[\\/ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ]/g;
    const query = v.replace(noSendRegex, "");
    this.setState({ textValue: query });
    // it will trigger search page and query it.
    let routerAction;
    if (this._isInSearchPage()) {
      routerAction = this.context.router.replace;
    } else {
      routerAction = this.context.router.push;
    }
    if (query === "") {
      return;
    }
    routerAction(`/search?query=${query}`);
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

  _isInSearchPage = () => {
    return /^\/search/.test(this.props.pathname);
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

  handleToggle = e => {
    e.preventDefault();
    this.setState({
      open: !this.state.open
    });
  };

  handleClose = () => this.setState({ open: false });

  shouldBackspaceButton = pathname => {
    if (!this.props.browser.lessThan.medium) {
      return false;
    } else {
      const upsertPage = new RegExp("^/(create|update|edit)/.+");
      const etcPage = new RegExp("^/(setting|about|search)");
      const discussionDetailPage = new RegExp("^/rootDiscussions/(.+)");
      const wikiDetailPage = new RegExp("^/rootWikis/(.+)/wikis/(.+)");
      const rules = [upsertPage, etcPage, discussionDetailPage, wikiDetailPage];
      const enableBackspaceButton = rules.some(regexp => regexp.test(pathname));
      return enableBackspaceButton;
    }
  };

  LeftIconButton = props => {
    const enableBackspaceButton = this.shouldBackspaceButton(
      this.props.pathname
    );
    if (enableBackspaceButton) {
      return <BackspaceButton onClick={this.handleBack} {...props} />;
    } else {
      return <MenuButton onClick={this.handleToggle} {...props} />;
    }
  };

  RightIconButton = props => {
    const { pathname } = this.props;
    const enableSendButtonRules = [/\/create/, /\update/];
    const enableSendButton = enableSendButtonRules.some(regexp =>
      regexp.test(pathname)
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
    const { open } = this.state;
    const selectedIndex = this.props.pathname;
    let { title } = this.props;
    if (this._isInSearchPage()) {
      title = <SearchAutoComplete />;
    }
    const appBarZDepth = this.props.appBarZDepth || 0;
    const { classes } = this.props;
    const { LeftIconButton, RightIconButton } = this;
    return (
      <React.Fragment>
        <AppBar elevation={appBarZDepth} position="static">
          <Toolbar>
            <LeftIconButton
              className={classes.menuButton}
              color="inherit"
              aria-label="Menu"
            />
            <Typography type="title" color="inherit" className={classes.flex}>
              {title}
            </Typography>
            <RightIconButton color="inherit" />
          </Toolbar>
        </AppBar>
        <AppNavDrawer
          browser={this.props.browser}
          selectedIndex={selectedIndex}
          open={open}
          onRequestChangeNavDrawer={this.handleRequestChangeNavDrawer}
        />
      </React.Fragment>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    state => {
      const isLoggedIn = getIsLoggedIn(state);
      const { browser } = state;
      return { browser, isLoggedIn };
    },
    () => {
      return {};
    }
  )
)(Header);
