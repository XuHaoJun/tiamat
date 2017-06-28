import {List} from 'immutable';
import React from 'react';
import {shouldComponentUpdate} from 'react-immutable-render-mixin';
import AutoComplete from 'material-ui/AutoComplete';
import {connect} from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {fetchSearchResult} from '../SearchActions';
import {getLastSearchResult} from '../SearchReducer';

class SearchAutoComplete extends React.Component {
  static defaultProps = {
    hits: List(),
    target: 'discussions',
    queryType: 'title',
    queryOptions: {},
    onUpdateInput: () => {},
    onSubmit: () => {}
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      searchText: ''
    };
  }

  getQueryOptions = (searchText) => {
    const {queryType, queryOptions} = this.props;
    const _queryOptions = {
      [queryType]: searchText,
      highlight: true
    };
    return Object.assign({}, _queryOptions, queryOptions);
  }

  handleUpdateInput = (searchText) => {
    const {target} = this.props;
    const queryOptions = this.getQueryOptions(searchText);
    this.setState({
      searchText
    }, () => {
      this
        .props
        .onUpdateInput(searchText, target, queryOptions);
    });
  };

  handleNewRequest = ({text, hit}) => {
    if (text !== '') {
      // TODO goto search home
    }
    this.setState({searchText: ''});
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Goto search home page
      this
        .props
        .onSubmit(e);
    }
  }

  render() {
    const {hits} = this.props;
    const {searchText} = this.state;
    const dataSource = (() => {
      if (searchText === '') {
        return [];
      } else {
        return hits.map((hit) => {
          let text;
          switch (hit.get('_index')) {
            case 'wikis':
            case 'discussions':
              text = hit.getIn(['_source', 'title']);
              break;
            case 'forumboards':
            default:
              text = hit.getIn(['_source', 'name']);
              break;
          }
          return {
            text,
            value: {
              text,
              hit
            }
          };
        }).toJS();
      }
    })();
    console.log('hits', hits.toJS());
    console.log('dataSource', dataSource);
    const styles = {
      input: {
        color: this.props.muiTheme.appBar.textColor
      }
    };
    return (<AutoComplete
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
      openOnFocus={true}/>);
  }
}

function mapStateToProps(store) {
  const lastSearchResult = getLastSearchResult(store);
  const hits = (() => {
    if (lastSearchResult) {
      return lastSearchResult
        .valueSeq()
        .map((searchResult) => {
          return searchResult.getIn(['hits', 'hits']);
        })
        .flatten(1);
    } else {
      return List();
    }
  })();
  return {hits};
}

function mapDispatchToProps(dispatch) {
  return {
    onUpdateInput: (searchText, target, queryOptions) => {
      if (searchText !== '') {
        dispatch(fetchSearchResult(target, queryOptions));
      }
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(muiThemeable()(SearchAutoComplete));
