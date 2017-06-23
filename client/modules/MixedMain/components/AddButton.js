import React from 'react';
import PropTypes from 'prop-types';
import CreateIcon from 'material-ui/svg-icons/content/create';
import AddIcon from 'material-ui/svg-icons/content/add';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Portal from 'react-portal-minimal';

class AddButton extends React.PureComponent {
  static propTypes = {
    isOpened: PropTypes.bool,
    iconType: PropTypes.oneOf(['create', 'add']),
    href: PropTypes.string,
    onTouchTap: PropTypes.func,
    onClick: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    isOpened: true,
    iconType: 'create',
    href: '',
    onTouchTap: () => {},
    onClick: () => {}
  }

  onTouchTap = (e) => {
    if (e.nativeEvent.which === 3 || !this.props.href) {
      return;
    }
    const href = this.props.href;
    if (href) {
      this
        .context
        .router
        .push(this.props.href);
    }
    e.preventDefault();
    if (this.props.onTouchTap) {
      this
        .props
        .onTouchTap(e);
    }
  }

  onClick = (e) => {
    e.preventDefault();
    if (this.props.onClick) {
      this
        .props
        .onClick(e);
    }
  }

  setPortalRef = (v) => {
    this.portal = v;
  }

  render() {
    const {
      style,
      isOpened,
      iconType,
      href,
      onTouchTap,
      onClick,
      ...other
    } = this.props;
    if (!isOpened) {
      return null;
    }
    const _style = {
      position: 'fixed',
      bottom: 20,
      right: 20
    };
    const finalStyle = Object.assign(_style, style || {});
    return (
      <Portal ref={this.setPortalRef}>
        <FloatingActionButton
          {...other}
          style={finalStyle}
          href={href}
          onTouchTap={this.onTouchTap}
          onClick={this.onClick}>
          {
            iconType === 'create'
              ? (<CreateIcon/>)
              : (<AddIcon/>)
          }
        </FloatingActionButton>
      </Portal>
    );
  }
}

export default AddButton;