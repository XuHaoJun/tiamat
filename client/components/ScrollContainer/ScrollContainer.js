import React from "react";
import { ScrollContainer } from "react-router-scroll";
import defaultShouldUpdateScroll from "./shouldUpdateScroll";

export default class _ScrollContainer extends React.Component {
  render() {
    const { shouldUpdateScroll, ...other } = this.props;
    const _shouldUpdateScroll = shouldUpdateScroll || defaultShouldUpdateScroll;
    return (
      <ScrollContainer {...other} shouldUpdateScroll={_shouldUpdateScroll} />
    );
  }
}
