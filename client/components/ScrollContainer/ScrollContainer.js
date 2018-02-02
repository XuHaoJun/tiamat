import React from "react";
import { ScrollContainer } from "react-router-scroll-4";

import defaultShouldUpdateScroll from "./shouldUpdateScroll";

const _ScrollContainer = props => {
  const { shouldUpdateScroll, ...other } = props;
  const _shouldUpdateScroll = shouldUpdateScroll || defaultShouldUpdateScroll;
  return (
    <ScrollContainer {...other} shouldUpdateScroll={_shouldUpdateScroll} />
  );
};

export default _ScrollContainer;
