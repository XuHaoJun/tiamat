import Loadable from "react-loadable";
import Loading from "../../components/CenterCircularProgress";

const SettingDetailPage = Loadable({
  loader: () =>
    import(/* webpackChunkName: "SettingDetailPage" */ "./pages/SettingDetailPage"),
  loading: Loading
});

const routes = [
  {
    path: "/settings",
    exact: true,
    component: SettingDetailPage
  },
  {
    path: "/setting",
    exact: true,
    component: SettingDetailPage
  }
];

export default routes;
