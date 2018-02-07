import React from "react";
import Helmet from "react-helmet";
import WikiDataFormForm from "../components/WikiDataFormForm";
import { compose } from "recompose";
import { hot } from "react-hot-loader";

class UpsertWikiDataFormPage extends React.Component {
  render() {
    return (
      <div>
        <Helmet title="UpsertWikiDataFormPage" />
        <WikiDataFormForm />
      </div>
    );
  }
}

export default compose(hot(module))(UpsertWikiDataFormPage);
