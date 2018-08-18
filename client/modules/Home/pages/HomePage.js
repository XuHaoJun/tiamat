import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { hot } from 'react-hot-loader';

import { replace } from 'react-router-redux';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import slideHeightStyle from '../../MyApp/styles/slideHeight';
import HomeTabs, {
  HOME_SLIDE,
  SLIDE_COUNT,
  getSlideIndexEnAlias,
  getSlideIndexFromEnAlias,
} from '../components/HomeTabs';

import { setHeaderTitle, setCurrentPage } from '../../MyApp/MyAppActions';
import { fetchForumBoards } from '../../ForumBoard/ForumBoardActions';

export const styles = theme => {
  return {
    slideHeight: slideHeightStyle(theme, {
      withTab: true,
      withAppBar: true,
    }).slideHeight,
    slideHeightWithoutAppBar: slideHeightStyle(theme, {
      withTab: true,
      withAppBar: false,
    }).slideHeight,
  };
};

class HomePage extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };

  static defaultProps = {
    title: 'Tiamat',
  };

  static PAGE_NAME = 'HomePage';

  static getInitialAction() {
    return dispatch => {
      dispatch(setHeaderTitle(HomePage.defaultProps.title));
      return dispatch(fetchForumBoards());
    };
  }

  componentDidMount() {
    this.props.setCurrentPage();
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.fetchComponentData(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  fetchComponentData = (props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData();
    } else {
      return null;
    }
  };

  handleTransitionEnd = slideIndex => {
    if (this.timeout) clearTimeout(this.timeout);
    if (slideIndex === HOME_SLIDE) {
      this.timeout = setTimeout(() => {
        this.props.dispatch(replace('/'));
      }, 100);
    } else {
      this.timeout = setTimeout(() => {
        const slideIndexEN = getSlideIndexEnAlias(slideIndex);
        this.props.dispatch(replace(`/?slideIndex=${slideIndexEN}`));
      }, 100);
    }
  };

  render() {
    const { title } = this.props;
    const { slideIndex, classes } = this.props;
    return (
      <React.Fragment>
        <Helmet titleTemplate="" title={title}>
          <meta name="description" content="Tiamat | Game forum and wiki." />
        </Helmet>
        <HomeTabs
          id="HomePage/Tabs"
          slideClassName={classes.slideHeight}
          onTransitionEnd={this.handleTransitionEnd}
          slideIndex={slideIndex}
        />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const { location } = state.routing;
  const slideIndex = (() => {
    const qsi = location.query.slideIndex || 0;
    let si = Number.parseInt(qsi, 10);
    if (!si) {
      si = getSlideIndexFromEnAlias(qsi) || 0;
    }
    if (si > SLIDE_COUNT - 1) {
      si = 0;
    }
    return si;
  })();
  return { slideIndex };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentPage() {
      return dispatch(setCurrentPage(HomePage.PAGE_NAME));
    },
    fetchComponentData() {
      const action = HomePage.getInitialAction();
      return dispatch(action);
    },
    dispatch,
  };
}

export default compose(
  hot(module),
  withStyles(styles, { name: 'HomePage' }),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(HomePage);
