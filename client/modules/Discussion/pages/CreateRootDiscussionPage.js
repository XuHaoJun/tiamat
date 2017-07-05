import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import {
  setHeaderTitle,
  updateSendButtonProps
} from "../../MyApp/MyAppActions";
import {
  setCreateRootDiscussionPageForm,
  addDiscussionRequest
} from "../DiscussionActions";
import { getUI } from "../DiscussionReducer";
import CreateRootDiscussionForm from "../components/CreateRootDiscussionForm";
import { getForumBoardById } from "../../ForumBoard/ForumBoardReducer";
import { fetchForumBoardById } from "../../ForumBoard/ForumBoardActions";
import { fetchSemanticRules } from "../../SemanticRule/SemanticRuleActions";
import { Set } from "immutable";
import { getSemanticRules } from "../../SemanticRule/SemanticRuleReducer";

class CreateRootDiscussionPage extends React.Component {
  static defaultProps = {
    initTitle: "建立文章"
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      title: props.initTitle
    };
  }

  componentWillMount() {
    const title = this.state.title;
    this.props.dispatch(setHeaderTitle(title));
  }

  componentDidMount() {
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchData(nextProps);
  }

  componentWillUnmount() {
    if (this.formComponent) {
      const form = this.formComponent.getForm();
      if (form) {
        const { forumBoardId } = this.props;
        this.props.dispatch(
          setCreateRootDiscussionPageForm(forumBoardId, form)
        );
      }
    }
  }

  setFormRef = formComponent => {
    if (formComponent) {
      this.formComponent = formComponent;
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

  fetchData = props => {
    const { dispatch, forumBoardId, forumBoard } = props;
    if (!forumBoard) {
      dispatch(fetchForumBoardById(forumBoardId));
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
      } else {
        dispatch(fetchForumBoardById(forumBoardId));
      }
    }
  };

  sendForm = () => {
    if (this.formComponent) {
      const form = this.formComponent.getForm();
      if (!form) {
        return;
      }
      const { forumBoardId } = this.props;
      this.props.dispatch(dispatch => {
        return Promise.resolve(
          dispatch(updateSendButtonProps({ loading: true }))
        )
          .then(() => dispatch(addDiscussionRequest(form)))
          .then(() => dispatch(updateSendButtonProps({ loading: false })))
          .then(() => this.context.router.goBack())
          .then(() =>
            dispatch(setCreateRootDiscussionPageForm(forumBoardId, null))
          )
          .catch(() => dispatch(updateSendButtonProps({ loading: false })));
      });
    }
  };

  render() {
    return (
      <div>
        <Helmet title={this.state.title} />
        <CreateRootDiscussionForm
          ref={this.setFormRef}
          forumBoardId={this.props.forumBoardId}
          forumBoardGroup={this.props.forumBoardGroup}
          forumBoard={this.props.forumBoard}
          initForm={this.props.initForm}
          semanticRules={this.props.semanticRules}
        />
      </div>
    );
  }
}

CreateRootDiscussionPage.need = [].concat(params => {
  const { forumBoardId } = params;
  return fetchForumBoardById(forumBoardId);
});

function mapStateToProps(store, props) {
  const { forumBoardId } = props.params;
  const { forumBoardGroup } = props.location.query;
  const forumBoard = getForumBoardById(store, forumBoardId);
  const ui = getUI(store);
  const initForm = ui.getIn([
    "CreateRootDiscussionPage",
    "forms",
    forumBoardId
  ]);
  const rootWikiId = forumBoard ? forumBoard.get("rootWiki") : "";
  const semanticRules = rootWikiId
    ? getSemanticRules(store)
        .filter(ele => ele.get("rootWikiId") === rootWikiId)
        .sortBy(ele => ele.get("name").length)
    : Set();
  return { forumBoardId, forumBoardGroup, forumBoard, initForm, semanticRules };
}

export default connect(mapStateToProps)(CreateRootDiscussionPage);
