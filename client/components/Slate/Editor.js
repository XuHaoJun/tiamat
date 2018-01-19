import React from "react";
import _ from "lodash";
import { connect, createProvider } from "react-redux";
import editorConnectHelper from "./connect";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { is, Map, List } from "immutable";
import isUrl from "is-url";
import { Block, setKeyGenerator } from "slate";

let n = 0;
setKeyGenerator(() => {
  n += 1;
  return `${n}`;
});

import Debug from "debug";
// FIXME
// Input is wonky on Android devices
// https://github.com/ianstormtaylor/slate/issues/725
import {
  Editor as SlateEditor,
  getEventTransfer,
  getEventRange
} from "slate-react";
import { Portal } from "react-portal";

import { addImageRequest } from "../../modules/Image/ImageActions";
import { addError } from "../../modules/Error/ErrorActions";

import schema from "./schema";
import htmlSerializer from "./htmlSerializer";
import { loadPrismPlugin, defaultPlugins } from "./plugins";
import semanticReplace from "./utils/semanticReplace";
import normalizeHref from "./utils/normailzeHref";
import AddImageDialog from "./components/AddImageDialog";
import AddWikiPartDialog from "./components/AddWikiPartDialog";
import Div from "./components/Div";
import configureStore, { getStoreKey } from "./store";
import { CHANGE_LOCAL_EDITOR } from "./EditorActions";
import emptyContent from "./emptyContent";
import serialize from "./serialize";
import { connectEditorHelper as templateConnectEditorHelper } from "./components/Template";
import "./plugin.css";

const debug = Debug("app:editor");

const DEFAULT_NODE = "paragraph";

