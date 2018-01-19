import React from "react";
import { Portal as ReactPortal } from "react-portal";

export default class Portal extends React.Component {
  state = {
    isFirstRender: true
  };

  componentDidMount() {
    this.onMount();
  }

  onMount = () => {
    this.setState({ isFirstRender: false });
  };

  render() {
    if (this.state.isFirstRender) {
      return null;
    } else {
      return <ReactPortal {...this.props} />;
    }
  }
}
