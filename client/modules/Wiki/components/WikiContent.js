import React from 'react';
import PropTypes from 'prop-types';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CircularProgress from '@material-ui/core/CircularProgress';

import Editor, { emptyContent } from '../../../components/Slate/Editor';
import RootWikiGroupTreeNavLinks from '../../RootWiki/components/RootWikiGroupTreeNavLinks';

import { updateWikiRequest } from '../WikiActions';

export const styles = theme => {
  return {
    wrapper: {
      margin: theme.spacing.unit,
      position: 'relative',
    },
    buttonProgress: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  };
};

export function getStyles() {
  return {
    name: {
      borderBottom: '1px solid #a2a9b1',
    },
    rootWikiGroupTree: {
      margin: '10px 5px 10px 5px',
    },
  };
}

class WikiContent extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
  };

  static defaultProps = {
    readOnly: true,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { readOnly } = props;
    this.state = {
      readOnly,
      submitLoading: false,
    };
  }

  handleEditClick = () => {
    this.setState({ readOnly: false });
  };

  handleCancleEdit = () => {
    this.setState({ readOnly: true });
  };

  handleSubmit = event => {
    this.setState({ submitLoading: true, readOnly: true }, () => {
      const { onSubmit } = this.props;
      if (onSubmit) {
        const p = onSubmit(event);
        if (typeof p === 'object' && p && p.then && p.catch) {
          p.then(() => {
            const { submitLoading } = this.state;
            if (submitLoading) {
              this.setState({ submitLoading: false, readOnly: true });
            }
          }).catch(() => {
            const { submitLoading } = this.state;
            if (submitLoading) {
              this.setState({ submitLoading: false, readOnly: false });
            }
          });
        }
      } else {
        this.setState({ submitLoading: false, readOnly: true });
      }
    });
  };

  render() {
    const { readOnly, submitLoading } = this.state;
    const { classes } = this.props;
    const { wiki } = this.props;
    const { name, content, rootWikiGroupTree, rootWikiId, forumBoardId } = wiki;
    const _styles = getStyles();
    const rootWikiGroupTreeNavLinksProps = {
      rootWikiId,
      forumBoardId,
      rootWikiGroupTree,
    };
    return (
      <div>
        <div style={_styles.rootWikiGroupTree}>
          <RootWikiGroupTreeNavLinks {...rootWikiGroupTreeNavLinksProps} />
        </div>
        {readOnly ? (
          <IconButton onClick={this.handleEditClick}>
            <EditIcon />
          </IconButton>
        ) : (
          <div>
            <Button onClick={this.handleCancleEdit}>取消</Button>
            <div className={classes.wrapper}>
              <Button onClick={this.handleSubmit} variant="contained" disabled={submitLoading}>
                確認(未完成)
              </Button>
              {submitLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </div>
          </div>
        )}
        <h1 style={_styles.name}>{name}</h1>
        <Editor rawContent={content} readOnly={readOnly} />
      </div>
    );
  }
}

export const StyledWikiContent = withStyles(styles)(WikiContent);

function mapDispatchToProps(dispatch) {
  return {
    onSubmit(event, payload) {
      const { wiki, editing } = payload;
      const { content } = editing;
      dispatch(updateWikiRequest(wiki._id, { wiki: content }));
    },
  };
}

export default StyledWikiContent;
