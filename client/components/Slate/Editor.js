import React from "react";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { fromJS, is, Map, List } from "immutable";
import isUrl from "is-url";
import isImage from "is-image";
import Slate, { Raw, Block } from "slate";
import memoize from "fast-memoize";
import Portal from "react-portal-minimal";
import createFastMemoizeDefaultOptions from "../../util/createFastMemoizeDefaultOptions";
import schema from "./schema";
import htmlSerializer from "./htmlSerializer";
import "./plugin.css";
import { defaultPlugins } from "./plugins";
import emptyContnetJSON from "./emptyContent.json";
import semanticReplace from "./semanticReplace2";
import normalizeHref from "./utils/normailzeHref";
import { connect } from "react-redux";
import AddImageDialog from "./AddImageDialog";
import { addImage } from "../../modules/Image/ImageActions";
import { addError } from "../../modules/Error/ErrorActions";
import Div from "./Div";

import Debug from "debug";

const debug = Debug("app:editor");

const DEFAULT_NODE = "paragraph";

const emptyContent = fromJS(emptyContnetJSON);

export const getStyles = memoize(() => {
  const styles = {
    editorContainer: {
      boxSizing: "border-box",
      border: "1px solid #ddd",
      cursor: "text",
      padding: 10,
      borderRadius: "2px",
      marginBottom: "2em",
      boxShadow: "inset 0px 1px 8px -3px #ABABAB",
      background: "#fefefe"
    },
    editorFullScreenContainer: {
      cursor: "text",
      background: "#fefefe",
      padding: 10,
      boxShadow: "inset 0px 1px 8px -3px #ABABAB",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 1101,
      overflow: "auto",
      maxHeight: "calc(100vh - 100px)"
    },
    editor: {
      minHeight: 250
    },
    editorFullScreen: {
      minHeight: "calc(100vh - 100px)",
      width: "calc(100vw - 20px)"
    }
  };
  return styles;
}, createFastMemoizeDefaultOptions(1));

let serialize = content => {
  const rawContent = Map.isMap(content) ? content.toJS() : emptyContent.toJS();
  const state = Slate.Raw.deserialize(rawContent, { terse: true });
  return state;
};

serialize = memoize(serialize, createFastMemoizeDefaultOptions(30));

function semanticRulesToSuggestions(semanticRules) {
  return semanticRules.map(rule => {
    const key = rule.get("name");
    const value = rule.get("href");
    const suggestion = key;
    return { key, value, suggestion };
  });
}

class Editor extends React.Component {
  static defaultProps = {
    onChangeContent: () => {},
    onError: null,
    enableAutoFullScreen: true,
    semanticRules: List(),
    semanticReplaceMode: false,
    readOnly: false,
    rawContent: emptyContent,
    schemaType: "",
    sendAddImage: null,
    sourceType: "discussion",
    sourceId: ""
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const {
      enterScrollWindowPlugin,
      suggestionsPlugin,
      tablePlugin,
      softBreakPlugin
    } = defaultPlugins;
    const plugins = [
      tablePlugin,
      enterScrollWindowPlugin,
      suggestionsPlugin,
      softBreakPlugin
    ];
    const state = serialize(props.rawContent);
    const { readOnly, semanticRules, semanticReplaceMode } = props;
    const suggestions = semanticRulesToSuggestions(semanticRules);
    this.state = {
      state,
      suggestions,
      plugins,
      tablePlugin,
      suggestionsPlugin,
      semanticRules,
      semanticReplaceMode,
      readOnly,
      addImageDialogOpen: false,
      softKeyboardIsOpen: false,
      fullScreen: false
    };
  }

  componentDidMount() {
    if (typeof window === "object") {
      this.mobileKeyboardIsOpened = false;
      this.lastWidth = window.innerWidth;
      this.lastHeight = window.innerHeight;
      window.addEventListener("resize", this.onWindowResize);
    }
  }

  componentWillReceiveProps(nextProps) {
    let nextState = {};
    if (nextProps.readOnly !== this.state.readOnly) {
      nextState.readOnly = nextProps.readOnly;
    }
    if (!is(nextProps.rawContent, this.props.rawContent)) {
      const rawContent = nextProps.rawContent;
      if (Map.isMap(rawContent)) {
        nextState.state = Slate.Raw.deserialize(rawContent.toJS(), {
          terse: true
        });
      }
    }
    if (!is(nextProps.semanticRules, this.state.semanticRules)) {
      nextState.semanticRules = nextProps.semanticRules;
      const suggestions = semanticRulesToSuggestions(nextProps.semanticRules);
      nextState.suggestions = suggestions;
    }
    if (nextProps.semanticReplaceMode !== this.state.semanticReplaceMode) {
      nextState = Object.assign(
        nextState,
        this.toggleSemanticReplaceHelper(nextProps.semanticReplaceMode)
      );
    }
    if (Object.keys(nextState).length > 0) {
      this.setState(nextState);
    }
  }

