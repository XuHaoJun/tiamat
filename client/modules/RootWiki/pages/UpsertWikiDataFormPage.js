import React from "react";
import Helmet from "react-helmet";
import WikiDataFormForm from "../components/WikiDataFormForm";

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

export default UpsertWikiDataFormPage;
