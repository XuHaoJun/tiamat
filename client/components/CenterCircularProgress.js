import React from "react";
import CircularProgress from "material-ui-next/Progress/CircularProgress";

const CenterCircularProgress = () => {
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: 20,
      margin: 0
    }
  };
  return (
    <div style={styles.container}>
      <CircularProgress size={60} thickness={5} />
    </div>
  );
};

export default CenterCircularProgress;
