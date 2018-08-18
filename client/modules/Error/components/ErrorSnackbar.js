import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { getLastError } from '../ErrorReducer';

const snackbarContentStyles = {
  root: {
    backgroundColor: 'rgba(100, 0, 0, 0.87)',
  },
};

const RedSnackbarBase = props => {
  const { SnackbarContentProps, ...other } = props;
  const _SnackbarContentProps = {
    className: props.classes.root,
    ...SnackbarContentProps,
  };
  return <Snackbar {...other} ContentProps={_SnackbarContentProps} />;
};

RedSnackbarBase.propTypes = {
  classes: PropTypes.object.isRequired,
};

const RedSnackbar = withStyles(snackbarContentStyles)(RedSnackbarBase);

function getMessage(error) {
  let message;
  if (typeof error === 'string') {
    message = error;
  } else if (Map.isMap(error)) {
    message =
      error.get('message') ||
      error.get('errmsg') ||
      error.get('msg') ||
      error.get('name') ||
      error.get('error_description') ||
      error.get('error') ||
      '';
    if (message && error.get('dataPath')) {
      message = `${error.get('dataPath')} ${message}`;
    }
  } else {
    message = '';
  }
  return message;
}

const closeButtonStyles = theme => {
  return {
    root: {
      width: theme.spacing.unit * 4,
      height: theme.spacing.unit * 4,
    },
  };
};

const CloseButtonBase = props => {
  const { className, classes, ...other } = props;
  return (
    <IconButton className={classNames(classes.root, className)} {...other}>
      <CloseIcon />
    </IconButton>
  );
};

CloseButtonBase.propTypes = {
  classes: PropTypes.object.isRequired,
};

const CloseButton = withStyles(closeButtonStyles)(CloseButtonBase);

class ErrorSnackbar extends React.Component {
  static propTypes = {
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.error !== nextProps.error) {
      this.setState({ open: true });
    }
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
  };

  render() {
    let { error } = this.props;
    if (List.isList(error)) {
      error = error.get(0);
    }
    const { open } = this.state;
    const message = getMessage(error);
    return (
      <RedSnackbar
        open={message ? open : false}
        message={message}
        autoHideDuration={6000}
        onClose={this.handleClose}
        action={[
          <CloseButton key="close" aria-label="Close" color="inherit" onClick={this.handleClose} />,
        ]}
      />
    );
  }
}

function mapStateToProps(store) {
  const error = getLastError(store);
  return { error };
}

export default connect(mapStateToProps)(ErrorSnackbar);
