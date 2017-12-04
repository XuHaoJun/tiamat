import Html from "slate-html-serializer";
import { Editor, getEventTransfer } from "slate-react";
import { State } from "slate";

import React from "react";
import initialState from "./emptyContent.json";

/**
 * Tags to blocks.
 *
 * @type {Object}
 */

const BLOCK_TAGS = {
  p: "paragraph",
  li: "list-item",
  ul: "bulleted-list",
  ol: "numbered-list",
  blockquote: "quote",
  pre: "code",
  h1: "heading-one",
  h2: "heading-two",
  h3: "heading-three",
  h4: "heading-four",
  h5: "heading-five",
  h6: "heading-six"
};

/**
 * Tags to marks.
 *
 * @type {Object}
 */

const MARK_TAGS = {
  strong: "bold",
  em: "italic",
  u: "underline",
  s: "strikethrough",
  code: "code"
};

/**
 * Serializer rules.
 *
 * @type {Array}
 */

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (!block) return;
      return {
        kind: "block",
        type: block,
        nodes: next(el.childNodes)
      };
    }
  },
  {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName.toLowerCase()];
      if (!mark) return;
      return {
        kind: "mark",
        type: mark,
        nodes: next(el.childNodes)
      };
    }
  },
  {
    // Special case for code blocks, which need to grab the nested childNodes.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != "pre") return;
      const code = el.childNodes[0];
      const childNodes =
        code && code.tagName.toLowerCase() == "code"
          ? code.childNodes
          : el.childNodes;

      return {
        kind: "block",
        type: "code",
        nodes: next(childNodes)
      };
    }
  },
  {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != "a") return;
      return {
        kind: "inline",
        type: "link",
        nodes: next(el.childNodes),
        data: {
          href: el.getAttribute("href")
        }
      };
    }
  }
];

/**
 * Create a new HTML serializer with `RULES`.
 *
 * @type {Html}
 */

const serializer = new Html({ rules: RULES });

export default serializer;
