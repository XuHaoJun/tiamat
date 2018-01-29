import React from "react";

import CircularProgress from "material-ui-next/Progress/CircularProgress";

class Loading extends React.PureComponent {
  render() {
    const { size } = this.props;
    const styles = {
      container: {
        border: "1px #ccc solid",
        background: "#eee",
        width: size * 1.5,
        height: size * 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      progress: {
        margin: "auto",
        width: "40%"
      }
    };
    return (
      <div style={styles.container}>
        <CircularProgress size={size} style={styles.progress} />
      </div>
    );
  }
}

export default Loading;
