import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

import TextField from "@material-ui/core/TextField";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";

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
      type: "",
      typePlaceholder: "遊戲類型",
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
          label="看板名字"
          value={name}
          onChange={this.handleChangeName}
        />
        <br />
        <React.Fragment>
          <Button
            onClick={event => {
              this.setState({ anchorEl: event.currentTarget });
            }}
          >
            {type || this.state.typePlaceholder}
            <ArrowDropDown />
          </Button>
          <Menu
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={() => {
              this.setState({ anchorEl: null });
            }}
          >
            <MenuItem
              selected={type === "角色扮演"}
              onClick={() => {
                this.setState({
                  anchorEl: null,
                  type: "角色扮演"
                });
              }}
            >
              角色扮演
            </MenuItem>
            <MenuItem
              selected={type === "動作"}
              onClick={() => {
                this.setState({
                  anchorEl: null,
                  type: "動作"
                });
              }}
            >
              動作
            </MenuItem>
            <MenuItem
              selected={type === "射擊"}
              onClick={() => {
                this.setState({
                  anchorEl: null,
                  type: "射擊"
                });
              }}
            >
              射擊
            </MenuItem>
          </Menu>
        </React.Fragment>
        <br />
        <Button color="primary">上傳看板 Icon (36x36) (尚未完成)</Button>
      </div>
    );
  }
}

export default CreateForumBoardForm;