  componentWillUnmount() {
    if (typeof window === "object") {
      window.removeEventListener("resize", this.onWindowResize);
    }
  }

  onWindowResize = event => {
    const newWidth = event.target.innerWidth;
    const newHeight = event.target.innerHeight;
    if (newHeight > this.lastHeight && newWidth === this.lastWidth) {
      if (this.mobileKeyboardIsOpened) {
        this.mobileKeyboardIsOpened = false;
        this.onMobileKeyboardClose(event);
      }
    } else {
      if (!this.mobileKeyboardIsOpened) {
        this.mobileKeyboardIsOpened = true;
        this.onMobileKeyboardOpen(event);
      }
    }
    this.lastWidth = newWidth;
    this.lastHeight = newHeight;
  };

  onMobileKeyboardOpen = () => {
    const { enableAutoFullScreen } = this.props;
    const { softKeyboardIsOpen } = this.state;
    if (enableAutoFullScreen) {
      if (!softKeyboardIsOpen) {
        this.setState({ softKeyboardIsOpen: true });
      }
    }
  };

  onMobileKeyboardClose = () => {
    const { enableAutoFullScreen } = this.props;
    const { softKeyboardIsOpen } = this.state;
    if (enableAutoFullScreen) {
      if (softKeyboardIsOpen) {
        this.setState({ softKeyboardIsOpen: false });
      }
    }
  };

  onClickLink = e => {
    e.preventDefault();
    let { state } = this.state;
    const hasLinks = this.hasLinks();
    if (hasLinks) {
      state = state.transform().unwrapInline("link").apply();
    } else if (state.isExpanded) {
      const href = window.prompt("Enter the URL of the link:");
      debug("onClickLink", "data.text", href);
      const inlineProps = {
        type: "link",
        data: {
          href: normalizeHref(href)
        }
      };
      debug("onClickLink", "href", inlineProps.data.href);
      state = state
        .transform()
        .wrapInline(inlineProps)
        .collapseToStartOfNextText()
        .apply();
    } else {
      const href = window.prompt("Enter the URL of the link:");
      const text = window.prompt("Enter the text for the link:");
      const inlineProps = {
        type: "link",
        data: {
          href
        }
      };
      if (!href || !text) {
        return;
      }
      state = state
        .transform()
        .insertText(text)
        .extend(0 - text.length)
        .wrapInline(inlineProps)
        .collapseToStartOfNextText()
        .apply();
    }
    if (state !== this.state.state) {
      this.setState({ state });
    }
  };

  onChange = state => {
    this.setState(
      {
        state
      },
      () => {
        this.props.onChangeContent(state);
      }
    );
  };

  onInsertTable = () => {
    const { state, tablePlugin } = this.state;
    this.onChange(
      tablePlugin.transforms.insertTable(state.transform()).apply()
    );
  };

  onInsertColumn = () => {
    const { state, tablePlugin } = this.state;
    this.onChange(
      tablePlugin.transforms.insertColumn(state.transform()).apply()
    );
  };

  onInsertRow = () => {
    const { state, tablePlugin } = this.state;
    this.onChange(tablePlugin.transforms.insertRow(state.transform()).apply());
  };

  onRemoveColumn = () => {
    const { state, tablePlugin } = this.state;
    this.onChange(
      tablePlugin.transforms.removeColumn(state.transform()).apply()
    );
  };

  onRemoveRow = () => {
    const { state, tablePlugin } = this.state;
    this.onChange(tablePlugin.transforms.removeRow(state.transform()).apply());
  };

  onRemoveTable = () => {
    const { state, tablePlugin } = this.state;
    this.onChange(
      tablePlugin.transforms.removeTable(state.transform()).apply()
    );
  };

  onSetAlign = (event, align) => {
    const { state, tablePlugin } = this.state;
    this.onChange(
      tablePlugin.transforms.setColumnAlign(state.transform(), align).apply()
    );
  };

  renderNormalToolbar = () => {
    return (
      <div>
        <button onClick={this.onInsertTable}>Insert Table</button>
      </div>
    );
  };

