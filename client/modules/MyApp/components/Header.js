import React, { Component } from "react";
import memoize from "fast-memoize";
import PropTypes from "prop-types";
import AppBar from "material-ui/AppBar";
import { getStyles as appBarGetStyles } from "material-ui/AppBar/AppBar";
import IconButton from "material-ui/IconButton";
import SearchVerIcon from "material-ui/svg-icons/action/search";
import BackspaceIcon from "material-ui/svg-icons/hardware/keyboard-backspace";
import MenuIcon from "material-ui/svg-icons/navigation/menu";
import FlatButton from "material-ui/FlatButton";
import { Motion, spring } from "react-motion";

import AppNavDrawer from "./AppNavDrawer";
import SendButton from "./SendButton";
import SearchAutoComplete from "../../Search/components/SearchAutoComplete";
import makeLogInDialogable from "../../User/components/LogInDialog/makeLogInDialogable";

const LogInDialogButton = makeLogInDialogable(FlatButton);
LogInDialogButton.muiName = "FlatButton";

const LeftElementMotionWrap = props => {
  const defaultStyle = {
    deg: props.initDeg || 45
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
        return <div style={divStyle}>{props.children}</div>;
      }}
    </Motion>
  );
};

const BackspaceButton = props => {
  return (
    <LeftElementMotionWrap>
      <IconButton {...props}>
        <BackspaceIcon />
      </IconButton>
    </LeftElementMotionWrap>
  );
};

BackspaceButton.muiName = "IconButton";

const MenuButton = props => {
  return (
    <LeftElementMotionWrap initDeg={-45}>
      <IconButton {...props}>
        <MenuIcon />
      </IconButton>
    </LeftElementMotionWrap>
  );
};

MenuButton.muiName = "IconButton";

class Header extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    defaultQuery: "",
    title: ""
  };

  constructor(props) {
    super(props);
    this.shouldBackspaceButton = memoize(this.shouldBackspaceButton.bind(this));
    let defaultQuery = "";
    if (this._isInSearchPage()) {
      defaultQuery = props.location.query.query;
    }
    const open = props.browser.greaterThan.medium;
    this.state = {
      open,
      prevQuery: "",
      textValue: defaultQuery || "",
      textFieldFocused: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const nextState = {};
    if (nextProps.browser !== this.props.browser) {
      const open = nextProps.browser.greaterThan.medium;
      if (this.state.open !== open) {
        nextState.open = open;
      }
    }
    if (Object.keys(nextState).length > 0) {
      this.setState(nextState);
    }
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
      const { query } = this.props.location.query;
      if (this.state.textValue === "" && query) {
        this.setState({ textValue: query });
      }
    }
  }

  getIconStyles = () => {
    const { prepareStyles } = this.context.muiTheme;
    const iconStyle = appBarGetStyles(this.props, this.context);
    return prepareStyles(iconStyle);
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
    return /^\/search/.test(this.props.location.pathname);
  };

  handleRequestChangeNavDrawer = open => {
    if (this.props.browser.lessThan.medium) {
      this.setState({ open });
    } else {
      if (!(this.state.open && this.props.browser.greaterThan.medium)) {
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
    const createPage = new RegExp("^/(create)/.+");
    const etcPage = new RegExp("^/(setting|about|search)");
    const discussionDetailPage = new RegExp("^/rootDiscussions/(.+)");
    const wikiDetailPage = new RegExp("^/rootWikis/(.+)/wikis/(.+)");
    const enableBackspaceButtonRules = [
      createPage,
      etcPage,
      discussionDetailPage,
      wikiDetailPage
    ];
    const enableBackspaceButton = enableBackspaceButtonRules.some(regexp =>
      regexp.test(pathname)
    );
    return enableBackspaceButton;
  };

  handleSearchIconTouchTap = e => {
    if (e.nativeEvent.which === 3) {
      return;
    }
    e.preventDefault();
    this.context.router.push("/search");
  };

  renderIconLeftElement = () => {
    const enableBackspaceButton = this.shouldBackspaceButton(
      this.props.location.pathname
    );
    if (enableBackspaceButton) {
      return <BackspaceButton onTouchTap={this.handleBack} />;
    }
    return <MenuButton onTouchTap={this.handleToggle} />;
  };

  renderIconRightElement = () => {
    const { pathname } = this.props.location;
    const enableSendButtonRules = [/\/create/, /\update/];
    const enableSendButton = enableSendButtonRules.some(regexp =>
      regexp.test(pathname)
    );
    if (enableSendButton) {
      return <SendButton />;
    }
    const { browser } = this.props;
    if (browser.lessThan.medium) {
      return (
        <IconButton
          onTouchTap={this.handleSearchIconTouchTap}
          onClick={e => e.preventDefault()}
          href="/search"
        >
          <SearchVerIcon />
        </IconButton>
      );
    } else {
      return <LogInDialogButton label="登入" primary={true} />;
    }
  };

  render() {
    const { open } = this.state;
    const selectedIndex = this.props.location.pathname;
    let { title } = this.props;
    if (this._isInSearchPage()) {
      title = <SearchAutoComplete />;
    }
    return (
      <div>
        <AppBar
          zDepth={this.props.browser.lessThan.medium ? 0 : 1}
          style={this.props.appBarStyle}
          title={title}
          iconElementLeft={this.renderIconLeftElement()}
          iconElementRight={this.renderIconRightElement()}
        />
        <AppNavDrawer
          browser={this.props.browser}
          selectedIndex={selectedIndex}
          open={open}
          docked={this.props.browser.greaterThan.medium}
          onRequestChangeNavDrawer={this.handleRequestChangeNavDrawer}
        />
      </div>
    );
  }
}

export default Header;
