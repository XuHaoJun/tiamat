import React from 'react';

import { Link as ReactRouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import normalizeHref from './utils/normailzeHref';
import { Block } from 'slate';
import Img from '../Img';
import isUrl from 'is-url';
import Template from './components/Template';

const DEFAULT_NODE = 'paragraph';

export class Link extends React.Component {
  render() {
    const { node, readOnly } = this.props;
    const href = node.data.get('href');
    if (readOnly) {
      const finalHref = normalizeHref(href);
      if (!isUrl(finalHref)) {
        return (
          <ReactRouterLink {...this.props.attributes} to={finalHref}>
            {this.props.children}
          </ReactRouterLink>
        );
      }
    }
    return (
      <a {...this.props.attributes} href={href}>
        {this.props.children}
      </a>
    );
  }
}

export class Mention extends React.Component {
  handleTouchTap = e => {
    const { readOnly } = this.props;
    if (!readOnly) {
      e.preventDefault();
    }
  };

  render() {
    const { node, state, readOnly } = this.props;
    const href = node.data.get('href');
    return (
      <a
        {...this.props.attributes}
        href={readOnly ? href : '#'}
        onTouchTap={this.handleTouchTap}
        onClick={this.handleTouchTap}
        autoCapitalize="off"
        spellCheck={false}
        autoCorrect="off"
        autoComplete="off"
      >
        {this.props.children}
      </a>
    );
  }
}

export class Paragraph extends React.Component {
  render() {
    return (
      <Typography component="p" {...this.props.attributes}>
        {this.props.children}
      </Typography>
    );
  }
}

export function createSchema() {
  const schema = {
    nodes: {
      image: props => {
        const { node, value } = props;
        const active = value.isFocused && value.selection.hasEdgeIn(node);
        const src = node.data.get('src');
        const height = node.data.get('height');
        const width = node.data.get('width');
        const className = active ? 'active' : null;
        const style = {
          maxWidth: '100%',
          height: height || 'auto',
          width: width || 'auto',
        };
        return (
          <Img alt={src} style={style} src={src} className={className} {...props.attributes} />
        );
      },
      mention: Mention,
      table: props => {
        const { node, state } = props;
        const active = state.isFocused && state.selection.hasEdgeIn(node);
        const className = active ? 'active' : null;
        return (
          <Table {...props.attributes}>
            <TableBody {...props.attributes}>{props.children}</TableBody>
          </Table>
        );
      },
      table_row: props => <TableRow {...props.attributes}>{props.children}</TableRow>,
      table_cell: props => {
        const align = props.node.get('data').get('align') || 'left';
        const style = {
          textAlign: align,
        };
        return <TableCell style={style}>{props.children}</TableCell>;
      },
      paragraph: Paragraph,
      link: Link,
      heading: props => (
        <Typography variant="headline" {...props.attributes}>
          {props.children}
        </Typography>
      ),
      template: Template,
      code_line: props => <div {...props.attributes}>{props.children}</div>,
      code_block: props => {
        // const code = props.node.text;
        // try {
        //   console.log("code eval:", eval(code));
        // } catch (err) {
        //   console.log("err", err);
        // }
        return (
          <pre className="language-jsx">
            <code {...props.attributes}>{props.children}</code>
          </pre>
        );
      },
      code: props => (
        <pre>
          <code {...props.attributes}>{props.children}</code>
        </pre>
      ),
      'block-quote': props => <blockquote {...props.attributes}>{props.children}</blockquote>,
      'bulleted-list': props => <ul {...props.attributes}>{props.children}</ul>,
      'heading-one': props => (
        <Typography variant="headline" {...props.attributes}>
          {props.children}
        </Typography>
      ),
      'heading-two': props => (
        <Typography variant="title" {...props.attributes}>
          {props.children}
        </Typography>
      ),
      'heading-three': props => (
        <Typography variant="subheading" {...props.attributes}>
          {props.children}
        </Typography>
      ),
      'heading-four': props => <h4 {...props.attributes}>{props.children}</h4>,
      'heading-five': props => <h5 {...props.attributes}>{props.children}</h5>,
      'heading-six': props => <h6 {...props.attributes}>{props.children}</h6>,
      'list-item': props => <li {...props.attributes}>{props.children}</li>,
      'numbered-list': props => <ol {...props.attributes}>{props.children}</ol>,
    },
    marks: {
      bold: props => <strong>{props.children}</strong>,
      code: props => <code>{props.children}</code>,
      italic: props => <em>{props.children}</em>,
      underlined: props => <u>{props.children}</u>,
    },
    rules: [
      // Rule to insert a paragraph block if the document is empty.
      {
        match: node => {
          return node.object === 'document';
        },
        validate: document => {
          return document.nodes.size ? null : true;
        },
        normalize: (transform, document) => {
          const block = Block.create({ type: DEFAULT_NODE });
          transform.insertNodeByKey(document.key, 0, block);
        },
      },
      // Rule to insert a paragraph below a void node (the image) if that node is the last one in the
      // document.
      {
        match: node => {
          return node.object === 'document';
        },
        validate: document => {
          const lastNode = document.nodes.last();
          return lastNode && lastNode.isVoid ? true : null;
        },
        normalize: (transform, document) => {
          const block = Block.create({ type: DEFAULT_NODE });
          transform.insertNodeByKey(document.key, document.nodes.size, block);
        },
      },
    ],
  };
  return schema;
}

const defaultSchema = createSchema();

export default defaultSchema;
