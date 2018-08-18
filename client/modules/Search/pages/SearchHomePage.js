import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { hot } from 'react-hot-loader';

class SearchHomePage extends React.Component {
  render() {
    return <div>搜尋頁面(尚未完成)</div>;
  }
}

function mapStateToProps(store, routerProps) {
  return {};
}

export default compose(
  hot(module),
  connect(mapStateToProps)
)(SearchHomePage);
