import React from "react";

import Select from "material-ui-next/Select";
import { MenuItem } from "material-ui-next/Menu";

class WikiDataFormDropDownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 1 };
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
      <Select
        value={this.state.value}
        onChange={this.handleChange}
        inputProps={{
          name: "value"
        }}
      >
        <MenuItem value={1}>資料格式(尚未完成)</MenuItem>
        <MenuItem value={2}>裝備</MenuItem>
        <MenuItem value={3}>技能寶石</MenuItem>
        <MenuItem value={4}>商店配方</MenuItem>
        <MenuItem value={5}>Build</MenuItem>
      </Select>
    );
  }
}

export default WikiDataFormDropDownMenu;
