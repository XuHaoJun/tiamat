import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";
import { is } from "immutable";

import { fetchWikiByRouterProps } from "../WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getWikiByRouterProps } from "../WikiReducer";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
import CenterCircularProgress from "../../../components/CenterCircularProgress";
import WikiDetailTabs, {
  WIKI_CONTENT_SLIDE,
  WIKI_HITSTORY_SLIDE
} from "../components/WikiDetailTabs/WikiDetailTabs";

function getTitle({ rootWiki }) {
  if (rootWiki) {
    return rootWiki.get("name");
  } else {
    return "Loading...";
  }
}

class WikiDetailPage extends React.Component {
  static defaultProps = {
    title: "Loading...",
    wikiId: "",
    wiki: null
  };

  static getInitialAction({ routerProps }) {
    return async (dispatch, getState) => {
      const _setHeaderTitle = () => {
        const state = getState();
        const wiki = getWikiByRouterProps(state, routerProps);
        if (wiki) {
          const rootWiki = getRootWiki(state, wiki.get("rootWiki"));
          const title = getTitle({ rootWiki });
          return setHeaderTitle(title);
        } else {
          return setHeaderTitle("Loading...");
        }
      };
      dispatch(_setHeaderTitle());
      await dispatch(fetchWikiByRouterProps(routerProps));
      const wiki = getWikiByRouterProps(getState(), routerProps);
      if (wiki) {
        const rootWikiId = wiki.get("rootWiki");
        await dispatch(fetchRootWikiById(rootWikiId));
        return dispatch(_setHeaderTitle());
      } else {
        return Promise.resolve(null);
      }
    };
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (!is(this.props, nextProps)) {
      this.fetchComponentData(nextProps);
    }
  }

  fetchComponentData = (props = this.props) => {
    if (props.fetchComponentData) {
      return props.fetchComponentData();
    } else {
      return null;
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
    const { browser } = this.props;
    return (
      <div>
        <Helmet title={helmetTitle} />
        <WikiDetailTabs
          scrollKey="WikiDetailPage/WikiDetailTabs"
          wikiId={wikiId}
          rootWikiId={rootWikiId}
          browser={browser}
        />
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const wiki = getWikiByRouterProps(state, routerProps);
  let { rootWikiId } = routerProps.params;
  if (!rootWikiId) {
    if (wiki) {
      rootWikiId = wiki.get("rootWiki");
    }
  }
  const rootWiki = getRootWiki(state, rootWikiId);
  const { browser } = state;
  const wikiId = wiki ? wiki.get("_id") : routerProps.params.wikiId;
  const wikiName = wiki ? wiki.get("name") : routerProps.params.wikiName;
  return {
    browser,
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

export default connect(mapStateToProps, mapDispatchToProps)(WikiDetailPage);
