import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { Set } from "immutable";
import { push, replace } from "react-router-redux";
import debounce from "lodash/debounce";

import {
  setHeaderTitle,
  setHeaderTitleThunk,
  updateSendButtonProps
} from "../../MyApp/MyAppActions";
import {
  setCreateRootDiscussionPageForm,
  addDiscussionRequest,
  fetchDiscussion
} from "../DiscussionActions";
import { getDiscussion, getUI } from "../DiscussionReducer";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import { getSemanticRules } from "../../SemanticRule/SemanticRuleReducer";
import { getCurrentAccessToken } from "../../User/UserReducer";

import RootDiscussionForm from "../components/RootDiscussionForm";
import ChildDiscussionForm from "../components/ChildDiscussionForm";

class UpsertRootDiscussionPage extends React.Component {
  static defaultProps = {
    headerTitle: "建立文章"
  };

  componentWillMount() {
    const { headerTitle } = this.props;
    this.props.dispatch(setHeaderTitle(headerTitle));
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchData(nextProps);
  }

  componentWillUnmount() {
    // cancel debounce
    this.saveToLocalDB.cancel();
    this._saveToLocalDB();
  }

  setFormRef = form => {
    if (form) {
      this.form = form;
      const onTouchTap = this.sendForm;
      this.props.dispatch(updateSendButtonProps({ onTouchTap }));
    } else {
      this.props.dispatch(
        updateSendButtonProps({
          onTouchTap: () => {}
        })
      );
    }
  };

  _saveToLocalDB = () => {
    if (this.form && this.form.getForm) {
      const formData = this.form.getForm();
      if (formData) {
        const { forumBoardId } = this.props;
        // TODO
        // imple it.
        if (forumBoardId) {
          this.props.dispatch(
            setCreateRootDiscussionPageForm(forumBoardId, formData)
          );
        }
      }
    }
  };

  saveToLocalDB = debounce(() => {
    return this._saveToLocalDB();
  }, 5000);

  fetchData = props => {
    const {
      dispatch,
      forumBoardId,
      forumBoard,
      parentDiscussionId,
      parentDiscussion
    } = props;
    if (!parentDiscussion) {
      if (parentDiscussionId) {
        dispatch(fetchDiscussion(parentDiscussionId));
      }
    }
    if (!forumBoard) {
      if (forumBoardId) {
        dispatch(fetchForumBoardById(forumBoardId));
      }
    } else {
      const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
      const { semanticRules } = props;
      if (rootWikiId) {
        if (semanticRules.count() === 0) {
          const scope = [
            {
              type: "wiki",
              rootWikiId
            }
          ];
          dispatch(fetchSemanticRules(scope));
        }
      }
    }
  };

  sendForm = () => {
    if (this.form) {
      const discussion = this.form.getForm();
      if (!discussion) {
        return undefined;
      }
      const { validate } = this.form;
      const valid = validate(discussion);
      if (!valid) {
        return undefined;
      }
      const { forumBoardId, parentDiscussionId, accessToken } = this.props;
      if (!accessToken) {
        // TODO
        // show login required?
        this.props.dispatch(push("/login"));
        return undefined;
      }
      let backUrl;
      if (forumBoardId) {
        backUrl = `/forumBoards/${forumBoardId}/rootDiscussions`;
      } else if (parentDiscussionId) {
        backUrl = `/rootDiscussions/${parentDiscussionId}`;
      }
      return this.props.dispatch(dispatch => {
        return Promise.resolve(
          dispatch(updateSendButtonProps({ loading: true }))
        )
          .then(() => dispatch(addDiscussionRequest(discussion, accessToken)))
          .then(() => dispatch(updateSendButtonProps({ loading: false })))
          .then(() => {
            if (backUrl) dispatch(replace(backUrl));
          })
          .then(() =>
            dispatch(setCreateRootDiscussionPageForm(forumBoardId, null))
          )
          .catch(() => dispatch(updateSendButtonProps({ loading: false })));
      });
    } else {
      return undefined;
    }
  };

