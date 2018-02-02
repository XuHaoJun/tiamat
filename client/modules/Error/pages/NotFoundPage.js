import React from "react";
import { Link } from "react-router-dom";

class NotFoundPage extends React.PureComponent {
  render() {
    return (
      <div>
        <p>抱歉啦！您恐怕得搭乘時光機才有辦法找回那個內容了。</p>
        <div>
          <Link to="/">回到首頁</Link>
        </div>
      </div>
    );
  }
}

export default NotFoundPage;
