import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';

class LoginForm extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      emailTextFieldValue: '',
      passwordTextFieldValue: '',
      emailFocus: true,
      passwordFocus: false
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
  };

  handleFocus = (focusName, v) => {
    const update = {};
    update[focusName] = v;
    this.setState(update);
  };

  handleEmailFocus = this.handleFocus.bind(this, 'emailFocus', true);

  handlePasswordFocus = this.handleFocus.bind(this, 'passwordFocus', true);

  handleEmailBlur = this.handleFocus.bind(this, 'emailFocus', false);

  handlePasswordBlur = this.handleFocus.bind(this, 'passwordFocus', false);

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <TextField
            autoFocus={true}
            onFocus={this.handleEmailFocus}
            onBlur={this.handleEmailBlur}
            name="loginForm-emailTexField"
            value={this.state.emailTextFieldValue}
            onChange={(e) => {
              this.setState({emailTextFieldValue: e.target.value});
            }}
            hintText={this.state.emailFocus
              ? ''
              : '電子郵件'}
            floatingLabelText="電子郵件"/>
          <br/>
          <TextField
            onFocus={this.handlePasswordFocus}
            onBlur={this.handlePasswordBlur}
            name="loginForm-passwordTexField"
            value={this.state.passwordTextFieldValue}
            onChange={(e) => {
              this.setState({passwordTextFieldValue: e.target.value});
            }}
            hintText={this.state.passwordFocus
              ? ''
              : '密碼'}
            floatingLabelText="密碼"/>
          <br/>
          <RaisedButton
            style={{
              width: 256,
              marginTop: 20
            }}
            primary={true}
            label="登入"/>
          <br/>
          <FlatButton
            style={{
              width: 128,
              marginTop: 15,
            }}
            label="註冊新帳號"/>
          <br/>
          <FlatButton
            style={{
              width: 128,
            }}
            label="忘記密碼?"/>
          <Divider style={{marginTop: 20}}/>
          <RaisedButton
            style={{
              width: 256,
              marginTop: 20
            }}
            label="使用 Facebook 登入"/>
          <br/>
          <RaisedButton
            style={{
              width: 256,
              marginTop: 20
            }}
            label="使用 Google 登入"/>
        </form>
      </div>
    );
  }
}

export default LoginForm;
