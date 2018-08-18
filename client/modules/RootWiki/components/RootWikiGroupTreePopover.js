import React from 'react';
import { Map, List as ImmutableList, fromJS } from 'immutable';

import Button from '@material-ui/core/Button';
import MenuList from '@material-ui/core/MenuItem';
import MenuItem from '../../../components/NestingMenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import ArrowDropDown from '@material-ui/icons/KeyboardArrowDown';

const style = {
  display: 'inline-block',
  margin: '16px 32px 16px 0',
};

export function getRootWikiGroupTreeMenuItemsHelper(rootWikiGroupTree, prefix = '') {
  const delimiter = ':';
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
        <MenuItem value={value} key={value} menuItems={menuItems}>
          <ListItemText primary={k} />
        </MenuItem>
      );
    });
  } else if (ImmutableList.isList(rootWikiGroupTree)) {
    return rootWikiGroupTree
      .map(leaf => {
        const value = `${prefix}${delimiter}${leaf}`;
        return (
          <MenuItem key={value}>
            <ListItemText primary={leaf} />
          </MenuItem>
        );
      })
      .toJS();
  }
  return null;
}

class RootWikiGroupTreePopover extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  onItemClick = (event, menuItem, index) => {
    event.preventDefault();
  };

  handleClick = event => {
    // This prevents ghost click.
    event.preventDefault();
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleClose = reason => {
    console.log('root close');
    this.setState({ open: false });
  };

  render() {
    const rootWikiGroupTree = fromJS({
      物品: {
        武器: ['長劍', '斧'],
        防具: ['重甲', '皮革'],
      },
      技能: ['戰士', '法師'],
      '深度測試(一)': {
        '深度測試(二)': {
          '深度測試(三)': {
            '深度測試(四)': {
              '深度測試(五)': {
                '深度測試(六)': {
                  '深度測試(七)': {
                    '深度測試(八)': {
                      '深度測試(九)': ['你看到我了!'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    // const rootWikiGroupTree = fromJS([
    //   {
    //     name: "裝備",
    //     children: [
    //       {
    //         name: "武器",
    //         children: [
    //           {
    //             name: "長劍"
    //           },
    //           {
    //             name: "斧"
    //           },
    //           {
    //             name: "槍"
    //           }
    //         ]
    //       },
    //       {
    //         name: "防具",
    //         children: [
    //           {
    //             name: "皮甲"
    //           },
    //           {
    //             name: "重甲"
    //           }
    //         ]
    //       }
    //     ]
    //   },
    //   {
    //     name: "卡片",
    //     children: [
    //       {
    //         name: "法師"
    //       },
    //       {
    //         name: "盜賊"
    //       }
    //     ]
    //   },
    //   {
    //     name: "深度測試(一)",
    //     children: [
    //       {
    //         name: "深度測試(二)",
    //         children: [
    //           {
    //             name: "深度測試(三)",
    //             children: [
    //               {
    //                 name: "深度測試(四)",
    //                 children: [
    //                   {
    //                     name: "深度測試(五)",
    //                     children: [
    //                       {
    //                         name: "你看見我了!"
    //                       }
    //                     ]
    //                   }
    //                 ]
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     ]
    //   }
    // ]);
    const menuItems = getRootWikiGroupTreeMenuItemsHelper(rootWikiGroupTree)
      .toList()
      .toJS();
    return (
      <div>
        <Button onClick={this.handleClick}>
          <ArrowDropDown />
          未分類(尚未完成)可以選好幾組
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            horizontal: 'left',
            vertical: 'bottom',
          }}
          transformOrigin={{
            horizontal: 'left',
            vertical: 'top',
          }}
          onClose={this.handleClose}
        >
          <MenuList>{menuItems}</MenuList>
        </Popover>
      </div>
    );
  }
}

export default RootWikiGroupTreePopover;
