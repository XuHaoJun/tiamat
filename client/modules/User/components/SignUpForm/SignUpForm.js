import React from "react";
import PropTypes from "prop-types";
import isEmail from "validator/lib/isEmail";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import isBoolean from "lodash/isBoolean";
import isPromise from "is-promise";
import _ from "lodash";
import { connect } from "react-redux";
import { getOauth2Client } from "../../../Oauth2Client/Oauth2ClientReducer";
import {
  addUserRequest,
  fetchValidateUser,
  logInRequest
} from "../../UserActions";

class SignUpForm extends React.PureComponent {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  static propTypes = {
    onSubmit: PropTypes.func,
    validateEmail: PropTypes.func
  };

  static defaultProps = {
    onSubmit: () => {},
    validateEmail: () => Promise.resolve(true)
  };

  constructor(props) {
    super(props);
    const { validateEmail } = props;
    this.state = {
      email: "",
      password: "",
      confirmPassword: "",
      progressing: false,
      errors: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      }
    };
    this._fields = _.filter(Object.keys(this.state), field => {
      if (field === "errors" || field === "progressing") {
        return false;
      } else {
        return true;
      }
    });
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
              event: {
                onChange: false,
                onBlur: true
              },
              validator: validateEmail,
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
          message: "密碼不相同"
        }
      }
    };
  }

  getForm = () => {
    const { email, password } = this.state;
    return {
      email,
      password
    };
  };

  getErrorText = fieldName => {
    const error = this.validate(fieldName, this.state[fieldName]);
    return error ? error.message : "";
  };

  setNextErrorState = (fieldName, v, eventName) => {
    const nextState = {};
    nextState[fieldName] = v;
    const result = this.validate(fieldName, v, eventName);
    if (isPromise(result)) {
      result.then(r => {
        if (r && r.message) {
          const nextState2 = {};
          nextState2.errors = {};
          nextState2.errors[fieldName] = r.message;
          this.setState(nextState2);
        }
      });
    } else if (result && result.message) {
      nextState.errors = this.state.errors;
      nextState.errors[fieldName] = result.message;
    } else {
      nextState.errors = this.state.errors;
      nextState.errors[fieldName] = "";
    }
    this.setState(nextState);
  };

  validate = (fieldName, v, eventName = "onChange") => {
    this._validate(this._schema, fieldName, v, eventName);
  };

  _validate = (schema, fieldName, v, eventName = "onChange") => {
    const field = schema[fieldName];
    if (typeof field === "undefined") {
      return { message: "undefined" };
    }
    if (field.required && v === "") {
      return { message: "這裡必須填入資料" };
    } else if (field.minLength && v.length < field.minLength) {
      return { message: `需要${field.minLength}個字元` };
    } else if (field.maxLength && v.length > field.maxLength) {
      return { message: `必須小於${field.maxLength}字元` };
    } else if (field.validate) {
      if (field.validate.validator) {
        field.validate.validators = [field.validate];
      }
      if (field.validate.validators) {
        for (const validator of field.validate.validators) {
          const isDisableEvent =
            validator.event && validator.event[eventName] === false;
          if (!isDisableEvent) {
            const result = validator.validator(v);
            if (isBoolean(result) && !result) {
              return { message: validator.message };
            } else if (isPromise(result)) {
              return result.catch(() => {
                return { message: validator.message };
              });
            }
          }
        }
      }
    }
    return null;
  };

  handleBlur = fieldName => {
    this.setNextErrorState(fieldName, this.state.email, "onBlur");
  };

  handleChange = (fieldName, e) => {
    const v = e.target.value;
    this.setNextErrorState(fieldName, v, "onChange");
  };

  hasErrorField = () => {
    const hasError = !!_.find(this.state.errors, err => {
      const isExist = !!err;
      return isExist;
    });
    return hasError;
  };

  hasEmptyField = () => {
    return !!_.find(this._fields, field => {
      const v = this.state[field];
      const isEmpty = !v;
      return isEmpty;
    });
  };

  canSubmit = () => {
    return this.hasErrorField() === false && this.hasEmptyField() === false;
  };

  handleSubmit = e => {
    e.preventDefault();
    if (this.canSubmit()) {
      this.setState({ progressing: true });
      if (this.props.onSubmit) {
        const form = this.getForm();
        const p = this.props.onSubmit(e, form);
        if (p.then) {
          p
            .then(progressing => {
              this.setState({ progressing: !!progressing });
            })
            .catch(err => {
              this.setState({ progressing: false });
            });
        }
      } else {
        setTimeout(() => {
          this.setState({ progressing: false });
        }, 1000);
      }
    }
  };

  render() {
    const { style } = this.props;
    return (
      <div style={style}>
        <form onSubmit={this.handleSubmit}>
          <TextField
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoFocus={true}
            type="email"
            id="sign-up-form-email"
            floatingLabelText="電子郵件"
            value={this.state.email}
            onBlur={this.handleBlur.bind(this, "email")}
            onChange={this.handleChange.bind(this, "email")}
            errorText={this.state.errors.email}
          />
          <br />
          <TextField
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            floatingLabelText="建立密碼"
            id="sign-up-form-password"
            type="password"
            value={this.state.password}
            onChange={this.handleChange.bind(this, "password")}
            errorText={this.state.errors.password}
          />
          <br />
          <TextField
            floatingLabelText="確認密碼"
            id="sign-up-form-confirm-password"
            type="password"
            value={this.state.confirmPassword}
            onChange={this.handleChange.bind(this, "confirmPassword")}
            errorText={this.state.errors.confirmPassword}
          />
          <br />
          <RaisedButton
            label="註冊"
            type="submit"
            disabled={this.state.progressing}
            primary={true}
            style={{
              width: 256,
              marginTop: 50,
              marginBottom: 20
            }}
          />
        </form>
      </div>
    );
  }
}

export const SignUpFormWithoutConnect = SignUpForm;

function mapStateToProps(state, props) {
  let oauth2Client;
  if (!props.oauth2CLient) {
    oauth2Client = getOauth2Client(state);
  } else {
    oauth2Client = props.oauth2CLient;
  }
  return {
    oauth2Client, // for fetchAccessToken after signup success
    validateEmail: email => fetchValidateUser({ emailExists: email })
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { oauth2Client } = stateProps;
  const { dispatch } = dispatchProps;
  return {
    ...ownProps,
    onSubmit(event, form) {
      if (ownProps.onSubmit) {
        return ownProps.onSubmit(event.form);
      } else {
        return dispatch(addUserRequest(form))
          .then(() => {
            const { email, password } = form;
            return dispatch(logInRequest({ email, password, oauth2Client }));
          })
          .catch(err => {
            if (err.message === "Request failed with status code 403") {
              const businessError = err.response.data;
              const { code, errmsg } = businessError;
              // handle duplicate key
              if (code === 11000) {
                const regex = /index: (?:.*\.)?\$?(?:([_a-z0-9]*)(?:_\d*)|([_a-z0-9]*))\s*dup key/i;
                const match = errmsg.match(regex);
                const field = match[1] || match[2];
                return false;
              } else {
                return Promise.reject(err);
              }
            } else {
              return Promise.reject(err);
            }
          });
      }
    }
  };
}

export default connect(mapStateToProps, null, mergeProps)(SignUpForm);
