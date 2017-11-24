import React from "react";
import PropTypes from "prop-types";
import Avatar from "material-ui/Avatar";
import GuestPersonIcon from "material-ui/svg-icons/social/person";
import { shouldComponentUpdate } from "react-immutable-render-mixin";

class UserAvatar extends React.Component {
  static propTypes = {
    user: PropTypes.object
  };

  static defaultProps = {
    user: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render() {
    const { user } = this.props;
    if (user) {
      const displayName = user.get("displayName");
      const email = user.get("email");
      let text = displayName || email || "";
      if (text.length > 1) {
        text = text.substring(0, 1);
        // TODO
        // chinese word substring(0, 2)
        // eng word to uppercase
        text = text.toUpperCase();
      }
      return <Avatar>{text}</Avatar>;
    } else {
      return <Avatar icon={<GuestPersonIcon />} />;
    }
  }
}

export default UserAvatar;
