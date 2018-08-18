import React from 'react';
import { createSchema } from './schema';

function getStyles() {
  return {
    'heading-one': {
      borderBottom: '1px solid #a2a9b1',
    },
    'heading-two': {
      borderBottom: '1px solid #acb2b7',
    },
  };
}

function createWikiSchema() {
  const schema = createSchema();
  const styles = getStyles();
  const wikiSchema = {
    nodes: {
      'heading-one': props => (
        <h1 style={styles['heading-one']} {...props.attributes}>
          {props.children}
        </h1>
      ),
      'heading-two': props => (
        <h2 style={styles['heading-two']} {...props.attributes}>
          {props.children}
        </h2>
      ),
    },
  };
  wikiSchema.nodes = Object.assign(schema.nodes, wikiSchema.nodes);
  return wikiSchema;
}

const defaultWikiSchema = createWikiSchema();

export default defaultWikiSchema;
