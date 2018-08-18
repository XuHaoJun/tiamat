import React, { Component } from 'react';

const schema = {
  type: 'object',
  required: ['keywordType'],
  properties: {
    keywordType: {
      type: 'string',
      enum: ['number', 'string', 'boolean', 'array', 'object', 'allOf', 'oneOf'],
    },
  },
  dependencies: {
    keywordType: {
      oneOf: [
        // number
        {
          required: ['type'],
          properties: {
            keywordType: {
              enum: ['number'],
            },
            type: {
              type: 'string',
              enum: ['number'],
            },
            minimum: {
              type: 'number',
            },
            maximum: {
              type: 'number',
            },
          },
        },
        // string
        {
          required: ['type'],
          properties: {
            keywordType: {
              enum: ['string'],
            },
            type: {
              type: 'string',
              enum: ['string'],
            },
            minLength: {
              type: 'number',
            },
            maxLength: {
              type: 'number',
            },
          },
        },
        // boolean
        {
          required: ['type'],
          properties: {
            keywordType: {
              enum: ['boolean'],
            },
            type: {
              type: 'boolean',
              enum: ['boolean'],
            },
          },
        },
      ],
    },
  },
};

class JSONSchemaEditor extends Component {
  render() {
    return <div />;
  }
}

export default JSONSchemaEditor;
