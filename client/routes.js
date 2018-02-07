/* eslint-disable global-require */
import Loadable from "react-loadable";

import Loading from "./components/CenterCircularProgress";
import MyApp from "./modules/MyApp/MyApp";
import HomeRoutes from "./modules/Home/HomeRoutes";

// FIXME
// can't wrap loading option by function
export const HomePage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "HomePage" */ "./modules/Home/pages/HomePage"),
  loading: Loading
});
export const MixedMainPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "MixedMainPage" */ "./modules/MixedMain/pages/MixedMainPage"),
  loading: Loading
});
export const DiscussionDetailPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "DiscussionDetailPage" */ "./modules/Discussion/pages/DiscussionDetailPage"),
  loading: Loading
});
export const WhatsHotDiscussionsPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "WhatsHotDiscussionsPage" */ "./modules/Discussion/pages/WhatsHotDiscussionsPage"),
  loading: Loading
});
export const EditRootWikiGroupTreePage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "EditRootWikiGroupTreePage" */ "./modules/RootWiki/pages/EditRootWikiGroupTreePage"),
  loading: Loading
});
export const UpsertDiscussionPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UpsertDiscussionPage" */ "./modules/Discussion/pages/UpsertDiscussionPage"),
  loading: Loading
});
export const CreateForumBoardPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "CreateForumBoardPage" */ "./modules/ForumBoard/pages/CreateForumBoardPage"),
  loading: Loading
});
export const CreateRootWikiPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "CreateRootWikiPage" */ "./modules/RootWiki/pages/CreateRootWikiPage"),
  loading: Loading
});
export const CreateWikiPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "CreateWikiPage" */ "./modules/Wiki/pages/CreateWikiPage"),
  loading: Loading
});
export const SettingDetailPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "SettingDetailPage" */ "./modules/Setting/pages/SettingDetailPage"),
  loading: Loading
});
export const RootWikiDashboardPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "RootWikiDetailPage" */ "./modules/RootWiki/pages/RootWikiDashboardPage"),
  loading: Loading
});
export const UpsertRootWikiGroupTreePage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UpsertRootWikiGroupTreePage" */ "./modules/RootWiki/pages/UpsertRootWikiGroupTreePage"),
  loading: Loading
});
export const UpsertWikiDataFormPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UpsertWikiDataFormPage" */ "./modules/RootWiki/pages/UpsertWikiDataFormPage"),
  loading: Loading
});
export const WikiDetailPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "WikiDetailPage" */ "./modules/Wiki/pages/WikiDetailPage"),
  loading: Loading
});
export const UserSignUpPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UserSignUpPage" */ "./modules/User/pages/UserSignUpPage"),
  loading: Loading
});
export const UserLogInPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UserLogInPage" */ "./modules/User/pages/UserLogInPage"),
  loading: Loading
});
export const UserOauth2CallbackPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UserOauth2CallbackPage" */ "./modules/User/pages/UserOauth2CallbackPage"),
  loading: Loading
});
export const SearchHomePage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "SearchHomePage" */ "./modules/Search/pages/SearchHomePage"),
  loading: Loading
});
export const AboutPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "AboutPage" */ "./modules/About/pages/AboutPage"),
  loading: Loading
});
export const UpsertTemplatePage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "UpsertTemplatePage" */ "./modules/Template/pages/UpsertTemplatePage"),
  loading: Loading
});
export const NotFoundPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "NotFoundPage" */ "./modules/Error/pages/NotFoundPage"),
  loading: Loading
});

const concat = (...arrays) => {
  return arrays.reduce((result, array) => {
    return result.concat(array);
  }, []);
};

const routes = [
  {
    component: MyApp,
    routes: concat(HomeRoutes, [
      {
        path: "/settings",
        exact: true,
        component: SettingDetailPage
      },
      {
        path: "/setting",
        exact: true,
        component: SettingDetailPage
      },
      {
        path: "/rootDiscussions/:parentDiscussionId",
        exact: true,
        component: DiscussionDetailPage
      },
      {
        path: "/whatsHotDiscussions",
        exact: true,
        component: WhatsHotDiscussionsPage
      },
      {
        path: "/forumBoards/:forumBoardId/rootDiscussions",
        exact: true,
        component: MixedMainPage,
        targetKind: "rootDiscussions"
      },
      {
        path: "/rootWikis/:rootWikiId/wikis/:wikiName",
        exact: true,
        component: WikiDetailPage
      },
      {
        path: "/rootWikis/:rootWikiId/wikis",
        exact: true,
        component: MixedMainPage,
        targetKind: "wikis"
      },
      {
        path: "/rootWikis/:rootWikiId",
        exact: true,
        component: MixedMainPage,
        targetKind: "rootWiki"
      },
      {
        path: "/wikis/:wikiId",
        exact: true,
        component: WikiDetailPage
      },
      {
        path: "/edit/rootWikis/:rootWikiId/rootWikiGroupTree",
        exact: true,
        component: EditRootWikiGroupTreePage
      },
      {
        path: "/create/rootWikis/:rootWikiId/rootWikiGroupTree",
        exact: true,
        component: UpsertRootWikiGroupTreePage,
        actionType: "create"
      },
      {
        path: "/update/rootWikis/:rootWikiId/rootWikiGroupTree",
        exact: true,
        component: UpsertRootWikiGroupTreePage,
        actionType: "update"
      },
      {
        path: "/create/rootWikis/:rootWikiId/wikiDataForm",
        exact: true,
        component: UpsertWikiDataFormPage,
        actionType: "create"
      },
      {
        path: "/create/rootWikis/:rootWikiId/template",
        exact: true,
        component: UpsertTemplatePage,
        actionType: "create",
        sourceKind: "rootWiki"
      },
      {
        path: "/update/wikiDataForms/:wikiDataFormId",
        exact: true,
        component: UpsertWikiDataFormPage,
        actionType: "update"
      },
      {
        path: "/create/forumBoards/:forumBoardId/rootDiscussion",
        exact: true,
        component: UpsertDiscussionPage,
        actionType: "create",
        targetKind: "rootDiscussion"
      },
      {
        path: "/create/rootDiscussions/:parentDiscussionId/childDiscussion",
        exact: true,
        component: UpsertDiscussionPage,
        actionType: "create",
        targetKind: "childDiscussion"
      },
      {
        path: "/update/discussions/:discussionId",
        exact: true,
        component: UpsertDiscussionPage,
        actionType: "update",
        targetKind: "discussion"
      },
      {
        path: "/create/forumBoard",
        exact: true,
        component: CreateForumBoardPage,
        actionType: "update",
        targetKind: "discussion"
      },
      {
        path: "/create/forumBoards/:forumBoardId/rootWiki",
        exact: true,
        component: CreateRootWikiPage
      },
      {
        path: "/create/forumBoards/:forumBoardId/rootWikis/:rootWikiId/wiki",
        exact: true,
        component: CreateWikiPage
      },
      {
        path: "/signup",
        exact: true,
        component: UserSignUpPage
      },
      {
        path: "/login",
        exact: true,
        component: UserLogInPage
      },
      {
        path: "/api/oauth2/:providerName/callback",
        exact: true,
        component: UserOauth2CallbackPage
      },
      {
        path: "/search",
        exact: true,
        component: SearchHomePage
      },
      {
        path: "/about",
        exact: true,
        component: AboutPage
      },
      {
        path: "*",
        component: NotFoundPage
      }
    ])
  }
];

export default routes;
