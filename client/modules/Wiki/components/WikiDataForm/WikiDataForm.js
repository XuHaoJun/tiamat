import React from 'react';
import PropTypes from 'prop-types';
import JsonSchemaForm from 'react-jsonschema-form';
import JSONTree from 'react-json-tree';
import { connect } from 'react-redux';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { updateWikiRequest } from '../../WikiActions';
import loadBootstrap from './utils/loadBootstrap';

import exampleSchemas from './exampleSchemas';

// const schema = {
//   title: '流亡黯道-裝備(基於 JSON Schema 產生)',
//   definitions: {
//     mod: {
//       type: 'object',
//       required: ['name', 'value'],
//       properties: {
//         name: {
//           title: '屬性',
//           type: 'string',
//           enum: ['+n 全能力', '+n 力量', '+n 敏捷', '+n 智慧', '鋼鐵反射', '閃電傷害造成中毒'],
//           // default: "+n 全能力"
//         },
//         valueType: {
//           title: '數值-類型',
//           type: 'string',
//           enum: ['fixed', 'range'],
//           enumNames: ['固定', '範圍'],
//           // default: "fixed"
//         },
//       },
//       dependencies: {
//         valueType: {
//           oneOf: [
//             {
//               required: ['value'],
//               properties: {
//                 valueType: {
//                   enum: ['fixed'],
//                 },
//                 value: {
//                   type: 'integer',
//                   title: '數值',
//                   default: 0,
//                 },
//               },
//             },
//             {
//               required: ['value'],
//               properties: {
//                 valueType: {
//                   enum: ['range'],
//                 },
//                 value: {
//                   type: 'object',
//                   title: '數值',
//                   properties: {
//                     min: {
//                       type: 'integer',
//                       default: 0,
//                     },
//                     max: {
//                       type: 'integer',
//                       default: 0,
//                     },
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       },
//     },
//   },
//   type: 'object',
//   properties: {
//     type: {
//       type: 'string',
//       enum: ['武器', '單手劍', '爪'],
//       default: '單手劍',
//       title: '類型',
//     },
//     mods: {
//       type: 'array',
//       items: {
//         $ref: '#/definitions/mod',
//       },
//     },
//   },
// };

// const _uiSchema = {
//   // mods: {
//   //   items: {
//   //     "ui:order": ["name", "valueType", "value", "*"]
//   //   }
//   // }
// };

const log = type => console.log.bind(console, type);

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

class WikiDataForm extends React.Component {
  static propTypes = {
    wiki: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { wiki } = props;
    const formData = this.getFormData(wiki);
    this.state = {
      formWikiData: formData,
      wikiDataForms: exampleSchemas,
      wikiDataFormName: 'poe',
    };
  }

  async componentDidMount() {
    // loadBootstrap()
    await import(/* webpackChunkName: "glyphicons.css" */ './utils/plugin.css');
  }

  componentWillReceiveProps(nextProps) {
    const { wiki } = nextProps;
    const formData = this.getFormData(wiki);
    this.setState({ formWikiData: formData });
  }

  getFormData = wiki => {
    const wikiData = wiki.data;
    const formData = wikiData ? (wikiData.toJS && wikiData.toJS()) || wikiData : {};
    return formData;
  };

  handleFormChange = payload => {
    this.setState({ formWikiData: payload.formData }, () => {
      const { onChange } = this.props;
      if (onChange) {
        onChange(payload);
      }
    });
  };

  handleSelectChange = event => {
    this.setState({ [event.target.name]: event.target.value, formWikiData: {} });
  };

  handleSubmit = payload => {
    this.setState({ formWikiData: payload.formData }, () => {
      const { onSubmit } = this.props;
      if (onSubmit) {
        onSubmit(payload);
      }
    });
  };

  render() {
    const { formWikiData, wikiDataForms, wikiDataFormName } = this.state;
    const { wiki } = this.props;
    const wikiDataForm = wikiDataForms[wikiDataFormName];
    const wikiData = wiki.data;
    let { jsonSchema, uiSchema } = wikiDataForm;
    jsonSchema = jsonSchema.toJS ? jsonSchema.toJS() : jsonSchema;
    uiSchema = uiSchema && uiSchema.toJS ? uiSchema.toJS() : uiSchema;
    return (
      <div>
        <h1>尚未完成</h1>{' '}
        <FormControl>
          <InputLabel htmlFor="age-simple">資料格式</InputLabel>
          <Select
            value={wikiDataFormName}
            onChange={this.handleSelectChange}
            inputProps={{
              name: 'wikiDataFormName',
              id: 'wikiDataFormSelect',
            }}
          >
            {/* <MenuItem value="">
              <em>None</em>
            </MenuItem> */}
            <MenuItem value="poe">Path of Exile</MenuItem>
            <MenuItem value="hearthStone">HearthStone</MenuItem>
          </Select>
        </FormControl>
        <JsonSchemaForm
          formData={formWikiData}
          schema={jsonSchema}
          uiSchema={uiSchema}
          onChange={this.handleFormChange}
          onSubmit={this.handleSubmit}
          onError={log('errors')}
        />
        <h1>Wiki Data</h1>
        {wikiData ? (
          <JSONTree
            theme={theme}
            data={formWikiData}
            shouldExpandNode={() => true}
            invertTheme={true}
          />
        ) : (
          'null'
        )}
        <h1>JSON Schema</h1>
        <JSONTree
          theme={theme}
          data={jsonSchema}
          invertTheme={true}
          shouldExpandNode={() => true}
        />
        <h1>UI Schema</h1>
        <JSONTree theme={theme} data={uiSchema} invertTheme={true} shouldExpandNode={() => true} />
        <h1>etc</h1>
        <h2>
          <a href="https://mozilla-services.github.io/react-jsonschema-form/">
            JSON Schema form live playground!
          </a>
        </h2>
        <p>
          Powerd by
          <a href="https://github.com/mozilla-services/react-jsonschema-form">
            react-jsonschema-form
          </a>
        </p>
      </div>
    );
  }
}

export const WikiDataFormWithoutConnect = WikiDataForm;

function mapStateToProps(state, props) {
  return props;
}

function mapDispatchToProps(dispatch, props) {
  const { wiki } = props;
  return {
    onSubmit(payload) {
      const update = { wiki: { data: payload.formData } };
      dispatch(updateWikiRequest(wiki._id, update));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WikiDataForm);
