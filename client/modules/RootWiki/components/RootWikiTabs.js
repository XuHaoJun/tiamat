import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import { Tabs, Tab } from "material-ui/Tabs";

import EnhancedSwipeableViews from "../../../components/EnhancedSwipableViews";

export const ROOT_WIKI_CONTENT_SLIDE = 0;
export const ROOT_WIKI_EDIT_SLIDE = 1;
export const WIKI_DATA_FORMS_SLIDE = 2;
export const ROOT_WIKI_HISTORY = 3;

class RootWikiTabs extends React.Component {
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

  render() {
    const { slideIndex } = this.state;
    return (
      <div>
        <Tabs>
          <Tab label="閱讀" value={ROOT_WIKI_CONTENT_SLIDE} />
          <Tab label="編輯" value={ROOT_WIKI_EDIT_SLIDE} />
          <Tab label="表單管理" value={WIKI_DATA_FORMS_SLIDE} />
          <Tab label="歷史紀錄" value={ROOT_WIKI_HISTORY} />
        </Tabs>
        <EnhancedSwipeableViews index={slideIndex}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </EnhancedSwipeableViews>
      </div>
    );
  }
}

export default RootWikiTabs;
