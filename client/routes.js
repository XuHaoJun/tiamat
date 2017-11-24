/* eslint-disable global-require */
import React from "react";
import { Route, IndexRoute } from "react-router";
import MyApp from "./modules/MyApp/MyApp";
import Loadable from "react-loadable";
import Loading from "./components/CenterCircularProgress";

// FIXME
// can't wrap loading option by function
export const HomePage = Loadable({
  loader: () => import("./modules/Home/pages/HomePage"),
  loading: Loading
});
export const MixedMainPage = Loadable({
  loader: () => import("./modules/MixedMain/pages/MixedMainPage"),
  loading: Loading
});
export const DiscussionDetailPage = Loadable({
  loader: () => import("./modules/Discussion/pages/DiscussionDetailPage"),
  loading: Loading
});
export const EditRootWikiGroupTreePage = Loadable({
  loader: () => import("./modules/RootWiki/pages/EditRootWikiGroupTreePage"),
  loading: Loading
});
export const UpsertDiscussionPage = Loadable({
  loader: () => import("./modules/Discussion/pages/UpsertDiscussionPage"),
  loading: Loading
});
export const CreateForumBoardPage = Loadable({
  loader: () => import("./modules/ForumBoard/pages/CreateForumBoardPage"),
  loading: Loading
});
export const CreateRootWikiPage = Loadable({
  loader: () => import("./modules/RootWiki/pages/CreateRootWikiPage"),
  loading: Loading
});
export const CreateWikiPage = Loadable({
  loader: () => import("./modules/Wiki/pages/CreateWikiPage"),
  loading: Loading
});
export const SettingDetailPage = Loadable({
  loader: () => import("./modules/Setting/pages/SettingDetailPage"),
  loading: Loading
});
export const WikiDetailPage = Loadable({
  loader: () => import("./modules/Wiki/pages/WikiDetailPage"),
  loading: Loading
});
export const UserSignUpPage = Loadable({
  loader: () => import("./modules/User/pages/UserSignUpPage"),
  loading: Loading
});
export const UserLogInPage = Loadable({
  loader: () => import("./modules/User/pages/UserLogInPage"),
  loading: Loading
});
export const UserOauth2CallbackPage = Loadable({
  loader: () => import("./modules/User/pages/UserOauth2CallbackPage"),
  loading: Loading
});
export const SearchHomePage = Loadable({
  loader: () => import("./modules/Search/pages/SearchHomePage"),
  loading: Loading
});
export const AboutPage = Loadable({
  loader: () => import("./modules/About/pages/AboutPage"),
  loading: Loading
});
export const NotFoundPage = Loadable({
  loader: () => import("./modules/Error/pages/NotFoundPage"),
  loading: Loading
});

// require.ensure polyfill for node
if (typeof require.ensure !== "function") {
  require.ensure = function requireModule(deps, callback) {
    callback(require);
  };
}

/* Workaround for async react routes to work with react-hot-reloader till
  and it fixed in react-router v4 but react-router-scroll must use v3.
  https://github.com/reactjs/react-router/issues/2182 and
  https://github.com/gaearon/react-hot-loader/issues/288 is fixed.
 */
if (process.env.NODE_ENV !== "production") {
  // Require async routes only in development for react-hot-reloader to work.
  require("./modules/Home/pages/HomePage");
  require("./modules/Search/pages/SearchHomePage");
  require("./modules/About/pages/AboutPage");
  require("./modules/User/pages/UserLogInPage");
  require("./modules/User/pages/UserOauth2CallbackPage");
  require("./modules/User/pages/UserSignUpPage");
  require("./modules/ForumBoard/pages/CreateForumBoardPage");
  require("./modules/Wiki/pages/CreateWikiPage");
  require("./modules/Wiki/pages/WikiDetailPage");
  require("./modules/RootWiki/pages/CreateRootWikiPage");
  require("./modules/MixedMain/pages/MixedMainPage");
  require("./modules/Discussion/pages/UpsertDiscussionPage");
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
    <Route path="/setting" component={SettingDetailPage} />
    <Route
      path="/forumBoards/:forumBoardId/rootDiscussions/:parentDiscussionId"
      component={DiscussionDetailPage}
    />
    <Route
      path="/rootDiscussions/:parentDiscussionId"
      component={DiscussionDetailPage}
    />
    <Route
      path="/forumBoards/:forumBoardId/rootDiscussions"
      component={MixedMainPage}
    />
    <Route
      path="/rootWikis/:rootWikiId/wikis/:wikiId"
      component={WikiDetailPage}
    />
    <Route path="/rootWikis/:rootWikiId/wikis" component={MixedMainPage} />
    <Route path="/rootWikis/:rootWikiId" component={MixedMainPage} />
    <Route
      path="/edit/rootWikis/:rootWikiId/rootWikiGroupTree"
      component={EditRootWikiGroupTreePage}
    />
    <Route
      path="/create/forumBoards/:forumBoardId/rootDiscussion"
      component={UpsertDiscussionPage}
    />
    <Route
      path="/create/rootDiscussions/:parentDiscussionId/childDiscussion"
      component={UpsertDiscussionPage}
    />
    <Route
      path="/update/discussions/:discussionId"
      component={UpsertDiscussionPage}
    />
    <Route path="/create/forumBoard" component={CreateForumBoardPage} />
    <Route
      path="/create/forumBoards/:forumBoardId/rootWiki"
      component={CreateRootWikiPage}
    />
    <Route
      path="/create/forumBoards/:forumBoardId/rootWikis/:rootWikiId/wiki"
      component={CreateWikiPage}
    />
    <Route path="/signup" component={UserSignUpPage} />
    <Route path="/login" component={UserLogInPage} />
    <Route
      path="/api/oauth2/:providerName/callback"
      component={UserOauth2CallbackPage}
    />
    <Route path="/search" component={SearchHomePage} />
    <Route path="/about" component={AboutPage} />
    <Route path="*" component={NotFoundPage} />
  </Route>
);