  renderTableToolbar = () => {
    return (
      <div>
        <button onClick={this.onInsertColumn}>Insert Column</button>
        <button onClick={this.onInsertRow}>Insert Row</button>
        <button onClick={this.onRemoveColumn}>Remove Column</button>
        <button onClick={this.onRemoveRow}>Remove Row</button>
        <button onClick={this.onRemoveTable}>Remove Table</button>
        <br />
        <button onClick={e => this.onSetAlign(e, "left")}>
          Set align left
        </button>
        <button onClick={e => this.onSetAlign(e, "center")}>
          Set align center
        </button>
        <button onClick={e => this.onSetAlign(e, "right")}>
          Set align right
        </button>
      </div>
    );
  };

  hasMark = type => {
    const { state } = this.state;
    return state.marks.some(mark => mark.type === type);
  };

  hasBlock = type => {
    const { state } = this.state;
    return state.blocks.some(node => node.type === type);
  };

  /**
   * On change, save the new state.
   *
   * @param {State} state
   */

  /**
   * On key down, if it's a formatting command toggle a mark.
   *
   * @param {Event} e
   * @param {Object} data
   * @param {State} state
   * @return {State}
   */

  onKeyDown = (e, data, state) => {
    if (data.isMod) {
      let mark = "";
      switch (data.key) {
        case "b":
          mark = "bold";
          break;
        case "i":
          mark = "italic";
          break;
        case "u":
          mark = "underlined";
          break;
        case "`":
          mark = "code";
          break;
        default:
          mark = "";
      }
      if (mark !== "") {
        e.preventDefault();
        return state.transform().toggleMark(mark).apply();
      }
    } else {
      if (data.key === "enter") {
        const breakoutRules = ["heading-one", "heading-two"];
        const shouldBreakout = breakoutRules.some(
          rule => state.startBlock.type === rule
        );
        if (shouldBreakout) {
          e.preventDefault();
          return state.transform().splitBlock().setBlock(DEFAULT_NODE).apply();
        }
      }
    }
    return undefined;
  };

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickMark = (e, type) => {
    e.preventDefault();
    const { state } = this.state;
    const nextState = state.transform().toggleMark(type).apply();
    this.setState({ state: nextState });
  };

  /**
   * When a block button is clicked, toggle the block type.
   *
   * @param {Event} e
   * @param {String} type
   */

