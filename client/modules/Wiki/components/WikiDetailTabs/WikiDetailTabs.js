import React from 'react';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';

import Tab from '@material-ui/core/Tab';
import Tabs from '../../../../components/Tabs';

import EnhancedSwipeableViews from '../../../../components/EnhancedSwipableViews';
import { getWiki } from '../../WikiReducer';
import { getRootWiki } from '../../../RootWiki/RootWikiReducer';
import CenterCircularProgress from '../../../../components/CenterCircularProgress';
import { emptyContent } from '../../../../components/Slate/Editor';
import WikiContent from '../WikiContent';
import WikiForm from '../WikiForm';

const Loading = () => <div>Loading...</div>;

const WikiDataForm = Loadable({
  loader: () => {
    // render Loading on server-side
    if (typeof window === 'undefined') {
      return Promise.resolve(Loading);
    } else {
      return import(/* webpackChunkName: "WikiDataForm" */ '../WikiDataForm');
    }
  },
  loading: Loading,
});

export const WIKI_CONTENT_SLIDE = 0;
export const WIKI_RELATED_DISCUSSION = 1;
// export const WIKI_EDIT_SLIDE = 2;
export const WIKI_DATA_SLIDE = 2;
export const WIKI_HITSTORY_SLIDE = 3;

class WikiDetailTabs extends React.Component {
  static defaultProps = {
    wikiId: null,
    wiki: null,
    slideIndex: WIKI_CONTENT_SLIDE,
    scrollKey: '',
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { slideIndex } = props;
    this.state = {
      slideIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    // if (this.state.slideIndex !== nextProps.slideIndex) {
    //   this.setState({ slideIndex: nextProps.slideIndex });
    // }
  }

  handleTransitionEnd = () => {
    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(this.state.slideIndex);
    }
  };

  handleChange = (event, value) => {
    this.setState({
      slideIndex: value,
    });
  };

  handleChangeIndex = value => {
    this.setState({
      slideIndex: value,
    });
  };

  render() {
    const { wiki } = this.props;
    if (!wiki) {
      return <CenterCircularProgress />;
    }
    const { id } = this.props;
    const { slideIndex } = this.state;
    const name = wiki ? wiki.get('name') : '';
    const content = wiki ? wiki.get('content') : emptyContent;
    const rootWikiId = wiki.get('rootWiki');
    const rootWikiGroupTree = wiki.get('rootWikiGroupTree');
    const wikiProps = {
      name,
      rootWikiId,
      content,
      rootWikiGroupTree,
    };
    const wikiContentProps = {
      ...wikiProps,
    };
    const wikiFormProps = {
      ...wikiProps,
      nameReadOnly: true,
    };
    return (
      <div>
        <Tabs value={slideIndex} onChange={this.handleChange}>
          <Tab label="閱讀" value={WIKI_CONTENT_SLIDE} />
          <Tab label="相關文章" value={WIKI_RELATED_DISCUSSION} />
          {/* <Tab label="編輯" value={WIKI_EDIT_SLIDE} /> */}
          <Tab label="資料" value={WIKI_DATA_SLIDE} />
          <Tab label="歷史" value={WIKI_HITSTORY_SLIDE} />
        </Tabs>
        <EnhancedSwipeableViews
          id={id ? `${id}/EnhancedSwipeableViews` : null}
          index={slideIndex}
          slideClassName={this.props.slideClassName}
          onChangeIndex={this.handleChangeIndex}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <WikiContent wiki={wiki} {...wikiContentProps} />
          <div>相關文章(尚未完成)</div>
          {/* <WikiForm {...wikiFormProps} /> */}
          <WikiDataForm wiki={wiki} />
          <div>檢視歷史(尚未完成)</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const { wikiId, rootWikiId } = props;
  const wikiInput = props.wiki;
  const wiki = !wikiInput ? getWiki(state, wikiId) : wikiInput;
  const rootWiki = getRootWiki(state, rootWikiId);
  return { wiki, rootWiki };
}

export default connect(mapStateToProps)(WikiDetailTabs);
