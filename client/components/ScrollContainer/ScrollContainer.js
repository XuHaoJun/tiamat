import defaultProps from "recompose/defaultProps";
import { ScrollContainer } from "react-router-scroll-4";

import shouldUpdateScroll from "./shouldUpdateScroll";

export default defaultProps({ shouldUpdateScroll })(ScrollContainer);
