import React from "react";
import { fromJS } from "immutable";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import {
  setHeaderTitle,
  updateSendButtonProps
} from "../../MyApp/MyAppActions";
import TouchBackend from "react-dnd-touch-backend";
import HTML5Backend from "react-dnd-html5-backend";
import MultiBackend, { TouchTransition } from "react-dnd-multi-backend";
import { DragDropContext } from "react-dnd";
import { getUserAgent } from "../../UserAgent/UserAgentReducer";
import MobileDetect from "mobile-detect";
import memoize from "fast-memoize";

function getStyles() {
  const styles = {
    treeContainer: {
      height: "calc(100vh - 64px)"
    }
  };
  return styles;
}

function rootWikiGroupTreeToSortableTree() {}

class CreateRootWikiPage extends React.PureComponent {
  static defaultProps = {
    title: "編輯維基分類"
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    const rootWikiGroupTree = fromJS([
      {
        title: "物品",
        children: [
          {
            title: "武器",
            children: [
              {
                title: "長劍"
              },
              {
                title: "斧"
              }
            ]
          },
          {
            title: "防具",
            children: [
              {
                title: "重甲"
              },
              {
                title: "皮甲"
              }
            ]
          }
        ]
      },
      {
        title: "卡片",
        children: [
          {
            title: "獵人"
          },
          {
            title: "盜賊"
          }
        ]
      },
      {
        title: "深度測試(一)",
        children: [
          {
            title: "深度測試(二)",
            children: [
              {
                title: "深度測試(三)",
                children: [
                  {
                    title: "深度測試(四)",
                    children: [
                      {
                        title: "深度測試(五)",
                        children: [
                          {
                            name: "你看見我了!"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]).toJS();
    this.state = {
      rootWikiGroupTree,
      isFirstRender: true
    };
    const getMobileDetect = memoize(userAgent => {
      return new MobileDetect(userAgent);
    });
    this.getMobileDetect = getMobileDetect;
  }

  componentWillMount() {
    const title = this.props.title;
    this.props.dispatch(setHeaderTitle(title));
    if (this.state.isFirstRender) {
      this.setState({ isFirstRender: false });
    }
  }

  onChangeRootWikiGroupTree = rootWikiGroupTree => {
    this.setState({ rootWikiGroupTree });
  };

  setFormRef = formComponent => {
    if (formComponent) {
      this.formComponent = formComponent;
      const onClick = this.sendForm;
      this.props.dispatch(updateSendButtonProps({ onClick }));
    } else {
      this.props.dispatch(
        updateSendButtonProps({
          onClick: null
        })
      );
    }
  };

  getSortableTreeComponent = () => {
    if (this.SortableTree) {
      return this.SortableTree;
    } else {
      const HTML5toTouch = {
        backends: [
          {
            backend: HTML5Backend
          },
          {
            backend: TouchBackend({
              enableMouseEvents: true,
              delayTouchStart: 10
            }), // Note that you can call your backends with options
            preview: true,
            transition: TouchTransition
          }
        ]
      };
      const SortableTreeWithoutDndContext = require("react-sortable-tree")
        .SortableTreeWithoutDndContext; // eslint-disable-line global-require
      this.SortableTree = DragDropContext(MultiBackend(HTML5toTouch))(
        SortableTreeWithoutDndContext
      );
      return this.SortableTree;
    }
  };

  sendForm = () => {};

  render() {
    const SortableTree = this.getSortableTreeComponent();
    const title = this.props.title;
    const metaDescription = title;
    const meta = [
      {
        name: "description",
        content: metaDescription
      }
    ];
    if (
      this.state.isFirstRender ||
      typeof document === "undefined" ||
      typeof window === "undefined"
    ) {
      return null;
    }
    const { forumBoardId } = this.props;
    const styles = getStyles();
    return (
      <div>
        <Helmet title={title} meta={meta} />
        <h1>(尚未完成)</h1>
        <div>
          <SortableTree
            style={styles.treeContainer}
            isVirtualized={false}
            treeData={this.state.rootWikiGroupTree}
            onChange={this.onChangeRootWikiGroupTree}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, routerProps) {
  const { forumBoardId } = routerProps.match.params;
  return {
    browser: state.browser,
    forumBoardId,
    userAgent: getUserAgent(state)
  };
}

export default connect(mapStateToProps)(CreateRootWikiPage);
