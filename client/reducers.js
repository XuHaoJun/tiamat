/**
 * Root Reducer
 */
import {combineReducers} from 'redux';

// Import Reducers
import app from './modules/MyApp/MyAppReducer';
import user from './modules/User/UserReducer';
import search from './modules/Search/SearchReducer';
import intl from './modules/Intl/IntlReducer';
import userAgent from './modules/UserAgent/UserAgentReducer';
import oauth2Client from './modules/Oauth2Client/Oauth2ClientReducer';
import browser from './modules/Browser/BrowserReducer';
import wikis from './modules/Wiki/WikiReducer';
import rootWikis from './modules/RootWiki/RootWikiReducer';
import errors from './modules/Error/ErrorReducer';
import forumBoards from './modules/ForumBoard/ForumBoardReducer';
import discussions from './modules/Discussion/DiscussionReducer';
import semanticRules from './modules/SemanticRule/SemanticRuleReducer';
import sockets from './modules/Socket/SocketReducer';
import {routerReducer as routing} from 'react-router-redux';

export function getReducersMapping() {
  return {
    app,
    user,
    search,
    intl,
    userAgent,
    oauth2Client,
    browser,
    routing,
    rootWikis,
    wikis,
    errors,
    forumBoards,
    discussions,
    semanticRules,
    sockets
  };
}

// Combine all reducers into one root reducer
export default combineReducers(getReducersMapping());
