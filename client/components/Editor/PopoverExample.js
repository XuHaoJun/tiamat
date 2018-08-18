import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';

export default class PopoverExampleSimple extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleTouchTap = event => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          onMouseOut={this.handleRequestClose}
          onMouseEnter={this.handleTouchTap}
          label="Click me"
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{
            horizontal: 'left',
            vertical: 'bottom',
          }}
          targetOrigin={{
            horizontal: 'left',
            vertical: 'top',
          }}
          onRequestClose={this.handleRequestClose}
        >
          <Paper
            style={{
              width: 250,
              height: 100,
            }}
            onMouseOut={this.handleRequestClose}
            onMouseEnter={this.handleTouchTap}
          >
            Pokemon wiki content.
          </Paper>
        </Popover>
      </div>
    );
  }
}
