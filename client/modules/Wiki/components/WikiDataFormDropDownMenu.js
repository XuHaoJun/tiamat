import React from "react";
import DropDownMenu from "material-ui/DropDownMenu";
import MenuItem from "material-ui/MenuItem";

class WikiDataFormDropDownMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 1 };
  }

  handleChange = (event, index, value) => this.setState({ value });

  render() {
    return (
      <div>
        <DropDownMenu value={this.state.value} onChange={this.handleChange}>
          <MenuItem value={1} primaryText="資料格式(尚未完成)" />
          <MenuItem value={2} primaryText="裝備" />
          <MenuItem value={3} primaryText="技能寶石" />
          <MenuItem value={4} primaryText="商店配方" />
          <MenuItem value={5} primaryText="Build" />
        </DropDownMenu>
      </div>
    );
  }
}

export default WikiDataFormDropDownMenu;
