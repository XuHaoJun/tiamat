import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";

import RootWikiTabs from "../components/RootWikiTabs";

import { fetchRootWikiById } from "../RootWikiActions";
import { getRootWiki } from "../RootWikiReducer";

class RootWikiDashboardPage extends React.Component {
  componentDidMount() {
    const { dispatch, rootWikiId } = this.props;
    dispatch(fetchRootWikiById(rootWikiId));
  }

  render() {
    const { rootWiki } = this.props;
    const title = rootWiki.get("name");
    const meta = [
      {
        name: "description",
        content: `Tiamat | ${title}`
      }
    ];
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <RootWikiTabs rootWiki={rootWiki} />
      </div>
    );
  }
}

RootWikiDashboardPage.need = [].concat(params => {
  const { rootWikiId } = params;
  return fetchRootWikiById(rootWikiId);
});

function mapStateToProps(state, routeProps) {
  const { rootWikiId } = routeProps.params;
  const rootWiki = getRootWiki(state, rootWikiId);
  return { rootWikiId, rootWiki };
}

export default connect(mapStateToProps)(RootWikiDashboardPage);
