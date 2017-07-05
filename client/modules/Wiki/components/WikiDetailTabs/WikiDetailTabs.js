import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "material-ui/Tabs";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import EnhancedSwipeableViews from "../../../../components/EnhancedSwipableViews";
import { connect } from "react-redux";
import { getWiki } from "../../WikiReducer";
import { getRootWiki } from "../../../RootWiki/RootWikiReducer";
import CenterCircularProgress from "../../../../components/CenterCircularProgress";
import { emptyContent } from "../../../../components/Slate/Editor";
import WikiContent from "../../components/WikiContent";
import getStyles from "../../../../styles/Tabs";
import WikiForm from "../WikiForm";

export const WIKI_CONTENT_SLIDE = 0;
export const WIKI_EDIT_SLIDE = 1;
export const WIKI_HITSTORY_SLIDE = 2;

class WikiDetailTabs extends React.Component {
  static defaultProps = {
    title: "維基",
    wikiId: "",
    wiki: null,
    enableEdit: false,
    slideIndex: WIKI_CONTENT_SLIDE,
    scrollKey: "",
    onChangeTab: () => {}
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { slideIndex } = props;
    this.state = {
      slideIndex
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.slideIndex !== nextProps.slideIndex) {
      this.setState({ slideIndex: nextProps.slideIndex });
    }
  }

  getStyles = () => {
    const {
      rootStyle,
      tabsStyle,
      swipeableViewsStyle,
      slideContainerStyle
    } = this.props;
    const defaultStyles = getStyles(this.context, this.props.browser);
    const propStyles = {
      rootStyle,
      tabsStyle,
      swipeableViewsStyle,
      slideContainerStyle
    };
    const styles = defaultStyles;
    for (const k in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, k)) {
        styles[k] = {
          ...styles[k],
          ...propStyles[k]
        };
      }
    }
    return styles;
  };

  handleTransitionEnd = () => {
    if (this.props.onTransitionEnd) {
      this.props.onTransitionEnd(this.state.slideIndex);
    }
  };

  handleTabChange = value => {
    this.setState(
      {
        slideIndex: value
      },
      () => this.props.onChangeTab(value)
    );
  };

  render() {
    const { wiki } = this.props;
    if (!wiki) {
      return <CenterCircularProgress />;
    }
    const { scrollKey, enableEdit } = this.props;
    const { slideIndex } = this.state;
    const name = wiki ? wiki.get("name") : "";
    const content = wiki ? wiki.get("content") : emptyContent;
    const rootWikiId = wiki.get("rootWiki");
    const rootWikiGroupTree = wiki.get("rootWikiGroupTree");
    const wikiProps = {
      name,
      rootWikiId,
      content,
      rootWikiGroupTree
    };
    const wikiContentProps = {
      ...wikiProps,
      enableEdit
    };
    const wikiFormProps = {
      ...wikiProps,
      nameReadOnly: true
    };
    const styles = this.getStyles();
    return (
      <div style={styles.root}>
        <Tabs
          style={styles.tabs}
          value={slideIndex}
          onChange={this.handleTabChange}
        >
          <Tab label="閱讀" value={WIKI_CONTENT_SLIDE} />
          <Tab label="編輯" value={WIKI_EDIT_SLIDE} />
          <Tab label="檢視歷史" value={WIKI_HITSTORY_SLIDE} />
        </Tabs>
        <EnhancedSwipeableViews
          scrollKey={scrollKey}
          style={styles.swipeableViews}
          containerStyle={styles.slideContainer}
          index={slideIndex}
          onChangeIndex={this.handleTabChange}
          onTransitionEnd={this.handleTransitionEnd}
        >
          <WikiContent {...wikiContentProps} />
          <WikiForm {...wikiFormProps} />
          <div>檢視歷史(尚未完成)</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

function mapStateToProps(store, props) {
  const { wikiId, rootWikiId } = props;
  const wiki = getWiki(store, wikiId);
  const rootWiki = getRootWiki(store, rootWikiId);
  return { wiki, rootWiki };
}

export default connect(mapStateToProps)(WikiDetailTabs);
