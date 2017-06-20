import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// Import Components
import Helmet from 'react-helmet';
import {getUserAgent} from '../UserAgent/UserAgentReducer';
import {getUI} from './MyAppReducer';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Header from './components/Header';
import spacing from 'material-ui/styles/spacing';
import ErrorSnackbar from '../Error/components/ErrorSnackbar';

export function getStyles(browser) {
  const styles = {
    appBar: {
      position: 'fixed',
      top: 0
    },
    root: {
      minHeight: '100%',
      height: 'auto',
      marginTop: spacing.desktopKeylineIncrement
    },
    content: {
      margin: spacing.desktopGutter
    },
    contentWhenMedium: {
      margin: `${spacing.desktopGutter}px ${spacing.desktopGutter * 2}px`
    },
    disableRoot: {},
    disableContent: {}
  };
  if (browser.greaterThan.medium) {
    styles.root.paddingLeft = 256;
    styles.disableRoot.paddingLeft = -1 * styles.root.paddingLeft;
    styles.content = Object.assign(styles.content, styles.contentWhenMedium);
    const topdown = -spacing.desktopGutter;
    const leftright = -2 * spacing.desktopGutter;
    styles.disableContent = {
      margin: `${topdown}px ${leftright}px`
    };
  } else {
    styles.disableContent.margin = -1 * styles.content.margin;
    // styles.root.userSelect = 'none';
  }
  styles.disableRoot.paddingTop = -1 * styles.root.paddingTop;
  return styles;
}

export class MyApp extends React.Component {
  componentDidMount() {
    if (typeof window === 'object' && typeof document === 'object') {
      const backgroundColor = this
        .props
        .ui
        .getIn(['styles', 'body', 'backgroundColor']);
      document.body.style.backgroundColor = backgroundColor;
    }
  }

  componentWillUnmount() {
    if (typeof window === 'object' && typeof document === 'object') {
      document.body.style.backgroundColor = null;
    }
  }

  getStyles = (browser) => {
    return getStyles(browser);
  }

  getMuiTheme = () => {
    const muiTheme = getMuiTheme({fontFamily: '"Noto Sans TC", "Helvetica Neue", "Calibri Light", Roboto, sans-serif, sans-serif', userAgent: this.props.userAgent});
    return muiTheme;
  }

  getHeadMeta = () => {
    return [
      {
        charset: 'utf-8'
      }, {
        'http-equiv': 'X-UA-Compatible',
        content: 'IE=edge'
      }, {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=0, maximum-scale=1, minimum-scale=1'
      }, {
        name: 'mobile-web-app-capable',
        content: 'yes'
      }, {
        name: 'apple-mobile-web-app-capable',
        content: 'yes'
      }, {
        name: 'format-detection',
        content: 'telphone=no, email=no'
      }, {
        name: 'theme-color',
        content: '#0097a7'
      }
    ];
  }

  render() {
    const styles = this.getStyles(this.props.browser);
    const muiTheme = this.getMuiTheme();
    const meta = this.getHeadMeta();
    const headerTitle = this
      .props
      .ui
      .get('headerTitle');
    return (
      <div>
        <Helmet titleTemplate="%s - Tiamat 電玩資訊站" meta={meta}/>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <ErrorSnackbar/>
            <Header
              title={headerTitle}
              appBarStyle={styles.appBar}
              browser={this.props.browser}
              location={this.props.location}
              dispatch={this.props.dispatch}/>
            <div style={styles.root}>
              {this.props.children}
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

MyApp.propTypes = {
  children: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  // intl: PropTypes.object.isRequired
};

// Retrieve data from store as props
function mapStateToProps(store, props) {
  const {intl, browser} = store;
  const userAgent = getUserAgent(store);
  const location = props.location;
  const ui = getUI(store);
  return {ui, intl, browser, userAgent, location};
}

export default connect(mapStateToProps)(MyApp);
