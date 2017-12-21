import React from "react";
import PropTypes from "prop-types";
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
import { getDBisInitialized } from "../../MyApp/MyAppReducer";
import {
  setUpsertDiscussionPageForm,
  addDiscussionRequest,
  fetchDiscussion
} from "../DiscussionActions";
import { getDiscussion, getUI } from "../DiscussionReducer";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import { getSemanticRules } from "../../SemanticRule/SemanticRuleReducer";
import {
  getIsLoggedIn,
  getCurrentAccessToken,
  getCurrentUser
} from "../../User/UserReducer";

import RootDiscussionForm from "../components/RootDiscussionForm";
import ChildDiscussionForm from "../components/ChildDiscussionForm";

const CREATE_ACTION = "create";
const UPDATE_ACTION = "update";
const ACTIONS = [CREATE_ACTION, UPDATE_ACTION];

// TODO
// check actionType update with discussion's author id and currentUser id
class UpsertRootDiscussionPage extends React.Component {
  static propTypes = {
    actionType: PropTypes.oneOf(ACTIONS).isRequired,
    targetKind: PropTypes.oneOf([
      "rootDiscussion",
      "discussion",
      "childDiscussion"
    ]).isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    headerTitle: "建立文章"
  };

  componentWillMount() {
    const { headerTitle } = this.props;
    this.props.dispatch(setHeaderTitle(headerTitle));
  }

