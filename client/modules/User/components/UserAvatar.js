import React from "react";
import randomColor from "randomcolor";
import LazyLoad from "react-lazyload";

import Avatar from "@material-ui/core/Avatar";
import GuestPersonIcon from "@material-ui/icons/Person";

function getTextOrSrcOrIcon(user) {
  if (user) {
    const { avatarURL, displayName } = user;
    if (avatarURL) {
      return { src: avatarURL };
    } else if (displayName) {
      let text;
      const chineseRegExp = new RegExp("^[\u4E00-\uFA29]*$");
      if (chineseRegExp.test(displayName.substring(0, 2))) {
        text = displayName.substring(0, 2);
      } else {
        text = displayName.substring(0, 1);
      }
      return {
        text
      };
    } else {
      return { icon: <GuestPersonIcon /> };
    }
  } else {
    return { icon: <GuestPersonIcon /> };
  }
}

const UserAvatar = props => {
  const { user, enableLazyLoad, ...other } = props;
  const { text, src, icon } = getTextOrSrcOrIcon(user);
  if (src) {
    if (enableLazyLoad) {
      const placeholder = (
        <Avatar {...other}>
          <GuestPersonIcon />
        </Avatar>
      );
      const { displayName } = user;
      return (
        <LazyLoad height={32} once={true} placeholder={placeholder}>
          <Avatar alt={displayName} src={src} {...other} />
        </LazyLoad>
      );
    } else {
      return <Avatar src={src} {...other} />;
    }
  } else if (text) {
    const { _id } = user;
    const backgroundColor = randomColor({
      luminosity: "dark",
      seed: _id || text
    });
    const style = { backgroundColor, ...props.style };
    return (
      <Avatar {...other} style={style}>
        {text}
      </Avatar>
    );
  } else if (icon) {
    return <Avatar {...other}>{icon}</Avatar>;
  } else {
    return <Avatar {...other} />;
  }
};

UserAvatar.defaultProps = {
  user: null,
  enableLazyLoad: true
};

export default UserAvatar;
