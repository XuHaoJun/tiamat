import React from "react";
import Helmet from "react-helmet";

import RootWikiGroupTreeForm from "../components/RootWikiGroupTreeForm";

class UpsertRootWikiGroupTreePage extends React.Component {
  render() {
    return (
      <div>
        <Helmet title="UpsertRootWikiGroupTreePage" />
        <RootWikiGroupTreeForm />
      </div>
    );
  }
}

export default UpsertRootWikiGroupTreePage;