  onClickBlock = (e, type) => {
    e.preventDefault();
    let { state } = this.state;
    const transform = state.transform();
    const { document } = state;
    // Handle everything but list buttons.
    if (type !== "bulleted-list" && type !== "numbered-list") {
      const isActive = this.hasBlock(type);
      const isList = this.hasBlock("list-item");
      const isTableCell = this.hasBlock("table_cell");
      const isLink = this.hasBlock("link");
      if (isList) {
        transform
          .setBlock(isActive ? DEFAULT_NODE : type)
          .unwrapBlock("bulleted-list")
          .unwrapBlock("numbered-list");
      } else if (isTableCell) {
        transform.insertNodeByKey(
          state.blocks.get(0).get("key"),
          1,
          Block.create({
            type: isActive ? DEFAULT_NODE : type
          })
        );
      } else if (type === "link") {
        return this.onClickLink(e);
      } else if (type === "image") {
        this.setState({ addImageDialogOpen: true });
        return undefined;
      } else {
        transform.setBlock(isActive ? DEFAULT_NODE : type);
      }
    } else {
      const isList = this.hasBlock("list-item");
      const isType = state.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === type);
      });
      if (isList && isType) {
        transform
          .setBlock(DEFAULT_NODE)
          .unwrapBlock("bulleted-list")
          .unwrapBlock("numbered-list");
      } else if (isList) {
        transform
          .unwrapBlock(
            type === "bulleted-list" ? "numbered-list" : "bulleted-list"
          )
          .wrapBlock(type);
      } else {
        transform.setBlock("list-item").wrapBlock(type);
      }
    }
    state = transform.apply();
    this.setState({ state });
  };

  handleAddImageDialogClose = (e, reason) => {
    const nextState = {};
    nextState.addImageDialogOpen = false;
    const { state } = this.state;
    if (reason.action === "submit") {
      const image = reason.payload;
      nextState.state = this.insertImage(state, image.url);
    } else {
      nextState.state = state.transform().focus().apply();
    }
    this.setState(nextState);
  };

  /**
   * Render the toolbar.
   *
   * @return {Element}
   */

  renderToolbar = () => {
    let style;
    if (this.shouldFullScreen()) {
      style = {
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 1102,
        maxWidth: "100vw",
        overflow: "auto"
      };
    } else {
      style = {
        maxWidth: "100vw",
        overflow: "auto"
      };
    }
    return (
      <div>
        <div className="menu toolbar-menu" style={style}>
          {this.renderBlockButton("heading-one", "looks_one")}
          {this.renderBlockButton("heading-two", "looks_two")}
          {this.renderMarkButton("bold", "format_bold")}
          {this.renderBlockButton("image", "image")}
          {this.renderBlockButton("link", "link")}
          {this.renderBlockButton("numbered-list", "format_list_numbered")}
          {this.renderBlockButton("bulleted-list", "format_list_bulleted")}
          {this.renderBlockButton("block-quote", "format_quote")}
          {this.renderMarkButton("italic", "format_italic")}
          {this.renderMarkButton("underlined", "format_underlined")}
          {this.renderMarkButton("code", "code")}
        </div>
        <AddImageDialog
          open={this.state.addImageDialogOpen}
          sendAddImage={this.props.sendAddImage}
          onRequestClose={this.handleAddImageDialogClose}
        />
      </div>
    );
  };

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type);
    const onMouseDown = e => this.onClickMark(e, type);
    const styles = {
      container: {
        color: isActive ? "black" : "#ccc",
        cursor: "pointer"
      },
      icon: {
        fontSize: "30px"
      }
    };
    return (
      <span
        style={styles.container}
        onMouseDown={onMouseDown}
        data-active={isActive}
      >
        <span style={styles.icon} className="material-icons">
          {icon}
        </span>
      </span>
    );
  };

  /**
   * Render a block-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton = (type, icon) => {
    const isActive = this.hasBlock(type);
    const onMouseDown = e => this.onClickBlock(e, type);
    const styles = {
      container: {
        color: isActive ? "black" : "#ccc",
        cursor: "pointer"
      },
      icon: {
        fontSize: "30px"
      }
    };
    return (
      <span
        style={styles.container}
        onMouseDown={onMouseDown}
        data-active={isActive}
      >
        <span style={styles.icon} className="material-icons">
          {icon}
        </span>
      </span>
    );
  };

  logState = () => {
    const content = JSON.stringify(Raw.serialize(this.state.state), null, 2);
    debug("logState", content);
  };

  handleToggleReadOnly = () => {
    this.setState({
      readOnly: !this.state.readOnly
    });
  };

  toggleReadOnly = () => {
    this.setState({
      readOnly: !this.state.readOnly
    });
  };

  handleOpen = () => {
    debug("open");
  };

  getSlate = () => {
    return this.ref.editor;
  };

  getContent = () => {
    return this.state.state;
  };

  getJSONContent = () => {
    return Raw.serialize(this.state.state);
  };

  onDrop = (e, data, state, editor) => {
    switch (data.type) {
      case "files":
        return this.onDropOrPasteFiles(e, data, state, editor);
      case "node":
        return this.onDropNode(e, data, state);
      default:
        break;
    }
    return undefined;
  };

  onDropNode = (e, data, state) => {
    return state
      .transform()
      .deselect()
      .removeNodeByKey(data.node.key)
      .select(data.target)
      .insertBlock(data.node)
      .apply();
  };

  onDropOrPasteFiles = (e, data, state, editor) => {
    for (const file of data.files) {
      const reader = new FileReader();
      const [type] = file.type.split("/");
      if (type === "image") {
        // TODO componentWillUnmount reader.removeEventListener(onLoadFile)
        const { sourceType, sourceId } = this.props;
        const onLoadFile = () => {
          const dataUrl = reader.result;
          const dataUrlWithoutHeading = dataUrl.replace(
            /^data:image\/(.+);base64,/,
            ""
          );
          const form = {
            type: "base64",
            image: dataUrlWithoutHeading,
            sourceType,
            sourceId
          };
          if (this.props.sendAddImage) {
            this.props.sendAddImage(form).then(image => {
              const url = image.url;
              const nextState = this.insertImage(editor.getState(), url);
              editor.onChange(nextState);
            });
          } else {
            const nextState = this.insertImage(editor.getState(), dataUrl);
            editor.onChange(nextState);
          }
        };
        reader.addEventListener("load", onLoadFile);
        reader.readAsDataURL(file);
      }
    }
  };

  insertImage = (state, src) => {
    const imageProp = {
      type: "image",
      isVoid: true,
      data: {
        src
      }
    };
    const imageBlock = Block.create(imageProp);
    return state.transform().insertBlock(imageBlock).apply();
  };

  onPasteText = (e, data, state) => {
    const { text } = data;
    if (isUrl(text)) {
      // TODO insertUrl
      return undefined;
    } else if (isImage(text)) {
      return this.insertImage(state, text);
    } else {
      return undefined;
    }
  };

  onPaste = (e, data, state, editor) => {
    if (data.isShift) {
      return undefined;
    } else {
      if (data.type === "html") {
        const { document } = htmlSerializer.deserialize(data.html);
        return state.transform().insertFragment(document).apply();
      } else if (data.type === "files") {
        return this.onDropOrPasteFiles(e, data, state, editor);
      } else if (isImage(data.text)) {
        return this.insertImage(state, data.text);
      } else if (isUrl(data.text)) {
        if (state.isCollapsed) {
          const transform = state.transform();
          if (this.hasLinks()) {
            transform.unwrapInline("link");
          }
          const href = normalizeHref(data.text);
          debug("data.text", data.text);
          debug("onPaste", "href", href);
          const linkProp = {
            type: "link",
            data: {
              href
            }
          };
          return transform.wrapInline(linkProp).collapseToEnd().apply();
        }
      } else {
        return undefined;
      }
    }
    return undefined;
  };

  toggleSemanticReplace = () => {
    const newState = this.toggleSemanticReplaceHelper();
    this.setState(newState);
  };

  toggleSemanticReplaceHelper = () => {
    const { state, semanticReplaceMode, semanticRules } = this.state;
    if (!semanticReplaceMode) {
      return {
        state: semanticReplace(state, semanticRules),
        semanticReplaceMode: !semanticReplaceMode
      };
    }
    return {
      state: serialize(this.props.rawContent),
      semanticReplaceMode: !semanticReplaceMode
    };
  };

  hasLinks = () => {
    const { state } = this.state;
    return state.inlines.some(inline => inline.type === "link");
  };

  shouldFullScreen = () => {
    const { enableAutoFullScreen } = this.props;
    const { readOnly, softKeyboardIsOpen } = this.state;
    const isFocused = this.state.state.isFocused;
    return !readOnly && enableAutoFullScreen && isFocused && softKeyboardIsOpen;
  };

  setEditorRef = ref => {
    this.editor = ref;
  };

  renderEditor = () => {
    const { state, tablePlugin, suggestionsPlugin, plugins } = this.state;
    const isTable = tablePlugin.utils.isSelectionInTable(state);
    const { SuggestionPortal } = suggestionsPlugin;
    const styles = getStyles();
    const { readOnly } = this.state;
    let editorStyle = readOnly ? null : styles.editor;
    let editorContainerStyle = readOnly ? null : styles.editorContainer;
    if (this.shouldFullScreen()) {
      editorStyle = styles.editorFullScreen;
      editorContainerStyle = styles.editorFullScreenContainer;
    }
    return (
      <div style={editorContainerStyle}>
        <div>
          {/* {this.renderTableToolbar()} */}
        </div>
        <div>
          {/* {this.renderNormalToolbar()} */}
        </div>
        <div>
          {/* <button onTouchTap={this.logState}>logState</button>
          <button onTouchTap={this.toggleReadOnly}>ReadOnly</button> */}
        </div>
        <Slate.Editor
          ref={this.setEditorRef}
          autoFocus={false}
          state={state}
          style={editorStyle}
          schema={schema}
          plugins={plugins}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          onPaste={this.onPaste}
          onDrop={this.onDrop}
          readOnly={this.state.readOnly}
          spellCheck={false}
          autoComplete={false}
          autoCorrect={false}
        />
        <SuggestionPortal
          state={this.state.state}
          suggestions={this.state.suggestions}
        />
      </div>
    );
  };

  render() {
    const ContainerComponent = this.shouldFullScreen() ? Portal : Div;
    return (
      <ContainerComponent>
        <div>
          {this.state.readOnly ? null : this.renderToolbar()}
          {this.renderEditor()}
        </div>
      </ContainerComponent>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    sendAddImage: (form, reqConfig) => dispatch(addImage(form, reqConfig)),
    onError: err => dispatch(addError(err))
  };
}

function mapStateToProps(store, props) {
  return props;
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  withRef: true
})(Editor);

const EditorWithoutConnect = Editor;

export { emptyContent, EditorWithoutConnect };
