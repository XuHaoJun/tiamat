import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";

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
  static defaultProps = {
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
    if (this.props.location !== nextProps.location) {
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
  let { rootWikiId } = routerProps.params;
  if (!rootWikiId) {
    if (wiki) {
      rootWikiId = wiki.get("rootWiki");
    }
  }
  const rootWiki = getRootWiki(state, rootWikiId);
  const wikiId = wiki ? wiki.get("_id") : routerProps.params.wikiId;
  const wikiName = wiki ? wiki.get("name") : routerProps.params.wikiName;
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

const Styled = withStyles(styles)(WikiDetailPage);

export default connect(mapStateToProps, mapDispatchToProps)(Styled);
