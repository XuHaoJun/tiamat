import React from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {setHeaderTitle} from '../../MyApp/MyAppActions';
import Toggle from 'material-ui/Toggle';
import {SketchPicker} from 'react-color';

class SettingDetailPage extends React.PureComponent {
  componentWillMount() {
    this
      .props
      .dispatch(setHeaderTitle('設定'));
  }

  render() {
    const styles = {
      toggle: {
        marginBottom: 16
      },
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      alignerItem: {
        maxWidth: '50%'
      }
    };
    return (
      <div>
        <Helmet title="設定"/>
        <div style={styles.container}>
          <div style={styles.alignerItem}>
            <Toggle label="即時更新文章列表(尚未完成)" style={styles.toggle}/>
            <SketchPicker/>
            <div>
              主題顏色挑選
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store, props) {
  return {};
}

export default connect(mapStateToProps)(SettingDetailPage);
