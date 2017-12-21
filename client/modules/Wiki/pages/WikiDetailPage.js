import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";

import { fetchWiki } from "../WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getWiki } from "../WikiReducer";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";
import { setHeaderTitle, setHeaderTitleThunk } from "../../MyApp/MyAppActions";
import CenterCircularProgress from "../../../components/CenterCircularProgress";
import WikiDetailTabs, {
  WIKI_CONTENT_SLIDE,
  WIKI_HITSTORY_SLIDE
} from "../components/WikiDetailTabs/WikiDetailTabs";

class WikiDetailPage extends React.Component {
  static defaultProps = {
    title: "維基",
    wikiId: "",
    wiki: null
  };

  componentDidMount() {
    const { title } = this.props;
    this.props.dispatch(setHeaderTitle(title));
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.title !== nextProps.title) {
      nextProps.dispatch(setHeaderTitle(nextProps.title));
    }
    if (
      this.props.wikiId !== nextProps.wikiId ||
      this.props.rootWikiId !== nextProps.rootWikiId
    ) {
      this.fetchData(nextProps);
    }
  }

  fetchData = currentProps => {
    const { wikiId, rootWikiId } = currentProps;
    currentProps.dispatch(fetchWiki(wikiId));
    currentProps.dispatch(fetchRootWikiById(rootWikiId));
  };

  render() {
    const { title, wiki, wikiId, rootWikiId } = this.props;
    if (!wiki) {
      return <CenterCircularProgress />;
    }
    const name = wiki ? wiki.get("name") : "Loading...";
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

const emptyThunkAction = () => {
  return Promise.resolve(null);
};

WikiDetailPage.need = []
  .concat(params => {
    const { wikiId, rootWikiId } = params;
    return dispatch => {
      const wikiThunk = wikiId ? fetchWiki(wikiId) : emptyThunkAction;
      const rootWikiThunk = rootWikiId
        ? fetchRootWikiById(rootWikiId)
        : emptyThunkAction;
      return Promise.all([wikiThunk(dispatch), rootWikiThunk(dispatch)]);
    };
  })
  .concat((params, state) => {
    const { wikiId } = params;
    const wiki = getWiki(state, wikiId);
    if (wiki) {
      const rootWikiId = wiki.get("rootWiki");
      const rootWiki = getRootWiki(state, rootWikiId);
      if (!rootWiki) {
        return fetchRootWikiById(rootWikiId);
      }
    }
    return emptyThunkAction;
  })
  .concat((params, state) => {
    const { wikiId } = params;
    let { rootWikiId } = params;
    if (!rootWikiId) {
      const wiki = getWiki(state, wikiId);
      if (wiki) {
        rootWikiId = wiki.get("rootWiki");
      }
    }
    const rootWiki = getRootWiki(state, rootWikiId);
    const title = rootWiki ? rootWiki.get("name") : undefined;
    return title ? setHeaderTitleThunk(title) : emptyThunkAction;
  });

function mapStateToProps(store, routerProps) {
  const { wikiId } = routerProps.params;
  let { rootWikiId } = routerProps.params;
  const wiki = getWiki(store, wikiId);
  if (!rootWikiId) {
    if (wiki) {
      rootWikiId = wiki.get("rootWiki");
    }
  }
  const rootWiki = getRootWiki(store, rootWikiId);
  const title = rootWiki ? rootWiki.get("name") : "";
  const { browser } = store;
  return {
    browser,
    title,
    wikiId,
    wiki,
    rootWikiId,
    rootWiki
  };
}

export default connect(mapStateToProps)(WikiDetailPage);
