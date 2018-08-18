import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { shallowEqualImmutable } from 'react-immutable-render-mixin';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';
import ScrollContainerHoc from '../../../../components/ScrollContainer/ScrollContainerHoc';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import CenterCircularProgress from '../../../../components/CenterCircularProgress';
import DiscussionNode from './DiscussionNode';
import ReplyButton from './ReplyButton';

import {
  getDiscussionById,
  getChildDiscussions,
  getDiscussionByDirection,
} from '../../DiscussionReducer';
import { getForumBoardById } from '../../../ForumBoard/ForumBoardReducer';
import { getSemanticRulesByRootWikiId } from '../../../SemanticRule/SemanticRuleReducer';

const GotoDiscussionButton = (
  { direction = 'next', discussion, ...other } = {
    direction: 'next',
    discussion: null,
  }
) => {
  const id = discussion ? discussion._id : '';
  const title = discussion ? discussion.title : '\u00A0';
  const to = id ? `/discussions/${id}` : '';
  const LinkProps = to
    ? {
        component: Link,
        to,
      }
    : null;
  return (
    <Button style={{ textTransform: 'none', maxWidth: 100 }} {...LinkProps} {...other}>
      <Grid
        container
        wrap="nowrap"
        direction="column"
        justify="flex-start"
        alignItems="center"
        spacing={0}
      >
        <Grid item>
          <Typography variant="subheading">{direction === 'next' ? '下一篇' : '上一篇'}</Typography>
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography noWrap variant="caption">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </Button>
  );
};

const styles = theme => {
  const { breakpoints } = theme;
  return {
    title: {
      padding: 16,
    },
    parentDiscussionInner: {
      [breakpoints.up('sm')]: {
        padding: '0 8%',
      },
    },
    childDiscussionsInner: {
      marginTop: 16,
      [breakpoints.up('sm')]: {
        padding: '0 8%',
      },
    },
  };
};

class DiscussionDetail extends React.Component {
  static propTypes = {
    parentDiscussionId: PropTypes.string.isRequired,
    forumBoardId: PropTypes.string.isRequired,
    parentDiscussion: PropTypes.object,
    nextParentDiscussion: PropTypes.object,
    prevParentDiscussion: PropTypes.object,
    childDiscussions: PropTypes.object,
    semanticReplaceMode: PropTypes.bool,
  };

  static defaultProps = {
    semanticReplaceMode: false,
  };

  render() {
    const {
      // ui
      classes,
      //
      forumBoardId,
      parentDiscussion,
      parentDiscussionId,
      childDiscussions,
      semanticRules,
      semanticReplaceMode,
      nextParentDiscussion,
      prevParentDiscussion,
    } = this.props;
    if (!parentDiscussion) {
      return <CenterCircularProgress />;
    }
    return (
      <React.Fragment>
        <div>
          <Grid container direction="row" justify="flex-start" alignItems="center" spacing={0}>
            <Grid item>
              <GotoDiscussionButton direction="prev" discussion={prevParentDiscussion} />
            </Grid>
            <Grid item>
              <Button component={Link} to={`/forumBoards/${forumBoardId}/rootDiscussions`}>
                返回列表
              </Button>
            </Grid>
            <Grid item>
              <GotoDiscussionButton direction="next" discussion={nextParentDiscussion} />
            </Grid>
          </Grid>
          <Paper className={classes.parentDiscussionInner}>
            <Typography variant="headline" component="h1" className={classes.title}>
              {parentDiscussion.title}
            </Typography>
            <Divider />
            <DiscussionNode
              elevation={0}
              discussion={parentDiscussion}
              semanticRules={semanticRules}
              onSemanticToggle={this.props.onSemanticToggle}
              semanticReplaceMode={semanticReplaceMode}
            />
          </Paper>
          <div className={classes.childDiscussionsInner}>
            <Typography variant="subheading" gutterBottom>
              {childDiscussions.size}
              {'\u00A0'}
              回覆
            </Typography>
            {childDiscussions.map((x, index) => {
              return (
                <DiscussionNode
                  key={x._id}
                  index={index + 2}
                  discussion={x}
                  semanticRules={semanticRules}
                  onSemanticToggle={this.props.onSemanticToggle}
                  semanticReplaceMode={semanticReplaceMode}
                />
              );
            })}
          </div>
        </div>
        <ReplyButton to={`/create/rootDiscussions/${parentDiscussionId}/childDiscussion`} />
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, props) {
  const { parentDiscussionId, forumBoardId } = props;
  const parentDiscussion = getDiscussionById(state, parentDiscussionId);
  const childDiscussions = getChildDiscussions(state, parentDiscussionId)
    .toList()
    .sort(({ createdAt: a }, { createdAt: b }) => {
      return a - b;
    });
  const forumBoard = getForumBoardById(state, forumBoardId);
  const rootWikiId = forumBoard ? forumBoard.rootWiki : null;
  const semanticRules = rootWikiId ? getSemanticRulesByRootWikiId(state, rootWikiId) : null;
  const nextParentDiscussion = parentDiscussion
    ? getDiscussionByDirection(state, parentDiscussion, 'next')
    : null;
  const prevParentDiscussion = parentDiscussion
    ? getDiscussionByDirection(state, parentDiscussion, 'prev')
    : null;
  return {
    parentDiscussionId,
    forumBoardId,
    forumBoard,
    parentDiscussion,
    childDiscussions,
    semanticRules,
    nextParentDiscussion,
    prevParentDiscussion,
  };
}

export default compose(
  ScrollContainerHoc,
  withStyles(styles),
  connect(
    mapStateToProps,
    null,
    null,
    {
      areStatePropsEqual: shallowEqualImmutable,
    }
  )
)(DiscussionDetail);
