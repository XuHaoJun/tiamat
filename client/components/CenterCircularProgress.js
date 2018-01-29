import React from "react";

import CircularProgress from "material-ui-next/Progress/CircularProgress";
import pure from "recompose/pure";

const CenterCircularProgress = () => {
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: 20,
      margin: 0
    },
    progress: {
      maxWidth: "50%"
    }
  };
  return (
    <div style={styles.container}>
      <CircularProgress style={styles.container} size={80} thickness={8} />
    </div>
  );
};

export default pure(CenterCircularProgress);
