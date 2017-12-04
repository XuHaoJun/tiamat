import React from "react";
import { fromJS } from "immutable";
import Loadable from "react-loadable";

function Loading() {
  return <div>loading...</div>;
}

// FIXME
// SortableTree can't work with server-side so that show loading only.
const SortableTree = Loadable({
  loader: () => {
    if (typeof window === "undefined") {
      return Promise.resolve(Loading);
    } else {
      return import(/* webpackChunkName: "SortableTree" */ "../../../components/SortableTree");
    }
  },
  loading: Loading
});

function getStyles() {
  const styles = {
    treeContainer: {
      minHeight: "calc(100vh - 64px)",
      maxHeight: "calc(100vh - 64px)"
    }
  };
  return styles;
}

class RootWikiGroupTreeForm extends React.Component {
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
                            title: "你看見我了!"
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
      rootWikiGroupTree
    };
  }

  onChangeRootWikiGroupTree = rootWikiGroupTree => {
    this.setState({ rootWikiGroupTree });
  };

  render() {
    const { forumBoardId } = this.props;
    const styles = getStyles();
    return (
      <div>
        <h1>(尚未完成)</h1>
        <SortableTree
          style={styles.treeContainer}
          isVirtualized={false}
          treeData={this.state.rootWikiGroupTree}
          onChange={this.onChangeRootWikiGroupTree}
        />
      </div>
    );
  }
}

export default RootWikiGroupTreeForm;
