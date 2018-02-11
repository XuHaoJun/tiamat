import React from "react";

import ScrollContainer from "./ScrollContainer";

export default function ScrollContainerHoc(Component) {
  return class _ScrollContainerHoc extends React.Component {
    static propTypes = Component.propTypes;

    render() {
      const { id } = this.props;
      if (typeof id === "string" && id !== "") {
        return (
          <ScrollContainer scrollKey={id}>
            <Component {...this.props} />
          </ScrollContainer>
        );
      } else {
        return <Component {...this.props} />;
      }
    }
  };
}