export const getStyles = () => {
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
      minHeight: 250,
      maxHeight: 250,
      overflow: "auto"
    },
    editorFullScreen: {
      minHeight: "calc(100vh - 100px)",
      maxHeight: "calc(100vh - 100px)",
      width: "calc(100vw - 20px)",
      overflow: "auto"
    }
  };
  return styles;
};

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
    enableCodeHighlight: false,
    onChangeContent: () => {},
    onError: null,
    enableAutoFullScreen: true,
    semanticRules: List(),
    semanticReplaceMode: false,
    readOnly: false,
    rawContent: emptyContent,
    defaultValue: undefined,
    schemaType: "",
    sendAddImage: null,
    targetKind: "rootWiki",
    rootWiki: ""
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    const { suggestionsPlugin } = defaultPlugins;
    const { defaultValue } = props;
    let state;
    if (defaultValue) {
      state = serialize(defaultValue);
    } else {
      state = serialize(props.rawContent);
    }
    const { readOnly, semanticRules, semanticReplaceMode } = props;
    if (semanticReplaceMode) {
      state = semanticReplace(state, props.semanticRules).value;
    }
    const suggestions = semanticRulesToSuggestions(semanticRules);
    const { id, key } = this.props;
    const storeKey = getStoreKey({ id, key });
    this.storeKey = storeKey;
    this.store = configureStore({
      initialState: {
        enableTemplatePreview: false,
        compiled: false,
        storeKey
      },
      reducer: this.reduxReducer
    });
    this.connect = editorConnectHelper(storeKey);
    this.Provider = createProvider(storeKey);
    this.state = {
      state,
      suggestions,
      plugins: _.values(defaultPlugins),
      suggestionsPlugin,
      semanticRules,
      semanticReplaceMode,
      readOnly,
      addImageDialogOpen: false,
      addWikiPartDialog: false,
      softKeyboardIsOpen: false
    };
  }

  componentDidMount() {
    if (typeof window === "object") {
      this.mobileKeyboardIsOpened = false;
      this.lastWidth = window.innerWidth;
      this.lastHeight = window.innerHeight;
      window.addEventListener("resize", this.onWindowResize);
      if (this.props.enableCodeHighlight) {
        this.loadCodeHighlightPlugin();
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    let nextState = {};
    if (nextProps.readOnly !== this.state.readOnly) {
      nextState.readOnly = nextProps.readOnly;
    }
    if (!is(nextProps.rawContent, this.props.rawContent)) {
      const { rawContent } = nextProps;
      if (Map.isMap(rawContent)) {
        nextState.state = serialize(rawContent);
      }
    }
    if (!is(nextProps.semanticRules, this.state.semanticRules)) {
      nextState.semanticRules = nextProps.semanticRules;
      const suggestions = semanticRulesToSuggestions(nextProps.semanticRules);
      nextState.suggestions = suggestions;
      if (nextProps.semanticReplaceMode) {
        nextState = Object.assign(nextState, {
          state: semanticReplace(
            typeof nextState.state !== "undefined"
              ? nextState.state
              : this.state.state,
            nextProps.semanticRules
          ).value
        });
      }
    }
    if (nextProps.semanticReplaceMode !== this.state.semanticReplaceMode) {
      nextState = Object.assign(
        nextState,
        this.toggleSemanticReplaceHelper(
          nextState.state,
          this.state.semanticReplaceMode,
          nextState.semanticRules
        )
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
      state = state
        .transform()
        .unwrapInline("link")
        .apply();
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

  onChange = change => {
    this.setState(
      {
        state: change.value
      },
      () => {
        if (this.props.onChangeContent) {
          this.props.onChangeContent(change);
        }
      }
    );
  };

  onInsertTable = () => {
    alert("table plugin broken.");
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

  onKeyDown = (event, change) => {
    if (event.isMod) {
      let mark = "";
      switch (event.key) {
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
        event.preventDefault();
        change.toggleMark(mark).apply();
        return true;
      }
    } else {
      if (event.key === "Enter") {
        const breakoutTypes = ["heading-one", "heading-two"];
        const isBreakoutType = breakoutTypes.some(
          type => change.value.startBlock.type === type
        );
        if (isBreakoutType) {
          const { selection } = change.value;
          const isEnd =
            selection.isCollapsed &&
            selection.anchorOffset === change.value.startBlock.text.length;
          if (isEnd) {
            event.preventDefault();
            change.splitBlock().setBlock(DEFAULT_NODE);
            return true;
          }
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
    const change = state.change().toggleMark(type);
    this.onChange(change);
  };

  onClickBlock = (e, type) => {
    e.preventDefault();
    const { state } = this.state;
    const transform = state.change();
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
      } else if (isLink) {
        return this.onClickLink(e);
      } else if (type === "wiki-part") {
        this.setState({ addWikiPartDialog: true });
        return undefined;
      } else if (type === "image") {
        this.setState({ addImageDialogOpen: true });
        return undefined;
      } else if (type === "template") {
        const numTemplates = document.filterDescendants(node => {
          return node.type === "template";
        }).size;
        // TODO
        // generate random string for name like uuid?.
        const name = `Template${numTemplates}`;
        transform.insertInline({
          isVoid: true,
          type: "template",
          data: {
            template: {
              rootWiki: this.props.rootWiki,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              name,
              code: ""
            }
          }
        });
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
    this.onChange(transform);
    return undefined;
  };

  onDrop = (event, change, editor) => {
    const target = getEventRange(event);
    if (!target) return;
    const transfer = getEventTransfer(event);
    const { type } = transfer;
    switch (type) {
      case "files":
        return this.onDropOrPasteFiles(event, change, editor);
      case "node":
        return this.onDropNode(event, change, editor);
      default:
        break;
    }
  };

  // TODO fix this
  onDropNode = (event, data, state) => {
    return state
      .transform()
      .deselect()
      .removeNodeByKey(data.node.key)
      .select(data.target)
      .insertBlock(data.node)
      .apply();
  };

  onDropOrPasteFiles = (event, change, editor) => {
    const target = getEventRange(event);
    if (!target) return;
    const { sourceType, sourceId } = this.props;
    const onLoadFile = () => {
      const reader = new FileReader();
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
          const { url } = image;
          const nextChange = this.insertImage(change, url);
          editor.onChange(nextChange);
        });
      } else {
        const nextChange = this.insertImage(change, dataUrl);
        editor.onChange(nextChange);
      }
    };
    const transfer = getEventTransfer(event);
    const { files } = transfer;
    for (const file of files) {
      const reader = new FileReader();
      const [type] = file.type.split("/");
      if (type === "image") {
        // TODO componentWillUnmount reader.removeEventListener(onLoadFile)
        reader.addEventListener("load", onLoadFile);
        reader.readAsDataURL(file);
      }
    }
  };

  onPaste = (event, change) => {
    const state = change.vaule;
    const transfer = getEventTransfer(event);
    if (transfer.isShift) {
      return undefined;
    } else {
      if (transfer.type === "html") {
        const { document } = htmlSerializer.deserialize(transfer.html);
        change.insertFragment(document);
        return true;
      } else if (transfer.type === "files") {
        return this.onDropOrPasteFiles(event, change);
      } else if (isUrl(transfer.text)) {
        if (state.isCollapsed) {
          const transform = state.transform();
          if (this.hasLinks()) {
            transform.unwrapInline("link");
          }
          const href = normalizeHref(transfer.text);
          debug("data.text", transfer.text);
          debug("onPaste", "href", href);
          const linkProp = {
            type: "link",
            data: {
              href
            }
          };
          return transform
            .wrapInline(linkProp)
            .collapseToEnd()
            .apply();
        }
      } else {
        return undefined;
      }
    }
    return undefined;
  };

  setEditorRef = ref => {
    this.editor = ref;
  };

  getContent = () => {
    return this.state.state;
  };

  getSlate = () => {
    return this.ref.editor;
  };

  getJSONContent = () => {
    return this.state.state.toJS();
  };

  reduxReducer = (state, action) => {
    switch (action.type) {
      case CHANGE_LOCAL_EDITOR:
        this.onChange(action.change);
        return state;
      default:
        return state;
    }
  };

  loadCodeHighlightPlugin = () => {
    loadPrismPlugin().then(prismPlugin => {
      this.setState({ plugins: [...this.state.plugins, prismPlugin] });
    });
  };

  toggleReadOnly = () => {
    this.setState({
      readOnly: !this.state.readOnly
    });
  };

  insertImage = (change, src) => {
    const imageProp = {
      type: "image",
      isVoid: true,
      data: {
        src
      }
    };
    const imageBlock = Block.create(imageProp);
    return change.insertBlock(imageBlock);
  };

  toggleSemanticReplace = () => {
    const nextState = this.toggleSemanticReplaceHelper();
    this.setState(nextState);
  };

  toggleSemanticReplaceHelper = (
    _state,
    _semanticReplaceMode,
    _semanticRules
  ) => {
    let { state, semanticReplaceMode, semanticRules } = this.state;
    state = typeof _state !== "undefined" ? _state : state;
    semanticReplaceMode =
      typeof _semanticReplaceMode !== "undefined"
        ? _semanticReplaceMode
        : semanticReplaceMode;
    semanticRules =
      typeof _semanticRules !== "undefined" ? _semanticRules : semanticRules;
    if (!semanticReplaceMode) {
      return {
        state: semanticReplace(state, semanticRules).value,
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
    const { isFocused } = this.state.state;
    return !readOnly && enableAutoFullScreen && isFocused && softKeyboardIsOpen;
  };

  handleToggleReadOnly = () => {
    this.setState({
      readOnly: !this.state.readOnly
    });
  };

  logState = () => {
    const content = JSON.stringify(this.state.state.toJSON(), null, 2);
    debug("logState", content);
  };

  handleAddImageDialogClose = (e, reason) => {
    const nextState = {};
    nextState.addImageDialogOpen = false;
    const { state } = this.state;
    if (reason.action === "submit") {
      const image = reason.payload;
      nextState.state = this.insertImage(state.change(), image.url).value;
    } else {
      nextState.state = state.change().focus().value;
    }
    this.setState(nextState);
  };

  hasBlock = type => {
    const { state } = this.state;
    return state.blocks.some(node => node.type === type);
  };

  hasMark = type => {
    const { state } = this.state;
    return state.marks.some(mark => mark.type === type);
  };

  handleOpen = () => {
    debug("open");
  };

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
        role="button"
        tabIndex={0}
      >
        <span style={styles.icon} className="material-icons">
          {icon}
        </span>
      </span>
    );
  };

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
          {this.renderBlockButton("wiki-part", "import_contacts")}
          {this.renderMarkButton("bold", "format_bold")}
          {this.renderBlockButton("image", "image")}
          {this.renderBlockButton("link", "link")}
          {this.renderBlockButton("numbered-list", "format_list_numbered")}
          {this.renderBlockButton("bulleted-list", "format_list_bulleted")}
          {/* {this.renderBlockButton("block-quote", "format_quote")} */}
          {this.renderMarkButton("italic", "format_italic")}
          {this.renderMarkButton("underlined", "format_underlined")}
          {/* {this.renderBlockButton("code_block", "code")} */}
          {this.renderBlockButton("template", "extension")}
        </div>
        <AddImageDialog
          open={this.state.addImageDialogOpen}
          sendAddImage={this.props.sendAddImage}
          onRequestClose={this.handleAddImageDialogClose}
        />
        <AddWikiPartDialog open={this.state.addWikiPartDialog} />
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

  renderNormalToolbar = () => {
    return (
      <div>
        <button onClick={this.onInsertTable}>Insert Table</button>
      </div>
    );
  };

  renderNode = props => {
    const { node } = props;
    const Element = schema.nodes[node.type];
    if (!Element) {
      return undefined;
    } else {
      if (node.type === "template") {
        const Template = templateConnectEditorHelper(this.connect, Element);
        return <Template {...props} />;
      }
      return <Element {...props} />;
    }
  };

  renderMark = props => {
    const { mark, children } = props;
    const Element = schema.marks[mark.type];
    if (!Element) {
      return undefined;
    }
    return <Element>{children}</Element>;
  };

  renderEditor = () => {
    const { state, suggestionsPlugin, plugins } = this.state;
    // const isTable = tablePlugin.utils.isSelectionInTable(state);
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
        <div>{/* {this.renderTableToolbar()} */}</div>
        <div>{/* {this.renderNormalToolbar()} */}</div>
        <div>
          {/* <button onTouchTap={this.logState}>logState</button>
          <button onTouchTap={this.toggleReadOnly}>ReadOnly</button> */}
        </div>
        <SlateEditor
          ref={this.setEditorRef}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
          autoFocus={false}
          value={state}
          style={editorStyle}
          plugins={plugins}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          onPaste={this.onPaste}
          onDrop={this.onDrop}
          readOnly={readOnly}
        />
        {readOnly ? null : (
          <SuggestionPortal
            state={this.state.state}
            suggestions={this.state.suggestions.toJS()}
          />
        )}
      </div>
    );
  };

  render() {
    const Container = this.shouldFullScreen() ? Portal : Div;
    const { readOnly } = this.state;
    const { Provider, store } = this;
    return (
      <Provider store={store}>
        <Container>
          {readOnly ? null : this.renderToolbar()}
          {this.renderEditor()}
        </Container>
      </Provider>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    sendAddImage: (form, reqConfig) =>
      dispatch(addImageRequest(form, reqConfig)),
    onError: err => dispatch(addError(err))
  };
}

function mapStateToProps(store, props) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  withRef: true
})(Editor);

const EditorWithoutConnect = Editor;

export { emptyContent, EditorWithoutConnect };
