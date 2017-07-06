import { Map } from "immutable";
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

class ErrorSnackbar extends React.PureComponent {
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
    const { error } = this.props;
    const { open } = this.state;
    let message;
    if (typeof error === "string") {
      message = error;
    } else if (Map.isMap(error)) {
      message =
        error.get("message") ||
        error.get("errmsg") ||
        error.get("msg") ||
        error.get("name");
    } else {
      message = "";
    }
    return (
      <Snackbar
        bodyStyle={styles.snackbarBody}
        open={message ? open : false}
        message={message}
        autoHideDuration={3333}
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