  componentDidMount() {
    this.fetchData(this.props);
    this.ensureLoggedIn(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchData(nextProps);
    this.ensureLoggedIn(nextProps);
  }

  componentWillUnmount() {
    // cancel debounce
    this.debouncedSaveToLocalDB.cancel();
    this.saveToLocalDB();
    this.props.dispatch(
      updateSendButtonProps({
        onTouchTap: undefined
      })
    );
  }

  setFormRef = form => {
    if (form) {
      this.form = form;
      const onTouchTap = this.sendForm;
      this.props.dispatch(updateSendButtonProps({ onTouchTap }));
    } else {
      this.props.dispatch(
        updateSendButtonProps({
          onTouchTap: undefined
        })
      );
    }
  };

  _toLoginPage = () => {
    this.context.router.replace("/login");
  };

  ensureLoggedIn = props => {
    const { dbIsInitialized } = props;
    if (dbIsInitialized) {
      const { isLoggedIn } = props;
      if (!isLoggedIn) {
        this._toLoginPage();
      }
    }
  };

  ensureAuthed = props => {
    const { actionType, currentUser, discussion } = props;
    if (actionType === UPDATE_ACTION) {
      if (discussion) {
        const { _id } = currentUser;
        const { author } = discussion;
        if (_id !== author) {
          this._toLoginPage();
        }
      }
    }
  };

  saveToLocalDB = () => {
    if (this.form && this.form.getForm) {
      const formData = this.form.getForm();
      if (formData) {
        const { forumBoardId } = this.props;
        // TODO
        // imple it.
        if (forumBoardId) {
          this.props.dispatch(
            setUpsertDiscussionPageForm(forumBoardId, formData)
          );
        }
      }
    }
  };

  debouncedSaveToLocalDB = debounce(() => {
    return this.saveToLocalDB();
  }, 5000);

  fetchData = props => {
    const {
      dispatch,
      discussion,
      discussionId,
      forumBoardId,
      forumBoard,
      parentDiscussionId,
      parentDiscussion
    } = props;
    if (!discussion) {
      if (discussionId) {
        dispatch(fetchDiscussion(discussionId));
      }
    }
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
      const { isLoggedIn } = this.props;
      if (!isLoggedIn) {
        // TODO
        // show login required?
        this.props.dispatch(push("/login"));
        return undefined;
      }
      const { forumBoardId, parentDiscussionId, accessToken } = this.props;
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
          .then(() => dispatch(setUpsertDiscussionPageForm(forumBoardId, null)))
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
      actionType,
      targetKind
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
    let form;
    if (targetKind === "childDiscussion") {
      if (actionType === CREATE_ACTION) {
        form = (
          <ChildDiscussionForm
            ref={this.setFormRef}
            actionType={actionType}
            parentDiscussionId={parentDiscussionId}
            initForm={initForm}
            semanticRules={semanticRules}
          />
        );
      } else {
        form = (
          <div
          >{`targetKind ${targetKind} only support ${CREATE_ACTION} actionType`}</div>
        );
      }
    } else if (targetKind === "rootDiscussion") {
      if (actionType === CREATE_ACTION) {
        form = (
          <RootDiscussionForm
            ref={this.setFormRef}
            actionType={actionType}
            forumBoardId={forumBoardId}
            forumBoardGroup={forumBoardGroup}
            forumBoard={forumBoard}
            initForm={initForm}
            onChange={this.handleFormChange}
            semanticRules={semanticRules}
          />
        );
      } else {
        form = (
          <div
          >{`targetKind ${targetKind} only support ${CREATE_ACTION} actionType`}</div>
        );
      }
    } else if (targetKind === "discussion") {
      if (actionType === UPDATE_ACTION) {
        const { discussion } = this.props;
        if (discussion) {
          if (discussion.get("isRoot")) {
            const { title, content } = discussion;
            const _initForm = {
              title,
              content,
              forumBoardGroup: discussion.get("forumBoardGroup")
            };
            form = (
              <RootDiscussionForm
                ref={this.setFormRef}
                actionType={actionType}
                forumBoardId={discussion.get("forumBoard")}
                forumBoardGroup={discussion.get("forumBoardGroup")}
                initForm={_initForm}
                onChange={this.handleFormChange}
                semanticRules={semanticRules}
              />
            );
          } else {
            const { content } = discussion;
            const _initForm = {
              content
            };
            form = (
              <ChildDiscussionForm
                ref={this.setFormRef}
                actionType={actionType}
                parentDiscussionId={discussion.get("parentDiscussion")}
                initForm={_initForm}
                semanticRules={semanticRules}
              />
            );
          }
        } else {
          form = <div>Loading...</div>;
        }
      } else {
        form = (
          <div
          >{`targetKind ${targetKind} only support ${UPDATE_ACTION} actionType`}</div>
        );
      }
    } else {
      form = (
        <div
        >{`unknown targetKind ${targetKind} or actionType ${actionType}`}</div>
      );
    }
    return (
      <div>
        <Helmet title={this.props.headerTitle} />
        {form}
      </div>
    );
  }
}

const emptyThunk = () => {
  return Promise.resolve(null);
};

function getHeaderTitle(params = {}, store = {}) {
  const { forumBoardId, parentDiscussionId, discussionId } = params;
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
  } else if (discussionId) {
    return "編輯文章";
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
  .concat(params => {
    const { discussionId } = params;
    if (discussionId) {
      return fetchDiscussion(discussionId);
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
  .concat((params, store, query, routes) => {
    const headerTitle = getHeaderTitle(params, store);
    return setHeaderTitleThunk(headerTitle);
  });

function mapStateToProps(store, routerProps) {
  const leafRoute = routerProps.routes[routerProps.routes.length - 1];
  const { actionType, targetKind } = leafRoute;
  const dbIsInitialized = getDBisInitialized(store);
  const isLoggedIn = getIsLoggedIn(store);
  const { forumBoardId, parentDiscussionId, discussionId } = routerProps.params;
  const { forumBoardGroup } = routerProps.location.query;
  const forumBoard = getForumBoardById(store, forumBoardId);
  const discussion = getDiscussion(store, discussionId);
  const parentDiscussion = getDiscussion(store, parentDiscussionId);
  const ui = getUI(store);
  let initForm;
  if (parentDiscussionId) {
    initForm = null;
  } else {
    initForm = ui.getIn(["UpsertDiscussionPage", "forms", forumBoardId]);
  }
  const semanticRules = getSemanticRules(store);
  const headerTitle = getHeaderTitle(routerProps.params, store);
  const accessToken = getCurrentAccessToken(store);
  const currentUser = getCurrentUser(store);
  return {
    actionType,
    targetKind,
    dbIsInitialized,
    headerTitle,
    currentUser,
    accessToken,
    isLoggedIn,
    forumBoardId,
    forumBoardGroup,
    forumBoard,
    discussionId,
    discussion,
    parentDiscussionId,
    parentDiscussion,
    initForm,
    semanticRules
  };
}

export default connect(mapStateToProps)(UpsertRootDiscussionPage);
