import React from 'react';
import {connect} from 'react-redux';
import {getRootWiki} from '../RootWikiReducer';
import Editor from '../../../components/Slate/Editor';

class RootWikiDetail extends React.PureComponent {
  static defaultProps = {
    rootWikiId: '',
    rootWiki: null
  };

  render() {
    const {rootWiki} = this.props;
    return (
      <div>
        {
          rootWiki
            ? (<Editor
              rawContent={this
                .props
                .rootWiki
                .get('content')}
              readOnly={true}/>)
            : (
              <div>沒有任何維基</div>
            )
        }
      </div>
    );
  }
}

function mapStateToProps(store, props) {
  const {rootWikiId, rootWiki} = props;
  return {
    rootWikiId,
    rootWiki: rootWiki || getRootWiki(store, rootWikiId)
  };
}

export default connect(mapStateToProps)(RootWikiDetail);
