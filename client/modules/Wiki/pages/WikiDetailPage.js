import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";
import { fetchWiki } from "../WikiActions";
import { fetchRootWikiById } from "../../RootWiki/RootWikiActions";
import { getWiki } from "../WikiReducer";
import { getRootWiki } from "../../RootWiki/RootWikiReducer";
import { setHeaderTitle } from "../../MyApp/MyAppActions";
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
    const { title, wiki, wikiId, rootWikiId, enableEdit } = this.props;
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
          enableEdit={enableEdit}
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
    const { wikiId } = params;
    return wikiId ? fetchWiki(wikiId) : emptyThunkAction;
  })
  .concat(params => {
    const { rootWikiId } = params;
    return rootWikiId ? fetchRootWikiById(rootWikiId) : emptyThunkAction;
  });

function mapStateToProps(store, props) {
  const { wikiId, rootWikiId } = props.params;
  let { enableEdit } = props.location.query;
  enableEdit = enableEdit === true;
  const wiki = getWiki(store, wikiId);
  const rootWiki = getRootWiki(store, rootWikiId);
  const title = rootWiki ? rootWiki.get("name") : "維基";
  const browser = store.browser;
  return {
    browser,
    title,
    wikiId,
    wiki,
    rootWikiId,
    rootWiki,
    enableEdit
  };
}

export default connect(mapStateToProps)(WikiDetailPage);
