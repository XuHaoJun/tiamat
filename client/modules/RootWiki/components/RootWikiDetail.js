import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { connect } from "react-redux";
import { getRootWiki } from "../RootWikiReducer";

import Editor from "../../../components/Slate/Editor";

class RootWikiDetail extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const { rootWiki } = this.props;
    if (rootWiki === undefined) {
      return <div>Loading...</div>;
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

function mapStateToProps(state, props) {
  const { rootWikiId, rootWiki } = props;
  return {
    rootWikiId,
    rootWiki: rootWiki || getRootWiki(state, rootWikiId)
  };
}

export default connect(mapStateToProps)(RootWikiDetail);
