import React from "react";

import CommonList from "../../../../components/List/CommonList";

class WikiDataFormList extends React.Component {
  listItemHref = payload => {
    const { _id } = payload;
    return `/update/wikiDataForms/${_id}`;
  };

  render() {
    const dataSource = this.props.wikiDataForms;
    return (
      <CommonList
        dataSource={dataSource}
        enableLoadMore={false}
        enableRefreshIndicator={false}
        listItemHref={this.listItemHref}
      />
    );
  }
}

export default WikiDataFormList;
