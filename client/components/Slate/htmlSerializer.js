import {Html} from 'slate';

/**
 * Tags to blocks.
 *
 * @type {Object}
 */

const BLOCK_TAGS = {
  p: 'paragraph',
  li: 'list-item',
  ul: 'bulleted-list',
  ol: 'numbered-list',
  blockquote: 'quote',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six'
};

/**
 * Tags to marks.
 *
 * @type {Object}
 */

const MARK_TAGS = {
  strong: 'bold',
  em: 'italic',
  u: 'underline',
  s: 'strikethrough',
  code: 'code'
};

/**
 * Serializer rules.
 *
 * @type {Array}
 */

const RULES = [
  {
    deserialize(el, next) {
      const block = BLOCK_TAGS[el.tagName]
      if (!block)
        return
      return {
        kind: 'block',
        type: block,
        nodes: next(el.children)
      }
    }
  }, {
    deserialize(el, next) {
      const mark = MARK_TAGS[el.tagName]
      if (!mark)
        return
      return {
        kind: 'mark',
        type: mark,
        nodes: next(el.children)
      }
    }
  }, {
    // Special case for code blocks, which need to grab the nested children.
    deserialize(el, next) {
      if (el.tagName != 'pre')
        return
      const code = el.children[0]
      const children = code && code.tagName == 'code'
        ? code.children
        : el.children

      return {kind: 'block', type: 'code', nodes: next(children)}
    }
  }, {
    // Special case for links, to grab their href.
    deserialize(el, next) {
      if (el.tagName != 'a')
        return
      return {
        kind: 'inline',
        type: 'link',
        nodes: next(el.children),
        data: {
          href: el.attribs.href
        }
      }
    }
  }
];

const serializer = new Html({rules: RULES});

export default serializer;
