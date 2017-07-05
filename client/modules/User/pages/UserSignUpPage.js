import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import isEmail from "validator/lib/isEmail";
import Helmet from "react-helmet";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import isBoolean from "lodash/isBoolean";
import isPromise from "is-promise";

const styles = {
  paper: {
    textAlign: "center",
    verticalAlign: "middle",
    width: 500,
    margin: "auto"
  },
  form: {
    padding: 15
  }
};

class UserSignUpForm extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      errors: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      }
    };
    this._schema = {
      firstName: {
        required: true,
        maxLength: 50
      },
      lastName: {
        required: true,
        maxLength: 50
      },
      email: {
        required: true,
        minLength: 4,
        maxLength: 50,
        validate: {
          validators: [
            {
              validator: v => {
                return isEmail(v);
              },
              message: "格式錯誤"
            },
            {
              validator: v => {
                // TODO
                // return Promise for async fetch for check email duplicate.
                return v && true;
              },
              message: "這個電子郵件已有人使用"
            }
          ]
        }
      },
      password: {
        required: true,
        minLength: 4,
        maxLength: 50
      },
      confirmPassword: {
        required: true,
        minLength: 4,
        maxLength: 50,
        validate: {
          validator: v => {
            return v === this.state.password;
          },
          message: ""
        }
      }
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getErrorText = fieldName => {
    const error = this.validate(fieldName, this.state[fieldName]);
    return error ? error.message : "";
  };

  validate = (fieldName, v) => {
    const schema = this._schema;
    const field = schema[fieldName];
    if (field.required && v === "") {
      return { message: "這裡必須填入資料" };
    } else if (field.minLength && v.length < field.minLength) {
      return { message: `需要${field.minLength}個字元` };
    } else if (field.maxLength && v.length > field.maxLength) {
      return { message: `必須小於${field.maxLength}字元` };
    } else if (field.validate) {
      if (field.validate.validator) {
        const result = field.validate.validator(v);
        if (isBoolean(result) && !result) {
          return { message: field.validate.validator.message };
        } else if (isPromise(result)) {
          return result;
        }
      } else if (field.validators) {
        for (const validator of field.validators) {
          const result = validator.validator(v);
          if (isBoolean(result) && !result) {
            return { message: validator.message };
          } else if (isPromise(result)) {
            return result;
          }
        }
      }
    }
    return null;
  };

  handleChange = (fieldName, e) => {
    const v = e.traget.value;
    const newState = {};
    newState[fieldName] = v;
    const result = this.vlidate(fieldName, v);
    if (isPromise(result)) {
      result.then(r => {
        if (r && r.message) {
          const newState2 = {};
          newState2.errors = {};
          newState2.errors[fieldName] = r.message;
          if (this._isMounted) {
            this.setState(newState2);
          }
        }
      });
    } else if (result && result.message) {
      newState.errors = {};
      newState.errors[fieldName] = result.message;
    }
    this.setState(newState);
  };

  render() {
    return (
      <div>
        <TextField
          hintText="姓氏"
          floatingLabelText="姓氏"
          value={this.state.firstName}
          onChange={this.handleChange.bind(this, "firstName")}
          autoFocus={true}
          errorText={this.state.errors.firstName}
        />
        <br />
        <TextField
          hintText="名字"
          floatingLabelText="名字"
          value={this.state.lastName}
          onChange={this.handleChange.bind(this, "lastName")}
          errorText={this.state.errors.lastName}
        />
        <br />
        <TextField
          hintText="電子郵件"
          floatingLabelText="電子郵件"
          value={this.state.email}
          onChange={this.handleChange.bind(this, "email")}
          errorText={this.state.errors.email}
        />
        <br />
        <TextField
          hintText="建立密碼"
          floatingLabelText="建立密碼"
          value={this.state.password}
          onChange={this.handleChange.bind(this, "password")}
          errorText={this.state.errors.password}
        />
        <br />
        <TextField
          hintText="確認密碼"
          floatingLabelText="確認密碼"
          value={this.state.confirmPassword}
          onChange={this.handleChange.bind(this, "confirmPassword")}
          errorText={this.state.errors.confirmPassword}
        />
        <br />
        <RaisedButton
          label="建立"
          primary={true}
          style={{
            width: 256,
            marginTop: 50,
            marginBottom: 20
          }}
        />
      </div>
    );
  }
}

class UserSignUpPage extends Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  renderDesktop = () => {
    return (
      <Paper style={styles.paper}>
        <div style={styles.loginForm}>
          <UserSignUpForm />
        </div>
      </Paper>
    );
  };

  renderMobile = () => {
    return (
      <div style={styles.form}>
        <UserSignUpForm />
      </div>
    );
  };

  render() {
    const meta = [
      {
        name: "description",
        content: "註冊"
      }
    ];
    const content = this.props.browser.lessThan.medium
      ? this.renderMobile()
      : this.renderDesktop();
    return (
      <div>
        <Helmet title="註冊" meta={meta} /> {content}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const browser = state.browser;
  return { browser };
}

export default connect(mapStateToProps)(UserSignUpPage);
