/* eslint-disable global-require */
import React from "react";
import { Route, IndexRoute } from "react-router";
import MyApp from "./modules/MyApp/MyApp";
import MixedMainPage from "./modules/MixedMain/pages/MixedMainPage";
import HomePage from "./modules/Home/pages/HomePage";
import DiscussionDetailPage from "./modules/Discussion/pages/DiscussionDetailPage";

// require.ensure polyfill for node
if (typeof require.ensure !== "function") {
  require.ensure = function requireModule(deps, callback) {
    callback(require);
  };
}

/* Workaround for async react routes to work with react-hot-reloader till
  https://github.com/reactjs/react-router/issues/2182 and
  https://github.com/gaearon/react-hot-loader/issues/288 is fixed.
 */
if (process.env.NODE_ENV !== "production") {
  // Require async routes only in development for react-hot-reloader to work.
  require("./modules/Home/pages/HomePage");
  require("./modules/Search/pages/SearchHomePage");
  require("./modules/About/pages/AboutPage");
  require("./modules/User/pages/UserLoginPage/UserLoginPage");
  require("./modules/User/pages/UserOauth2CallbackPage");
  require("./modules/User/pages/UserSignUpPage");
  require("./components/Editor/Editor");
  require("./components/Slate/Editor");
  require("./components/Slate/Editor2");
  require("./modules/ForumBoard/pages/CreateForumBoardPage");
  require("./modules/Wiki/pages/CreateWikiPage");
  require("./modules/Wiki/pages/WikiDetailPage");
  require("./modules/RootWiki/pages/CreateRootWikiPage");
  require("./modules/MixedMain/pages/MixedMainPage");
  require("./modules/Discussion/pages/CreateRootDiscussionPage");
  require("./modules/Discussion/pages/DiscussionDetailPage");
  require("./modules/Setting/pages/SettingDetailPage");
  require("./modules/Error/pages/NotFoundPage");
  require("./modules/RootWiki/pages/EditRootWikiGroupTreePage");
}

// react-router setup with code-splitting More info:
// http://blog.mxstbr.com/2016/01/react-apps-with-pages/
export default (
  <Route path="/" component={MyApp}>
    <IndexRoute component={HomePage} />
    <Route
      path="/setting"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/Setting/pages/SettingDetailPage").default
          );
        });
      }}
    />
    <Route
      path="/forumBoards/:forumBoardId/rootDiscussions/:parentDiscussionId"
      component={DiscussionDetailPage}
    />
    <Route
      path="/forumBoards/:forumBoardId/rootDiscussions"
      component={MixedMainPage}
    />
    <Route
      path="/rootWikis/:rootWikiId/wikis/:wikiId"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./modules/Wiki/pages/WikiDetailPage").default);
        });
      }}
    />
    <Route path="/rootWikis/:rootWikiId/wikis" component={MixedMainPage} />
    <Route path="/rootWikis/:rootWikiId" component={MixedMainPage} />
    <Route
      path="/edit/rootWikis/:rootWikiId/rootWikiGroupTree"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/RootWiki/pages/EditRootWikiGroupTreePage")
              .default
          );
        });
      }}
    />
    <Route
      path="/create/forumBoards/:forumBoardId/rootDiscussion"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/Discussion/pages/CreateRootDiscussionPage")
              .default
          );
        });
      }}
    />
    <Route
      path="/create/forumBoard"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/ForumBoard/pages/CreateForumBoardPage").default
          );
        });
      }}
    />
    <Route
      path="/create/forumBoards/:forumBoardId/rootWiki"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/RootWiki/pages/CreateRootWikiPage").default
          );
        });
      }}
    />
    <Route
      path="/create/forumBoards/:forumBoardId/rootWikis/:rootWikiId/wiki"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./modules/Wiki/pages/CreateWikiPage").default);
        });
      }}
    />
    <Route
      path="/testEditor3"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./components/Slate/Editor2").default);
        });
      }}
    />
    <Route
      path="/testEditor2"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./components/Slate/Editor").default);
        });
      }}
    />
    <Route
      path="/testEditor"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./components/Editor/Editor").default);
        });
      }}
    />
    <Route
      path="/signup"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./modules/User/pages/UserSignUpPage").default);
        });
      }}
    />
    <Route
      path="/login"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/User/pages/UserLoginPage/UserLoginPage").default
          );
        });
      }}
    />
    <Route
      path="/api/oauth2/:providerName/callback"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(
            null,
            require("./modules/User/pages/UserOauth2CallbackPage").default
          );
        });
      }}
    />
    <Route
      path="/search"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./modules/Search/pages/SearchHomePage").default);
        });
      }}
    />
    <Route
      path="/about"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./modules/About/pages/AboutPage").default);
        });
      }}
    />
    <Route
      path="*"
      getComponent={(nextState, cb) => {
        require.ensure([], require => {
          cb(null, require("./modules/Error/pages/NotFoundPage").default);
        });
      }}
    />
  </Route>
);
