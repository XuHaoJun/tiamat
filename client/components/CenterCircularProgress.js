import React from "react";
import CircularProgress from "material-ui/CircularProgress";

const CenterCircularProgress = () => {
  const styles = {
    container: {
      marginTop: 25,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: 0,
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

export default CenterCircularProgress;
