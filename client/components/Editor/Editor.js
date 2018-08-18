import React from 'react';
import { List, fromJS } from 'immutable';
import FlatButton from 'material-ui/FlatButton';
import { EditorState, RichUtils, CompositeDecorator, convertToRaw, convertFromRaw } from 'draft-js';
import Editor from 'draft-js-plugins-editor';

import editorStyles from './editorStyles.css';

require('./plugin.css');
require('../../../node_modules/draft-js-linkify-plugin/lib/plugin.css');
require('../../../node_modules/draft-js-inline-toolbar-plugin/lib/plugin.css');
require('../../../node_modules/draft-js-side-toolbar-plugin/lib/plugin.css');
require('../../../node_modules/draft-js-mention-plugin/lib/plugin.css');

import createLinkifyPlugin from 'draft-js-linkify-plugin';
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin'; // eslint-disable-line import/no-unresolved

import createSideToolbarPlugin from 'draft-js-side-toolbar-plugin';

import mentions from './mentions';

import createBlockBreakoutPlugin from 'draft-js-block-breakout-plugin';

const blockBreakoutPlugin = createBlockBreakoutPlugin();

// import createIssueSuggestionPlugin, {defaultSuggestionsFilter} from './plugin';

import createMentionPlugin, { defaultSuggestionsFilter } from 'draft-js-mention-plugin';

class MentionComponent extends React.Component {
  handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  handleTouchTap = e => {
    e.preventDefault();
    e.stopPropagation();
    alert(`show ${this.props.decoratedText} data`);
  };

  render() {
    console.log('mentionComponent', this.props);
    return (
      <a
        contentEditable={false}
        className={this.props.className}
        spellCheck={false}
        onMouseDown={this.handleMouseDown}
        onTouchTap={this.handleTouchTap}
      >
        {this.props.children}
      </a>
    );
  }
}

const linkifyPlugin = createLinkifyPlugin({
  component: props => (
    // eslint-disable-next-line no-alert, jsx-a11y/anchor-has-content
    <a {...props} onClick={() => alert('Clicked on Link!')} />
  ),
});

const styles = {
  hashtag: {
    backgroundColor: '#dce6f8',
  },
};

class HashtagSpan extends React.Component {
  render() {
    // const {url} = this.props.contentState.getEntity(props.entityKey).getData()
    console.log(this.props);
    return <span style={styles.hashtag}>{this.props.children}</span>;
  }
}

const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr;
  let start;
  matchArr = regex.exec(text);
  while (matchArr !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
    matchArr = regex.exec(text);
  }
}

function hashtagStrategy(contentBlock, callback, contentState) {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
}

function suggestionsFilter(searchValue, suggestions, maxRow = 6) {
  const value = searchValue.toLowerCase();
  const filteredSuggestions = suggestions.filter(
    suggestion =>
      !value ||
      suggestion
        .get('name')
        .toLowerCase()
        .indexOf(value) > -1
  );
  const size = filteredSuggestions.size < maxRow ? filteredSuggestions.size : maxRow;
  return filteredSuggestions.setSize(size);
}

class MyEditor extends React.Component {
  constructor(props) {
    super(props);

    const compositeDecorator = new CompositeDecorator([
      {
        strategy: hashtagStrategy,
        component: HashtagSpan,
      },
    ]);

    const _rawContent =
      '{ "entityMap": { "0": { "type": "#mention", "mutability": "IMMUTABLE", "data": { "mention": { "name"' +
      ': "皮可西", "link": "https://twitter.com/juliandoesstuff", "avatar": "https://s0.52poke.wiki/wiki/thumb' +
      '/a/a9/036Clefable.png/300px-036Clefable.png" } } } }, "blocks": [ { "key": "ca6ju", "text": "皮可西 www' +
      '.google.com", "type": "unstyled", "depth": 0, "inlineStyleRanges": [], "entityRanges": [ { "offset":' +
      ' 0, "length": 3, "key": 0 } ], "data": {} } ] }';
    const _rawContentJSON = JSON.parse(_rawContent);
    console.log('_rawContentJSON', _rawContentJSON);
    for (const key in _rawContentJSON.entityMap) {
      if (Object.prototype.hasOwnProperty.call(_rawContentJSON.entityMap, key)) {
        const entity = _rawContentJSON.entityMap[key];
        if (entity.type === '#mention' && entity.data) {
          entity.data = fromJS(entity.data);
        }
      }
    }
    console.log('_rawContentJSON', _rawContentJSON);
    const content = convertFromRaw(_rawContentJSON);

    const mentionPlugin = createMentionPlugin({
      mentionTrigger: '#',
      entityMutability: 'IMMUTABLE',
      mentionComponent: MentionComponent,
    });
    const inlineToolbarPlugin = createInlineToolbarPlugin();
    const sideToolbarPlugin = createSideToolbarPlugin();
    const plugins = [mentionPlugin, inlineToolbarPlugin, sideToolbarPlugin, blockBreakoutPlugin];
    this.state = {
      editorState: EditorState.createEmpty(),
      suggestions: List(),
      readMode: false,
      _plugins: {
        sideToolbarPlugin,
        mentionPlugin,
        inlineToolbarPlugin,
      },
      plugins,
    };
  }

  componentDidMount() {
    // this.focus();
  }

  onChange = editorState => {
    // if (editorState.getImmutable().get('decorator') !== null) { }
    this.setState({ editorState });
  };

  onSearchChange = ({ value }) => {
    console.log('value', value);
    if (value.length > 0) {
      this.setState({
        suggestions: suggestionsFilter(value, mentions, 9),
      });
    } else {
      this.setState({ suggestions: List() });
    }
  };

  onAddMention = () => {
    // get the mention object selected
  };

  getEditorState = () => {
    return this.state.editorState;
  };

  logState = () => {
    console.log(this.state.editorState.toJS());
    console.log(convertToRaw(this.state.editorState.getCurrentContent()));
    console.log(JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()), null, 2));
  };

  handleBoldClick = () => {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'));
  };

  handleToggleReadMode = () => {
    this.setState({
      readMode: !this.state.readMode,
    });
  };

  handleLog = () => {
    this.logState();
  };

  focus = () => {
    this.editor.focus();
  };

  render() {
    const { MentionSuggestions } = this.state._plugins.mentionPlugin;
    const { InlineToolbar } = this.state._plugins.inlineToolbarPlugin;
    const { SideToolbar } = this.state._plugins.sideToolbarPlugin;
    return (
      <div>
        <div className={this.state.readMode ? null : editorStyles.editor}>
          <Editor
            plugins={this.state.plugins}
            ref={element => {
              this.editor = element;
            }}
            placeholder="Enter the text..."
            editorState={this.state.editorState}
            spellCheck={false}
            readOnly={this.state.readMode}
            onChange={this.onChange}
          />
        </div>
        <FlatButton label="ReadMode" onTouchTap={this.handleToggleReadMode} />
        <FlatButton label="LogState" onTouchTap={this.handleLog} />
        <MentionSuggestions
          onSearchChange={this.onSearchChange}
          suggestions={this.state.suggestions}
          onAddMention={this.onAddMention}
          onClose={() => this.setState({ suggestions: List() })}
        />
        <SideToolbar />
        <InlineToolbar />
      </div>
    );
  }
}

export default MyEditor;
