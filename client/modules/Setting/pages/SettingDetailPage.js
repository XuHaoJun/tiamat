import React from "react";
import Helmet from "react-helmet";
import { connect } from "react-redux";
import Loadable from "react-loadable";
import { compose } from "recompose";
import { hot } from "react-hot-loader";

import { FormControlLabel, FormGroup } from "material-ui-next/Form";
import Switch from "material-ui-next/Switch";
import Button from "material-ui-next/Button";
import { SketchPicker } from "react-color";
import screenfull from "screenfull";

import { setHeaderTitle } from "../../MyApp/MyAppActions";

class SettingDetailPage extends React.PureComponent {
  componentWillMount() {
    this.props.dispatch(setHeaderTitle("設定"));
  }

  preloadAll = () => {
    Loadable.preloadAll();
  };

  state = {
    check: false,
    isFullStreen: false
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
        <div>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.check}
                  onChange={(event, checked) =>
                    this.setState({ check: checked })
                  }
                />
              }
              label="即時更新文章列表(尚未完成)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={this.state.isFullScreen}
                  onChange={(event, checked) => {
                    this.setState({ isFullScreen: checked });
                    if (screenfull.enabled) {
                      screenfull.toggle();
                    }
                  }}
                />
              }
              label="全螢幕(FullScreen)"
            />
            <Button variant="raised" onClick={this.preloadAll}>
              預加載其他頁面
            </Button>
            <div>
              <div>主題顏色挑選:#ff0f0f(改為Dialog)</div>
              <SketchPicker />
            </div>
          </FormGroup>
        </div>
      </div>
    );
  }
}

function mapStateToProps(store, routerProps) {
  return {};
}

export default compose(hot(module), connect(mapStateToProps))(
  SettingDetailPage
);
