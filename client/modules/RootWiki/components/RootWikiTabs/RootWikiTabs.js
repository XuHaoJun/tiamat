import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import Tabs from "../../../../components/Tabs";
import Tab from "@material-ui/core/Tab";

import EnhancedSwipeableViews from "../../../../components/EnhancedSwipableViews";
import WikiDataFormList from "./WikiDataFormList";
import RootWikiDetail from "../RootWikiDetail";
import RootWikiForm from "../RootWikiForm";

export const ROOT_WIKI_CONTENT_SLIDE = 0;
export const ROOT_WIKI_EDIT_SLIDE = 1;
export const WIKI_DATA_FORMS_SLIDE = 2;
export const ROOT_WIKI_HISTORY = 3;

class RootWikiTabs extends React.Component {
  static propTypes = {
    rootWiki: PropTypes.object
  };

  static defaultProps = {
    rootWiki: null
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
      const { slideIndex } = nextProps;
      this.setState({ slideIndex });
    }
  }

  handleChange = (event, value) => {
    this.setState({ slideIndex: value });
  };

  handleChangeIndex = value => {
    this.setState({ slideIndex: value });
  };

  render() {
    const { rootWiki } = this.props;
    if (!rootWiki) {
      return <div>Loading...</div>;
    }
    const { slideIndex } = this.state;
    const { wikiDataForms } = rootWiki;
    return (
      <div>
        <Tabs onChange={this.handleChange} value={slideIndex}>
          <Tab label="閱讀" value={ROOT_WIKI_CONTENT_SLIDE} />
          <Tab label="編輯" value={ROOT_WIKI_EDIT_SLIDE} />
          <Tab label="表單管理" value={WIKI_DATA_FORMS_SLIDE} />
          <Tab label="歷史紀錄" value={ROOT_WIKI_HISTORY} />
        </Tabs>
        <EnhancedSwipeableViews
          index={slideIndex}
          onChangeIndex={this.handleChangeIndex}
        >
          <RootWikiDetail rootWiki={rootWiki} />
          <RootWikiForm actionType="update" defaultRootWiki={rootWiki} />
          <WikiDataFormList wikiDataForms={wikiDataForms} />
          <div>歷史紀錄(尚未完成)</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

export default RootWikiTabs;
