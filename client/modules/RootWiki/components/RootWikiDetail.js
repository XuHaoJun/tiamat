import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { connect } from "react-redux";
import { getRootWiki } from "../RootWikiReducer";

import Loading from "../../../components/CenterCircularProgress";
import Editor from "../../../components/Slate/Editor";

class RootWikiDetail extends React.Component {
  static defaultProps = {
    rootWikiId: "",
    rootWiki: undefined
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const { rootWiki } = this.props;
    if (rootWiki === undefined) {
      return <Loading />;
    } else if (rootWiki === null) {
      return <div>沒有任何維基</div>;
    } else {
      const rawContent = rootWiki ? rootWiki.get("content") : null;
      return (
        <div>
          <Editor rawContent={rawContent} readOnly={true} />
        </div>
      );
    }
  }
}

function mapStateToProps(store, props) {
  const { rootWikiId, rootWiki } = props;
  return {
    rootWikiId,
    rootWiki: rootWiki || getRootWiki(store, rootWikiId)
  };
}

export default connect(mapStateToProps)(RootWikiDetail);
