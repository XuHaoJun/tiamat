import React, {Component} from 'react';
import memoize from 'fast-memoize';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import {getStyles as appBarGetStyles} from 'material-ui/AppBar/AppBar';
import AppNavDrawer from './AppNavDrawer';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import SearchVerIcon from 'material-ui/svg-icons/action/search';
import BackspaceIcon from 'material-ui/svg-icons/hardware/keyboard-backspace';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import {Motion, spring} from 'react-motion';
import SendButton from './SendButton';
import SearchAutoComplete from '../../Search/components/SearchAutoComplete';

const LeftElementMotionWrap = (props) => {
  const defaultStyle = {
    deg: props.initDeg || 45
  };
  const style = {
    deg: spring(0, {
      stiffness: 500,
      damping: 30
    })
  };
  return (
    <Motion defaultStyle={defaultStyle} style={style}>
      {
        ({deg}) => {
          const divStyle = {
            transform: `rotate(${deg}deg)`
          };
          return (
            <div style={divStyle}>
              {props.children}
            </div>
          );
        }
      }
    </Motion>
  );
};

const BackspaceButton = (props) => {
  const iconStyle = {
    color: 'rgb(255, 255, 255)'
  };
  return (
    <LeftElementMotionWrap>
      <IconButton iconStyle={iconStyle} {...props}>
        <BackspaceIcon/>
      </IconButton>
    </LeftElementMotionWrap>
  );
};

const MenuButton = (props) => {
  const iconStyle = {
    color: 'rgb(255, 255, 255)'
  };
  return (
    <LeftElementMotionWrap initDeg={-45}>
      <IconButton iconStyle={iconStyle} {...props}>
        <MenuIcon/>
      </IconButton>
    </LeftElementMotionWrap>
  );
};

class Header extends Component {
  static propTypes = {
    browser: PropTypes.object
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    defaultQuery: '',
    title: ''
  };

  constructor(props) {
    super(props);
    this.shouldBackspaceButton = memoize(this.shouldBackspaceButton.bind(this));
    let defaultQuery = '';
    if (this._isInSearchPage()) {
      defaultQuery = props.location.query.query;
    }
    this.state = {
      open: this.props.browser.greaterThan.medium,
      prevQuery: '',
      textValue: defaultQuery || '',
      textFieldFocused: false
    };
  }

  componentDidUpdate() {
    if (!this._isInSearchPage() && this.state.textValue !== '' && !this.state.textFieldFocused) {
      this.setState({textValue: ''});
    }
    if (this._isInSearchPage() && this.state.textFieldFocused === false) {
      const query = this.props.location.query.query;
      if (this.state.textValue === '' && query) {
        this.setState({textValue: query});
      }
    }
  }

  _isInSearchPage = () => {
    return /^\/search/.test(this.props.location.pathname);
  };

  handleTextChange = (event) => {
    const v = event.target.value;
    this.setState({textValue: v});
    if (v === '' && !this.state.textFieldFocused) {
      // this.props.dispatch(clientInitSearchResults());
    }
  };

  handleFocus = () => {
    this.setState({textFieldFocused: true});
  };

  handleBlur = () => {
    this.setState({textFieldFocused: false});
  };

  _fetchSearchResults = (v) => {
    const noSendRegex = /[\\/ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ]/g;
    const query = v.replace(noSendRegex, '');
    this.setState({textValue: query});
    // it will trigger search page and query it.
    let routerAction;
    if (this._isInSearchPage()) {
      routerAction = this.context.router.replace;
    } else {
      routerAction = this.context.router.push;
    }
    if (query === '') {
      return;
    }
    routerAction(`/search?query=${query}`);
  };

  handleOnSubmit = (e) => {
    e.preventDefault();
    this._fetchSearchResults(this.state.textValue);
    if (this._textField) {
      this
        ._textField
        .blur();
    }
  };

  _bindTextField = (tf) => {
    this._textField = tf;
  };

  handleBack = () => {
    setTimeout(this.context.router.goBack, 0);
  }

  getIconStyles = () => {
    const {prepareStyles} = this.context.muiTheme;
    const iconStyle = appBarGetStyles(this.props, this.context);
    return prepareStyles(iconStyle);
  }

  handleRequestChangeNavDrawer = (open) => {
    if (this.props.browser.lessThan.medium) {
      this.setState({open});
    } else {
      if (!(this.state.open && this.props.browser.greaterThan.medium)) {
        this.setState({open});
      }
    }
  };

  handleToggle = () => this.setState({
    open: !this.state.open
  });

  handleClose = () => this.setState({open: false});

  shouldBackspaceButton = (pathname) => {
    const createPage = new RegExp('^/(create)/.+');
    const etcPage = new RegExp('^/(setting|about|search)');
    const discussionDetailPage = new RegExp('^/forumBoards/(.+)/rootDiscussions/(.+)');
    const wikiDetailPage = new RegExp('^/rootWikis/(.+)/wikis/(.+)');
    const enableBackspaceButtonRules = [createPage, etcPage, discussionDetailPage, wikiDetailPage];
    const enableBackspaceButton = enableBackspaceButtonRules.some(regexp => regexp.test(pathname));
    return enableBackspaceButton;
  }

  renderIconLeftElement = () => {
    const enableBackspaceButton = this.shouldBackspaceButton(this.props.location.pathname);
    if (enableBackspaceButton) {
      return (<BackspaceButton onTouchTap={this.handleBack}/>);
    }
    return (<MenuButton onTouchTap={this.handleToggle}/>);
  };

  handleSearchIconTouchTap = (e) => {
    if (e.nativeEvent.which === 3) {
      return;
    }
    e.preventDefault();
    this.context.router.push('/search');
  }

  renderIconRightElement = () => {
    const pathname = this.props.location.pathname;
    const enableSendButtonRules = [/\/create/];
    const enableSendButton = enableSendButtonRules.some(regexp => regexp.test(pathname));
    if (enableSendButton) {
      const {prepareStyles} = this.context.muiTheme;
      const styles = prepareStyles(appBarGetStyles(this.props, this.context));
      return (<SendButton iconStyle={styles.iconButtonIconStyle}/>);
    }
    return (
      <IconButton onTouchTap={this.handleSearchIconTouchTap} href="/search"><SearchVerIcon/></IconButton>
    );
  }

  render() {
    const open = this.state.open;
    const selectedIndex = this.props.location.pathname;
    const title = (<SearchAutoComplete/>);
    return (
      <div>
        <AppBar
          zDepth={0}
          style={this.props.appBarStyle}
          title={title}
          iconElementRight={this.renderIconRightElement()}
          showMenuIconButton={true}
          iconElementLeft={this.renderIconLeftElement()}/>
        <AppNavDrawer
          browser={this.props.browser}
          selectedIndex={selectedIndex}
          open={open}
          docked={this.props.browser.greaterThan.medium}
          onRequestChangeNavDrawer={this.handleRequestChangeNavDrawer}/>
      </div>
    );
  }
}

export default Header;
