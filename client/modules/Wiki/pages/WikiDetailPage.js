import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";
import { hot } from "react-hot-loader";

import compose from "recompose/compose";
import { withStyles } from "material-ui-next/styles";
import slideHeightStyle from "../../MyApp/styles/slideHeight";

import CenterCircularProgress from "../../../components/CenterCircularProgress";
import WikiDetailTabs, {
  WIKI_CONTENT_SLIDE,
  WIKI_HITSTORY_SLIDE
} from "../components/WikiDetailTabs/WikiDetailTabs";

import { fetchWikiByRouterProps } from "../WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getWikiByRouterProps } from "../WikiReducer";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";
import { setHeaderTitle } from "../../MyApp/MyAppActions";

function getTitle({ rootWiki }) {
  if (rootWiki) {
    return rootWiki.get("name");
  } else {
    return "Loading...";
  }
}

export const styles = theme => {
  return {
    slideHeight: slideHeightStyle(theme, {
      withTab: true,
      withAppBar: true
    }).slideHeight,
    slideHeightWithoutAppBar: slideHeightStyle(theme, {
      withTab: true,
      withAppBar: false
    }).slideHeight
  };
};

class WikiDetailPage extends React.Component {
  static getInitialAction({ routerProps }) {
    return async (dispatch, getState) => {
      const _setHeaderTitle = state => {
        const { rootWikiId: rootWikiIdInput } = routerProps.match.params;
        const wiki = getWikiByRouterProps(state, routerProps);
        const rootWikiId = wiki ? wiki.rootWiki : rootWikiIdInput;
        const rootWiki = getRootWiki(state, rootWikiId);
        const title = getTitle({ rootWiki });
        return setHeaderTitle(title);
      };
      dispatch(_setHeaderTitle(getState()));
      await dispatch(fetchWikiByRouterProps(routerProps));
      const wiki = getWikiByRouterProps(getState(), routerProps);
      if (wiki) {
        const rootWikiId = wiki.rootWiki;
        await dispatch(fetchRootWikiById(rootWikiId));
        dispatch(_setHeaderTitle(getState()));
      }
    };
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.url !== nextProps.location.url) {
      this.fetchComponentData(nextProps);
    }
  }

  fetchComponentData = (props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData();
    } else {
      return Promise.resolve(null);
    }
  };

  render() {
    const { wiki, wikiId, rootWikiId } = this.props;
    if (!wiki) {
      return <CenterCircularProgress />;
    }
    const name = wiki ? wiki.get("name") : "Loading...";
    const title = getTitle(this.props);
    const helmetTitle = `${name} - ${title}`;
    return (
      <div>
        <Helmet title={helmetTitle} />
        <WikiDetailTabs
          // ui
          id="WikiDetailPage/WikiDetailTabs"
          slideClassName={this.props.classes.slideHeight}
          // data
          wikiId={wikiId}
          rootWikiId={rootWikiId}
        />
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const wiki = getWikiByRouterProps(state, routerProps);
  let { rootWikiId } = routerProps.match.params;
  if (!rootWikiId) {
    if (wiki) {
      rootWikiId = wiki.get("rootWiki");
    }
  }
  const rootWiki = getRootWiki(state, rootWikiId);
  const wikiId = wiki ? wiki._id : routerProps.match.params.wikiId;
  const wikiName = wiki ? wiki.name : routerProps.match.params.wikiName;
  return {
    wikiId,
    wikiName,
    wiki,
    rootWikiId,
    rootWiki
  };
}

function mapDispatchToProps(dispatch, routerProps) {
  return {
    fetchComponentData() {
      const action = WikiDetailPage.getInitialAction({ routerProps });
      return dispatch(action);
    }
  };
}

export default compose(
  hot(module),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(WikiDetailPage);
