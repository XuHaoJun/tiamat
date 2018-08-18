import Loadable from 'react-loadable';
import Loading from '../../components/CenterCircularProgress';

const HomePage = Loadable({
  loader: () => import(/* webpackChunkName: "HomePage" */ './pages/HomePage'),
  loading: Loading,
});

const routes = [
  {
    path: '/',
    exact: true,
    component: HomePage,
  },
];

export default routes;
