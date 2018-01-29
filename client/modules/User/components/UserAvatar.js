import React from "react";
import randomColor from "randomcolor";
import LazyLoad from "react-lazyload";
import pure from "recompose/pure";

import Avatar from "material-ui-next/Avatar";
import GuestPersonIcon from "material-ui-icons-next/Person";

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

const getAvatarProps = props => {
  const { user, enableLazyLoad, ...other } = props;
  return other;
};

const renderByText = (text, props) => {
  const { user } = props;
  const other = getAvatarProps(props);
  const { _id } = user;
  const backgroundColor = randomColor({
    luminosity: "dark",
    seed: _id || text
  });
  return (
    <Avatar style={{ backgroundColor }} {...other}>
      {text}
    </Avatar>
  );
};

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
      const displayName = user.get("displayName");
      return (
        <LazyLoad height={32} once={true} placeholder={placeholder}>
          <Avatar alt={displayName} src={src} {...other} />
        </LazyLoad>
      );
    } else {
      return <Avatar src={src} {...other} />;
    }
  } else if (text) {
    return renderByText(text, props);
  } else if (icon) {
    return (
      <Avatar {...other}>
        <GuestPersonIcon />
      </Avatar>
    );
  } else {
    return <Avatar {...other} />;
  }
};

UserAvatar.defaultProps = {
  user: null,
  enableLazyLoad: true
};

export default pure(UserAvatar);
