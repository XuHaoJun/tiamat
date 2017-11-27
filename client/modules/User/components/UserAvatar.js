import React from "react";
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

const UserAvatar = ({ user, ...other }) => {
  const { text, src, icon } = getTextOrSrcOrIcon(user);
  if (src) {
    return <Avatar src={src} {...other} />;
  } else if (text) {
    return <Avatar {...other}>{text}</Avatar>;
  } else if (icon) {
    return <Avatar icon={icon} {...other} />;
  } else {
    return <Avatar {...other} />;
  }
};

UserAvatar.muiName = Avatar.muiName;

export default UserAvatar;
