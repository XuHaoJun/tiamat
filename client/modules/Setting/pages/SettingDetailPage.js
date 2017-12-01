import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";
import Loadable from "react-loadable";

import Toggle from "material-ui/Toggle";
import RaisedButton from "material-ui/RaisedButton";
import { SketchPicker } from "react-color";

import { setHeaderTitle } from "../../MyApp/MyAppActions";

class SettingDetailPage extends React.PureComponent {
  componentWillMount() {
    this.props.dispatch(setHeaderTitle("設定"));
  }

  preloadAll = () => {
    Loadable.preloadAll();
  };

  render() {
    const styles = {
      toggle: {
        marginBottom: 16
      },
      container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      alignerItem: {
        maxWidth: "50%"
      }
    };
    return (
      <div>
        <Helmet title="設定" />
        <div style={styles.container}>
          <div style={styles.alignerItem}>
            <Toggle label="即時更新文章列表(尚未完成)" style={styles.toggle} />
            <div>主題顏色挑選:</div>
            <SketchPicker />
            <RaisedButton label="預加載其他頁面" onClick={this.preloadAll} />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store, routerProps) {
  return {};
}

export default connect(mapStateToProps)(SettingDetailPage);
