import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { connect } from "react-redux";
import { getRootWiki } from "../RootWikiReducer";
import Editor from "../../../components/Slate/Editor";

class RootWikiDetail extends React.Component {
  static defaultProps = {
    rootWikiId: "",
    rootWiki: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const { rootWiki } = this.props;
    const rawContent = rootWiki ? rootWiki.get("content") : null;
    return (
      <div>
        {rootWiki ? (
          <Editor rawContent={rawContent} readOnly={true} />
        ) : (
          <div>沒有任何維基</div>
        )}
      </div>
    );
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
