import React from "react";
import TextField from "material-ui/TextField";
import DropDownMenu from "material-ui/DropDownMenu";
import MenuItem from "material-ui/MenuItem";
import FlatButton from "material-ui/FlatButton";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

export function getStyles() {
  return {
    form: {
      marginBottom: 20
    }
  };
}

class CreateForumBoardForm extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      type: 1,
      name: ""
    };
  }

  getForm = () => {
    const { type, name } = this.state;
    return { type, name };
  };

  handleChangeType = (event, index, type) => this.setState({ type });

  handleChangeName = event => {
    this.setState({ name: event.target.value });
  };

  render() {
    // const styles = getStyles();
    const { type, name } = this.state;
    return (
      <div>
        <TextField
          style={{ marginLeft: 24 }}
          floatingLabelText="看板名字"
          value={name}
          onChange={this.handleChangeName}
        />
        <br />
        <DropDownMenu value={type} onChange={this.handleChangeType}>
          <MenuItem value={1} primaryText="遊戲類型" />
          <MenuItem value={2} primaryText="角色扮演" />
          <MenuItem value={3} primaryText="動作" />
          <MenuItem value={4} primaryText="射擊" />
        </DropDownMenu>
        <br />
        <FlatButton label="上傳看板 Icon (36x36) (尚未完成)" primary={true} />
      </div>
    );
  }
}

export default CreateForumBoardForm;
