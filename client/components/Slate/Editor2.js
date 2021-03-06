import React from 'react';
import { SlateEditor, SlateToolbar, SlateContent, BoldPlugin, BoldButton } from 'slate-editor';

const plugins = [BoldPlugin()];

const SlateRichTextEditor = () => (
  <SlateEditor plugins={plugins}>
    <SlateToolbar>
      <BoldButton />
    </SlateToolbar>

    <SlateContent />
  </SlateEditor>
);

export default SlateRichTextEditor;
