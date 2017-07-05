import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import Drawer from "material-ui/Drawer";
import Avatar from "material-ui/Avatar";
import Divider from "material-ui/Divider";
import Subheader from "material-ui/Subheader";
import { List, ListItem, makeSelectable } from "material-ui/List";
import { Scrollbars } from "react-custom-scrollbars";
import MyNavList from "./NavList";

const SelectableList = makeSelectable(List);

export class NavList extends React.Component {
  static propTypes = {
    onChangeList: PropTypes.func,
    selectedIndex: PropTypes.string.isRequired,
    onRequestChangeNavDrawer: PropTypes.func.isRequired,
    disableHomeImage: PropTypes.bool.isRequired
  };

  static defaultProps = {
    onChangeList: () => {},
    selectedIndex: "_none",
    onRequestChangeNavDrawer: () => {},
    disableHomeImage: false
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  preventDefault = e => {
    e.preventDefault();
  };

  handleTouchTap = path => {
    this.props.onRequestChangeNavDrawer(false);
    // for sure drawer smoothly close and then render content.
    const self = this;
    function wrapFn() {
      if (!path || path === "#") {
        return;
      }
      self.context.router.push(path);
    }
    setTimeout(wrapFn, 0);
  };

  renderHeadImage = () => {
    return (
      <div
        style={{
          cursor: "pointer"
        }}
        onClick={this.preventDefault}
        onTouchTap={this.handleTouchTap.bind(this, "/")}
      >
        <img
          alt="index.jpg"
          width="100%"
          height="64px"
          src="/image/icons/index.jpg"
        />
      </div>
    );
  };

  render() {
    const { selectedIndex, onChangeList } = this.props;
    return (
      <Scrollbars universal={true} autoHide={true}>
        {this.props.disableHomeImage ? null : this.renderHeadImage()}
        <SelectableList value={selectedIndex} onChange={onChangeList}>
          <Subheader>地下城物語資料庫</Subheader>
          <ListItem
            value="/slimes"
            href="/slimes"
            primaryText="岡布奧"
            leftAvatar={<Avatar src="/image/slimes/1.png" />}
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/slimes")}
          />
          <Divider />
          <ListItem
            value="/titleTrees"
            href="/titleTrees"
            primaryText="稱號"
            leftAvatar={<Avatar src="/image/titles/201.png" />}
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/titleTrees/ven")}
          />
          <Divider />
          <ListItem
            value="/spells"
            href="/spells"
            primaryText="魔法"
            leftAvatar={<Avatar src="/image/spells/4021.png" />}
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/spells")}
          />
          <Divider />
          <ListItem
            value="/artifacts"
            href="/artifacts"
            primaryText="神器"
            leftAvatar={<Avatar src="/image/artifacts/6013.png" />}
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/artifacts")}
          />
          <Divider />
          <ListItem
            value="/potions"
            href="/potions"
            primaryText="藥劑"
            leftAvatar={<Avatar src="/image/potions/9003.png" />}
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/potions")}
          />
          <Divider />
          <ListItem
            value="/party"
            href="/party"
            primaryText="隊伍模擬"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/party")}
          />
          <Divider />
          <ListItem
            value="/stages"
            href="/stages"
            primaryText="關卡攻略"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/stages")}
          />
          <Divider />
          <ListItem
            primaryText="關卡-其他"
            value="#"
            primaryTogglesNestedList={true}
            nestedItems={["攻略", "神龍願望", "裝備", "偷盜物品", "異界魂"].map((v, k) =>
              <ListItem key={k} value={k + 2} primaryText={v} />
            )}
          />
          <Divider />
          <ListItem
            primaryText="天空戰"
            value="#"
            primaryTogglesNestedList={true}
            nestedItems={[
              {
                text: "機體",
                v: "#"
              },
              {
                text: "符石",
                v: "#"
              },
              {
                text: "探索謎題",
                v: "/airbattle/puzzles"
              }
            ].map((li, i) => {
              return (
                <ListItem
                  key={i}
                  href={li.v}
                  value={li.v}
                  primaryText={li.text}
                  onClick={this.preventDefault}
                  onTouchTap={this.handleTouchTap.bind(this, li.v)}
                />
              );
            })}
          />
          <Divider />
          <ListItem
            primaryText="其他"
            value="#"
            primaryTogglesNestedList={true}
            nestedItems={["新手Q&A"].map((v, k) =>
              <ListItem key={k} value={k + 2} primaryText={v} />
            )}
          />
          <Divider />
          <ListItem
            value="/about"
            href="/about"
            primaryText="關於"
            onClick={this.preventDefault}
            onTouchTap={this.handleTouchTap.bind(this, "/about")}
          />
        </SelectableList>
      </Scrollbars>
    );
  }
}

export default class MyAppNavDrawer extends React.Component {
  static propTypes = {
    docked: PropTypes.bool.isRequired,
    onRequestChangeNavDrawer: PropTypes.func,
    open: PropTypes.bool.isRequired,
    onChangeList: PropTypes.func,
    selectedIndex: PropTypes.string.isRequired,
    style: PropTypes.object
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired
  };

  componentDidMount() {
    if (this.drawer) {
      this.drawer._oldOnBodyTouchStart = this.drawer.onBodyTouchStart;
      // this.drawer.onBodyTouchStart = (e) => {
      //   this.drawer._oldOnBodyTouchStart.bind(this.drawer)(e);
      //   console.log('drawer event', e);
      // }
    }
  }

  setRefDrawer = elem => {
    this.drawer = elem;
  };

  render() {
    const {
      open,
      docked,
      onRequestChangeNavDrawer,
      style,
      selectedIndex,
      onChangeList
    } = this.props;
    return (
      <Drawer
        ref={this.setRefDrawer}
        style={Object.assign({}, style, {
          MozUserSelect: "none",
          WebkitUserSelect: "none",
          userSelect: "none"
        })}
        containerStyle={
          this.props.browser.greaterThan.medium
            ? {
                top: 64,
                height: "calc(100vh - 64px)"
              }
            : {}
        }
        swipeAreaWidth={30}
        open={open}
        docked={docked}
        onRequestChange={onRequestChangeNavDrawer}
      >
        <MyNavList
          onChangeList={onChangeList}
          selectedIndex={selectedIndex}
          onRequestChangeNavDrawer={onRequestChangeNavDrawer}
        />
      </Drawer>
    );
  }
}
