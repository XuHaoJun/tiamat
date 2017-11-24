import { Map, List } from "immutable";
import React from "react";
import Snackbar from "material-ui/Snackbar";
import { connect } from "react-redux";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { getLastError } from "../ErrorReducer";

export function getStyles() {
  const styles = {
    snackbarBody: {
      backgroundColor: "rgba(100, 0, 0, 0.87)"
    }
  };
  return styles;
}

class ErrorSnackbar extends React.Component {
  static defaultProps = {
    error: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      open: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.error !== nextProps.error) {
      this.setState({ open: true });
    }
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  render() {
    const styles = getStyles();
    let { error } = this.props;
    if (List.isList(error)) {
      error = error.get(0);
    }
    const { open } = this.state;
    let message;
    if (typeof error === "string") {
      message = error;
    } else if (Map.isMap(error)) {
      message =
        error.get("message") ||
        error.get("errmsg") ||
        error.get("msg") ||
        error.get("name") ||
        error.get("error_description") ||
        error.get("error") ||
        "";
    } else {
      message = "";
    }
    return (
      <Snackbar
        bodyStyle={styles.snackbarBody}
        open={message ? open : false}
        message={message}
        autoHideDuration={6666}
        onRequestClose={this.handleRequestClose}
      />
    );
  }
}

function mapStateToProps(store) {
  const error = getLastError(store);
  return { error };
}

export default connect(mapStateToProps)(ErrorSnackbar);
