import React from 'react';

import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

import SearchIcon from '@material-ui/icons/Search';

const styles = theme => {
  const { breakpoints } = theme;
  return {
    wrapper: {
      fontFamily: theme.typography.fontFamily,
      position: 'relative',
      marginRight: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit,
      borderRadius: 2,
      background: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        background: fade(theme.palette.common.white, 0.25),
      },
      '& $input': {
        [breakpoints.up('sm')]: {
          transition: theme.transitions.create('width'),
          width: 200,
          '&:focus': {
            width: 250,
          },
        },
      },
    },
    search: {
      display: 'none',
      [breakpoints.up('sm')]: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    input: {
      font: 'inherit',
      padding: `${theme.spacing.unit}px`,
      border: 0,
      display: 'block',
      verticalAlign: 'middle',
      whiteSpace: 'normal',
      background: 'none',
      margin: 0, // Reset for Safari
      color: 'inherit',
      width: '100%',
      '&:focus': {
        outline: 0,
      },
      [breakpoints.up('sm')]: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit}px ${theme
          .spacing.unit * 8}px`,
      },
    },
  };
};

class SearchAutoComplete extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.wrapper}>
        <div className={classes.search}>
          <SearchIcon />
        </div>
        <input className={classes.input} />
      </div>
    );
  }
}

export default compose(
  withStyles(styles, {
    name: 'SearchAutoComplete',
  })
)(SearchAutoComplete);
