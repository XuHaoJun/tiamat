import { List } from 'immutable';
import React from 'react';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import { connect } from 'react-redux';
import { fetchSearchResult } from '../../SearchActions';
import { getLastSearchResult } from '../../SearchReducer';
import cssStyles from './SearchAutoComplete.css';

class SearchAutoComplete extends React.Component {
  static defaultProps = {
    hits: List(),
    target: 'discussions',
    queryField: 'title',
    queryOptions: {},
    onUpdateInput: () => {},
    onSubmit: () => {},
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      searchText: '',
    };
  }

  getQueryOptions = searchText => {
    const { queryField, queryOptions } = this.props;
    const _queryOptions = {
      [queryField]: searchText,
      highlight: true,
    };
    const { target } = this.props;
    if (target === 'discussions') {
      _queryOptions.parentDiscussionId = null;
    }
    return Object.assign({}, _queryOptions, queryOptions);
  };

  handleUpdateInput = searchText => {
    const { target } = this.props;
    const queryOptions = this.getQueryOptions(searchText);
    this.setState(
      {
        searchText,
      },
      () => {
        this.props.onUpdateInput(searchText, target, queryOptions);
      }
    );
  };

  handleNewRequest = ({ text, hit }) => {
    if (text !== '') {
      // TODO goto search home
    }
    this.setState({ searchText: '' });
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Goto search home page
      this.props.onSubmit(e);
    }
  };

  render() {
    const { queryField, hits } = this.props;
    const { searchText } = this.state;
    const dataSource = (() => {
      if (searchText === '') {
        return [];
      } else {
        return hits
          .map(hit => {
            const text = hit.getIn(['_source', queryField]);
            const highlightedText = hit.getIn(['highlight', queryField, 0]);
            const primaryText = (() => {
              if (highlightedText) {
                const dangerouslySetInnerHTML = {
                  __html: highlightedText,
                };
                return (
                  <span
                    className={cssStyles.highlight}
                    dangerouslySetInnerHTML={dangerouslySetInnerHTML}
                  />
                ); // eslint-disable-line
              } else {
                return <span>{text}</span>;
              }
            })();
            const value = <MenuItem primaryText={primaryText} />;
            return { text, value };
          })
          .toJS();
      }
    })();
    const styles = {
      input: {
        color: this.props.muiTheme.appBar.textColor,
      },
    };
    return (
      <AutoComplete
        fullWidth={true}
        name="searchAutoComplete"
        inputStyle={styles.input}
        hintText="找標題"
        searchText={searchText}
        onUpdateInput={this.handleUpdateInput}
        onNewRequest={this.handleNewRequest}
        onKeyPress={this.handleKeyPress}
        dataSource={dataSource}
        filter={() => true}
        maxSearchResults={5}
        openOnFocus={true}
      />
    );
  }
}

function mapStateToProps(store) {
  const lastSearchResult = getLastSearchResult(store);
  const hits = (() => {
    if (lastSearchResult) {
      // merge {discussions: searchResult1, wiki: searchResult2, author: ....}
      return lastSearchResult
        .valueSeq()
        .map(searchResult => {
          return searchResult.getIn(['hits', 'hits']);
        })
        .flatten(1);
    } else {
      return List();
    }
  })();
  return { hits };
}

function mapDispatchToProps(dispatch) {
  return {
    onUpdateInput: (searchText, target, queryOptions) => {
      if (searchText !== '') {
        dispatch(fetchSearchResult(target, queryOptions));
      }
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchAutoComplete);
