import React from 'react';
import PropTypes from 'prop-types';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import Editor, { emptyContent } from '../../../components/Slate/Editor';
import RootWikiGroupTreeNavLinks from '../../RootWiki/components/RootWikiGroupTreeNavLinks';

export function getStyles() {
  return {
    name: {
      borderBottom: '1px solid #a2a9b1',
    },
    rootWikiGroupTree: {
      margin: '10px 5px 10px 5px',
    },
  };
}

class WikiContent extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    rootWikiId: PropTypes.string.isRequired,
    forumBoardId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    name: '',
    content: emptyContent,
    rootWikiGroupTree: null,
    rootWikiId: '',
    forumBoardId: '',
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const { name, content, rootWikiGroupTree, rootWikiId, forumBoardId } = this.props;
    const styles = getStyles();
    const rootWikiGroupTreeNavLinksProps = {
      rootWikiId,
      forumBoardId,
      rootWikiGroupTree,
    };
    return (
      <div>
        <div style={styles.rootWikiGroupTree}>
          <RootWikiGroupTreeNavLinks {...rootWikiGroupTreeNavLinksProps} />
        </div>
        <h1 style={styles.name}>{name}</h1>
        <Editor rawContent={content} readOnly={true} />
      </div>
    );
  }
}

export default WikiContent;
