import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import Ajv from 'ajv';
import { Link } from 'react-router-dom';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import { push } from 'react-router-redux';
import { getOauth2Client } from '../../../Oauth2Client/Oauth2ClientReducer';
import { logInRequest } from '../../UserActions';

import ajvExtends from '../../utils/ajvExtends';
import logInFormschema from './schema.json';

const ajv = ajvExtends(new Ajv({ allErrors: true }));

const validate = ajv.compile(logInFormschema);

class LogInForm extends React.Component {
  static propTypes = {
    initEmail: PropTypes.string,
    initPassword: PropTypes.string,
    onClickSignUpButton: PropTypes.func,
    login: PropTypes.func,
    // loginByFacebook: PropTypes.func,
    // loginByGoogle: PropTypes.func
  };

  static defaultProps = {
    initEmail: '',
    initPassword: '',
    onClickSignUpButton: undefined,
    login: undefined,
    // loginByFacebook: undefined,
    // loginByGoogle: undefine
  };

  constructor(props) {
    super(props);
    const { initEmail, initPassword } = props;
    const textFieldDefault = {
      email: initEmail,
      password: initPassword,
    };
    this.textFieldDefault = textFieldDefault;
    const textFieldErrorDefault = Object.keys(textFieldDefault).reduce((result, fieldName) => {
      const errorFieldName = this.getErrorFieldName(`${fieldName}Error`);
      return Object.assign(result, { [errorFieldName]: '' });
    }, {});
    this.textFieldErrorDefault = textFieldErrorDefault;
    this.state = Object.assign({}, textFieldDefault, textFieldErrorDefault);
  }

  getErrorFieldName = fieldName => {
    return `${fieldName}Error`;
  };

  getForm = () => {
    const form = Object.keys(this.textFieldDefault).reduce((result, fieldName) => {
      return Object.assign(result, { [fieldName]: this.state[fieldName] });
    }, {});
    return form;
  };

  login = () => {
    const { login } = this.props;
    if (login) {
      const form = this.getForm();
      const valid = validate(form);
      return login(form, valid);
    }
    return Promise.resolve(null);
  };

  validate = validate;

  submit = () => {
    this.validateAndUpdateAll();
    const form = this.getForm();
    const valid = validate(form);
    return valid;
  };

  handleSubmit = e => {
    e.preventDefault();
    const form = this.getForm();
    const valid = this.submit();
    if (this.props.onSubmit) {
      this.props.onSubmit(e, form, valid);
    }
    const { login } = this.props;
    valid.then(() => {
      if (login) {
        return login(form, valid);
      }
      return null;
    });
  };

  validateAndUpdateAll = () => {
    for (const fieldName of Object.keys(this.textFieldDefault)) {
      this.validateAndUpdate(fieldName);
    }
  };

  validateAndUpdate = fieldName => {
    const errorFieldName = this.getErrorFieldName(fieldName);
    const valid = validate(this.getForm());
    valid
      .then(() => {
        this.setState({ [errorFieldName]: '' });
      })
      .catch(ajvError => {
        if (!(ajvError instanceof Ajv.ValidationError)) throw ajvError;
        const found = _.find(ajvError.errors, err => {
          const matchedFieldName = err.dataPath.substring(1); // remove dot
          return matchedFieldName === fieldName;
        });
        if (found) {
          this.setState({ [errorFieldName]: found.message });
        } else {
          this.setState({ [errorFieldName]: '' });
        }
      });
  };

  handleBlur = fieldName => {
    this.validateAndUpdate(fieldName);
  };

  handleChange = (fieldName, event) => {
    const v = event.target.value;
    this.setState({ [fieldName]: v }, () => {
      if (v.length < 5 && fieldName === 'email') {
        return;
      }
      const errorFieldName = this.getErrorFieldName(fieldName);
      const valid = validate(this.getForm());
      valid
        .then(() => {
          this.setState({ [errorFieldName]: '' });
        })
        .catch(ajvError => {
          if (!(ajvError instanceof Ajv.ValidationError)) throw ajvError;
          const found = _.find(ajvError.errors, err => {
            const matchedFieldName = err.dataPath.substring(1); // remove dot
            return matchedFieldName === fieldName && err.keyword !== 'emailExists';
          });
          if (found) {
            this.setState({ [errorFieldName]: found.message });
          } else {
            this.setState({ [errorFieldName]: '' });
          }
        });
    });
  };

  render() {
    const { style } = this.props;
    return (
      <div style={style}>
        <form onSubmit={this.handleSubmit}>
          <TextField
            autoFocus={true}
            id="loginForm-email-text-field"
            type="email"
            label="電子郵件"
            onChange={e => this.handleChange('email', e)}
            onBlur={e => this.handleBlur('email', e)}
            value={this.state.email}
            helperText={this.state.emailError}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            marigin="auto"
          />
          <br />
          <TextField
            marigin="auto"
            id="loginForm-password-text-field"
            type="password"
            label="密碼"
            onChange={e => this.handleChange('password', e)}
            value={this.state.password}
            helperText={this.state.passwordError}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <br />
          <Button
            variant="raised"
            style={{
              width: 256,
              marginTop: 20,
              marginBottom: 20,
            }}
            type="submit"
            color="primary"
          >
            登入
          </Button>
          <br />
          <Button component={Link} to="/signup">
            註冊新帳號
          </Button>
          <Button>忘記密碼?(尚未完成)</Button>
          <br />
          <Divider style={{ marginTop: 10, marginBottom: 10 }} />
          <br />
          <Button
            style={{
              width: 256,
              marginTop: 20,
            }}
          >
            使用 Facebook 登入(尚未完成)
          </Button>
          <br />
          <Button
            style={{
              width: 256,
              marginTop: 20,
            }}
          >
            使用 Google 登入(尚未完成)
          </Button>
        </form>
      </div>
    );
  }
}

export default connect(
  state => {
    const oauth2Client = getOauth2Client(state);
    return { oauth2Client };
  },
  dispatch => {
    return {
      onClickSignUpButton() {
        dispatch(push('/signup'));
      },
      dispatch,
    };
  },
  // FIXME
  (stateProps, dispatchProps, ownProps) => {
    const { oauth2Client } = stateProps;
    const { dispatch } = dispatchProps;
    return {
      ...ownProps,
      login(form) {
        const { email, password } = form;
        return dispatch(logInRequest({ oauth2Client, email, password }));
      },
    };
  },
  {
    withRef: true,
  }
)(LogInForm);