  handleFormChange = () => {
    requestAnimationFrame(() => {
      this.saveToLocalDB();
    });
  };

  render() {
    const {
      forumBoardId,
      forumBoardGroup,
      forumBoard,
      initForm,
      parentDiscussionId,
      discussionId
    } = this.props;
    const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
    // TODO
    // optimize.
    let { semanticRules } = this.props;
    if (semanticRules) {
      semanticRules = rootWikiId
        ? semanticRules
            .filter(ele => ele.get("rootWikiId") === rootWikiId)
            .sortBy(ele => ele.get("name").length)
        : semanticRules;
    } else {
      semanticRules = Set();
    }
    return (
      <div>
        <Helmet title={this.props.headerTitle} />
        {parentDiscussionId ? (
          <ChildDiscussionForm
            ref={this.setFormRef}
            parentDiscussionId={parentDiscussionId}
            initForm={initForm}
          />
        ) : (
          <RootDiscussionForm
            ref={this.setFormRef}
            forumBoardId={forumBoardId}
            forumBoardGroup={forumBoardGroup}
            forumBoard={forumBoard}
            initForm={initForm}
            semanticRules={semanticRules}
            onChange={this.handleFormChange}
          />
        )}
      </div>
    );
  }
}

const emptyThunk = () => {
  return Promise.resolve(null);
};

function getHeaderTitle(params = {}, store = {}) {
  const { forumBoardId, parentDiscussionId } = params;
  if (forumBoardId) {
    const forumBoard = getForumBoardById(store, forumBoardId);
    if (forumBoard) {
      return `建立文章 - ${forumBoard.get("name")}`;
    } else {
      return "建立文章";
    }
  } else if (parentDiscussionId) {
    const parentDiscussion = getDiscussion(store, parentDiscussionId);
    if (parentDiscussion) {
      return `RE:${parentDiscussion.get("title")}`;
    } else {
      return "回覆文章";
    }
  } else {
    return "建立文章";
  }
}

UpsertRootDiscussionPage.need = []
  .concat(params => {
    const { parentDiscussionId } = params;
    if (parentDiscussionId) {
      return fetchDiscussion(parentDiscussionId);
    } else {
      return emptyThunk;
    }
  })
  .concat((params, store) => {
    const { forumBoardId, parentDiscussionId } = params;
    if (forumBoardId) {
      return fetchForumBoardById(forumBoardId);
    } else {
      const parentDiscussion = getDiscussion(store, parentDiscussionId);
      if (parentDiscussion) {
        return fetchForumBoardById(parentDiscussion.get("forumBoard"));
      } else {
        return emptyThunk;
      }
    }
  })
  .concat((params, store) => {
    const { forumBoardId } = params;
    const forumBoard = getForumBoardById(store, forumBoardId);
    const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
    if (rootWikiId) {
      const scope = [
        {
          type: "wiki",
          rootWikiId
        }
      ];
      return fetchSemanticRules(scope);
    } else {
      return emptyThunk;
    }
  })
  .concat((params, store) => {
    const headerTitle = getHeaderTitle(params, store);
    return setHeaderTitleThunk(headerTitle);
  });

function mapStateToProps(store, routerProps) {
  const accessToken = getCurrentAccessToken(store);
  const { forumBoardId, parentDiscussionId, discussionId } = routerProps.params;
  const { forumBoardGroup } = routerProps.location.query;
  const forumBoard = getForumBoardById(store, forumBoardId);
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  const ui = getUI(store);
  let initForm;
  if (parentDiscussionId) {
    initForm = null;
  } else {
    initForm = ui.getIn(["CreateRootDiscussionPage", "forms", forumBoardId]);
  }
  const semanticRules = getSemanticRules(store);
  const headerTitle = getHeaderTitle(routerProps.params, store);
  return {
    headerTitle,
    accessToken,
    forumBoardId,
    forumBoardGroup,
    forumBoard,
    discussionId,
    parentDiscussionId,
    parentDiscussion,
    initForm,
    semanticRules
  };
}

export default connect(mapStateToProps)(UpsertRootDiscussionPage);
