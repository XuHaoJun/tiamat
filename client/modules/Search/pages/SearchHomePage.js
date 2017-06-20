import React from 'react';
import {connect} from 'react-redux';

class SearchHomePage extends React.Component {
  render() {
    return (
      <div>搜尋頁面(尚未完成)</div>
    );
  }
}

// SearchHomePage.need = [].concat((params) => {
//   return
// })

function mapStateToProps(store, props) {
  return {};
}

export default connect(mapStateToProps)(SearchHomePage);
