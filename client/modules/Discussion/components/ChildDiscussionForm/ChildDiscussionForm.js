import React from "react";
import PropTypes from "prop-types";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import DiscussionForm from "../DiscussionForm";

import Ajv from "ajv";
import rootDiscussionSchema from "./schema.json";
import { loadSchema } from "../../../JSONSchema/JSONSchemaActions";

const ajv = new Ajv({
  allErrors: true,
  extendRefs: true,
  loadSchema
});

let validate = () => {
  this.errors = [new Error("load schema fail.")];
  return false;
};

ajv.compileAsync(rootDiscussionSchema).then(_validate => {
  validate = _validate;
  return validate;
});

class ChildDiscussionForm extends React.Component {
  static propTypes = {
    isRoot: PropTypes.oneOf([false])
  };

  static defaultProps = {
    isRoot: false
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  getForm = () => {
    if (this.form) {
      return this.form.getForm();
    }
    return {};
  };

  validate = () => validate;

  render() {
    return (
      <DiscussionForm
        ref={form => {
          this.form = form;
        }}
        {...this.props}
        isRoot={false}
      />
    );
  }
}

export default ChildDiscussionForm;
