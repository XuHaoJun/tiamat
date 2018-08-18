import React from 'react';
import AceEditor from '../../../components/AceEditor';

class TemplateForm extends React.Component {
  render() {
    return (
      <div>
        <AceEditor theme="github" mode="jsx" />
      </div>
    );
  }
}

export default TemplateForm;
