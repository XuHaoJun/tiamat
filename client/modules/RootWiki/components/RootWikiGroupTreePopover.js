import React from "react";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import Popover from "material-ui/Popover";
import ArrowDropRight from "material-ui/svg-icons/navigation-arrow-drop-right";
import ArrowDropDown from "material-ui/svg-icons/navigation/arrow-drop-down";
import { Map, List as ImmutableList, fromJS } from "immutable";

const style = {
  display: "inline-block",
  margin: "16px 32px 16px 0"
};

export function getRootWikiGroupTreeMenuItemsHelper(
  rootWikiGroupTree,
  prefix = ""
) {
  const delimiter = ":";
  if (Map.isMap(rootWikiGroupTree)) {
    return rootWikiGroupTree.map((group, k) => {
      const value = `${prefix}${delimiter}${k}`;
      let menuItems;
      if (ImmutableList.isList(group)) {
        menuItems = getRootWikiGroupTreeMenuItemsHelper(group, value);
      } else if (Map.isMap(group)) {
        menuItems = getRootWikiGroupTreeMenuItemsHelper(group, value)
          .toList()
          .toJS();
      }
      return (
        <MenuItem
          value={value}
          rightIcon={<ArrowDropRight />}
          key={value}
          primaryText={k}
          menuItems={menuItems}
        />
      );
    });
  } else if (ImmutableList.isList(rootWikiGroupTree)) {
    return rootWikiGroupTree
      .map(leaf => {
        const value = `${prefix}${delimiter}${leaf}`;
        return <MenuItem value={value} key={value} primaryText={leaf} />;
      })
      .toJS();
  }
  return null;
}

class RootWikiGroupTreePopover extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  onItemTouchTap = (event, menuItem, index) => {
    event.preventDefault();
  };

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleRequestClose = reason => {
    this.setState({ open: false });
  };

  render() {
    const rootWikiGroupTree = fromJS({
      物品: {
        武器: ["長劍", "斧"],
        防具: ["重甲", "皮革"]
      },
      技能: ["戰士", "法師"],
      "深度測試(一)": {
        "深度測試(二)": {
          "深度測試(三)": {
            "深度測試(四)": {
              "深度測試(五)": {
                "深度測試(六)": {
                  "深度測試(七)": {
                    "深度測試(八)": {
                      "深度測試(九)": ["你看到我了!"]
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    const menuItems = getRootWikiGroupTreeMenuItemsHelper(rootWikiGroupTree)
      .toList()
      .toJS();
    return (
      <div>
        <Paper style={style}>
          <RaisedButton
            label="未分類(尚未完成)可以選好幾組"
            onClick={this.handleClick}
            icon={<ArrowDropDown />}
            labelPosition="before"
          />
          <Popover
            animated={false}
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{
              horizontal: "left",
              vertical: "bottom"
            }}
            targetOrigin={{
              horizontal: "left",
              vertical: "top"
            }}
            onRequestClose={this.handleRequestClose}
          >
            <Menu onItemTouchTap={this.onItemTouchTap} desktop={true}>
              {menuItems}
            </Menu>
          </Popover>
        </Paper>
      </div>
    );
  }
}

export default RootWikiGroupTreePopover;
