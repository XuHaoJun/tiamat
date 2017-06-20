import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';

import {fetchSearchLogs} from '../SearchActions';

import {getSearchLogs} from '../SearchReducer';

export class SearchLogsList extends Component {
  static propTypes = {
    searchLogs: PropTypes.array.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.searchLogs.length === nextProps.searchLogs.length) {
      return !_.isEqualWith(this.props.searchLogs, nextProps.searchLogs, (a, b) => {
        return a.query === b.query;
      });
    }
    return true;
  }

  getLinkPath = (v) => {
    return `/search?query=${v.query}`;
  };

  _preventDefault = (e) => {
    e.nativeEvent.preventDefault();
  }

  render() {
    return (
      <List>
        {
          this.props.searchLogs.map((v, i) => (
            <Link
              key={v.query}
              to={this.getLinkPath(v)}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
              activeStyle={{
                textDecoration: 'none',
                color: 'inherit'
              }}>
              <div>
                <ListItem>
                  {v.query}
                </ListItem>
                <Divider/>
              </div>
            </Link>
          ))
        }
      </List>
    );
  }
}

class SearchLogsListPage extends Component {
  static propTypes = {
    searchLogs: PropTypes.array.isRequired
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.props.dispatch(fetchSearchLogs());
  }

  render() {
    return (
      <div
        style={{
          padding: (this.props.browser.lessThan.medium
            ? '0'
            : '10px 0 0 50px')
        }}>
        <SearchLogsList searchLogs={this.props.searchLogs}/>
      </div>
    );
  }
}

SearchLogsListPage.need = [].concat((params, state, query) => {
  return fetchSearchLogs();
});

function mapStateToProps(state, props) {
  const searchLogs = getSearchLogs(state);
  return {searchLogs, browser: state.browser};
}

export default connect(mapStateToProps)(SearchLogsListPage);
