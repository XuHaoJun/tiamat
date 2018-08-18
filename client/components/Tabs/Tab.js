import React from 'react';
import PropTypes from 'prop-types';

import Tab from '@material-ui/core/Tab';

class EnhancedTab extends React.Component {
  static propTypes = {
    enableMouseOverTrigger: PropTypes.bool,
  };

  static defaultProps = {
    enableMouseOverTrigger: true,
  };

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  handleChange = event => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const { enableMouseOverTrigger, onChange, value, onMouseOver } = this.props;
    if (onChange && enableMouseOverTrigger) {
      this.timeout = setTimeout(() => {
        onChange(event, value);
      }, 200);
    }
    if (onMouseOver) {
      onMouseOver(event);
    }
  };

  handleMouseLeave = event => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    const { onMouseLeave } = this.props;
    if (onMouseLeave) {
      onMouseLeave(event);
    }
  };

  render() {
    const {
      enableMouseOverTrigger,
      onMouseOver: onMouseOverInput,
      onMouseLeave,
      ...other
    } = this.props;
    return (
      <Tab
        {...other}
        onMouseOver={this.handleChange}
        onMouseLeave={this.handleMouseLeave}
        onFocus={other.onFocus}
      />
    );
  }
}

export default EnhancedTab;
