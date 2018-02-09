import React from "react";

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
      Loading...
      {/* <CircularProgress style={styles.container} size={80} thickness={8} /> */}
    </div>
  );
};

export default CenterCircularProgress;
