import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";

import RootWikiTabs from "../components/RootWikiTabs";

import { fetchRootWikiById } from "../RootWikiActions";
import { getRootWiki } from "../RootWikiReducer";

class RootWikiDashboardPage extends React.Component {
  static getInitialAction({ routerProps }) {
    const { rootWikiId } = routerProps.params;
    return fetchRootWikiById(rootWikiId);
  }

  componentDidMount() {
    this.fetchComponentData();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
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

function mapStateToProps(state, routeProps) {
  const { rootWikiId } = routeProps.params;
  const rootWiki = getRootWiki(state, rootWikiId);
  return { rootWikiId, rootWiki };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchComponentData() {
      const action = RootWikiDashboardPage.getInitialAction();
      return dispatch(action);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  RootWikiDashboardPage
);
