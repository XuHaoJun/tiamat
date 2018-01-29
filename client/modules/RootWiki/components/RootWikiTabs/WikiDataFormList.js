import React from "react";

class WikiDataFormList extends React.Component {
  listItemHref = payload => {
    const { _id } = payload;
    return `/update/wikiDataForms/${_id}`;
  };

  render() {
    const dataSource = this.props.wikiDataForms;
    return <div>尚未完成</div>;
  }
}

export default WikiDataFormList;
