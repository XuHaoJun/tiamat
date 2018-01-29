import React from "react";

import { Tab } from "material-ui-next/Tabs";
import Tabs from "../../../../Tabs";

import AceEditor from "../../../../AceEditor";

const SetTemplateTabs = () => {
  return (
    <Tabs>
      <Tab label="模板列表" />
      <Tab label="綁定資料" />
      <Tab label="自訂模板" />
    </Tabs>
  );
};

export default SetTemplateTabs;
