import React from "react";

import compose from "recompose/compose";
import pure from "recompose/pure";
import withWidth, { isWidthUp } from "material-ui-next/utils/withWidth";
import { withStyles } from "material-ui-next/styles";
import { fade } from "material-ui-next/styles/colorManipulator";

import SearchIcon from "material-ui-icons-next/Search";

const styles = theme => {
  return {
    wrapper: {
      fontFamily: theme.typography.fontFamily,
      position: "relative",
      marginRight: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit,
      borderRadius: 2,
      background: fade(theme.palette.common.white, 0.15),
      "&:hover": {
        background: fade(theme.palette.common.white, 0.25)
      },
      "& $input": {
        transition: theme.transitions.create("width"),
        width: 200,
        "&:focus": {
          width: 250
        }
      }
    },
    search: {
      width: theme.spacing.unit * 9,
      height: "100%",
      position: "absolute",
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    input: {
      font: "inherit",
      padding: `${theme.spacing.unit}px ${theme.spacing.unit}px ${
        theme.spacing.unit
      }px ${theme.spacing.unit}px`,
      border: 0,
      display: "block",
      verticalAlign: "middle",
      whiteSpace: "normal",
      background: "none",
      margin: 0, // Reset for Safari
      color: "inherit",
      width: "100%",
      "&:focus": {
        outline: 0
      }
    }
  };
};

class SearchAutoComplete extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.wrapper}>
        <input id="docsearch-input" className={classes.input} />
      </div>
    );
  }
}

export default compose(
  withStyles(styles, {
    name: "SearchAutoComplete"
  }),
  withWidth(),
  pure
)(SearchAutoComplete);
