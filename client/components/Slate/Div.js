import React from "react";

class Div extends React.PureComponent {
  render() {
    const props = this.props;
    return (
      <div {...props}>
        {props.children}
      </div>
    );
  }
}

export default Div;
