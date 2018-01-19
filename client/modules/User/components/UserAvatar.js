import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import randomColor from "randomcolor";
import LazyLoad from "react-lazyload";

import Avatar from "material-ui/Avatar";
import GuestPersonIcon from "material-ui/svg-icons/social/person";

function getTextOrSrcOrIcon(user) {
  if (user) {
    const { avatarURL } = user;
    if (avatarURL) {
      return { src: avatarURL };
    } else {
      let text;
      const { displayName, email } = user;
      text = displayName || email || "";
      if (text) {
        const chineseRegExp = new RegExp("^[\u4E00-\uFA29]*$");
        if (chineseRegExp.test(text.substring(0, 2))) {
          text = text.substring(0, 2);
        } else {
          text = text.substring(0, 1);
        }
      }
      return {
        text
      };
    }
  } else {
    return { icon: <GuestPersonIcon /> };
  }
}

class UserAvatar extends React.Component {
  static defaultProps = {
    user: null,
    enableLazyLoad: true
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate;
  }

  getAvatarProps = () => {
    const { user, enableLazyLoad, ...other } = this.props;
    return other;
  };

  renderByText = (text, user = this.props.user) => {
    const other = this.getAvatarProps();
    const { _id } = user;
    const backgroundColor = randomColor({
      luminosity: "dark",
      seed: _id || text
    });
    return (
      <Avatar backgroundColor={backgroundColor} {...other}>
        {text}
      </Avatar>
    );
  };

  render() {
    const { user, enableLazyLoad, ...other } = this.props;
    const { text, src, icon } = getTextOrSrcOrIcon(user);
    if (src) {
      if (enableLazyLoad) {
        const placeholder = <Avatar icon={<GuestPersonIcon />} {...other} />;
        return (
          <LazyLoad height={32} once={true} placeholder={placeholder}>
            <Avatar src={src} {...other} />
          </LazyLoad>
        );
      } else {
        return <Avatar src={src} {...other} />;
      }
    } else if (text) {
      return this.renderByText(text, user);
    } else if (icon) {
      return <Avatar icon={icon} {...other} />;
    } else {
      return <Avatar {...other} />;
    }
  }
}

UserAvatar.muiName = Avatar.muiName;

export default UserAvatar;
