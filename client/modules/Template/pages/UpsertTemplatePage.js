import React from 'react';
import { hot } from 'react-hot-loader';

import AceEditor from '../../../components/AceEditor';

class UpsertTemplatePage extends React.Component {
  render() {
    return (
      <div>
        <AceEditor mode="jsx" theme="github" />
      </div>
    );
  }
}

export default hot(module)(UpsertTemplatePage);
