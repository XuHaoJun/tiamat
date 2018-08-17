import SoftBreak from "slate-soft-break";
import SuggestionsPlugin from "@xuhaojun/slate-suggestions";
import PluginEditTable from "slate-edit-table";
import PluginEditList from "slate-edit-list";
// import PluginEditCode from "slate-edit-code";

function getCurrentWord(text, index, initialIndex) {
  if (index === initialIndex) {
    return {
      start: getCurrentWord(text, index - 1, initialIndex),
      end: getCurrentWord(text, index + 1, initialIndex)
    };
  }
  if (text[index] === " " || text[index] === "#" || text[index] === undefined) {
    return index;
  }
  if (index < initialIndex) {
    return getCurrentWord(text, index - 1, initialIndex);
  }
  if (index > initialIndex) {
    return getCurrentWord(text, index + 1, initialIndex);
  }
  return null;
}

function createPlugins() {
  const tablePlugin = PluginEditTable();
  const suggestionsPlugin = SuggestionsPlugin({
    trigger: "#",
    capture: /#([\w]*)/,
    onEnter(suggestion, change) {
      const state = change.value;
      const { anchorText, anchorOffset } = state;
      const hasLink = state.inlines.some(inline => inline.type === "link");
      if (hasLink) {
        return undefined;
      }
      const { text } = anchorText;
      let index = {
        start: anchorOffset - 1,
        end: anchorOffset
      };
      if (text[anchorOffset - 1] !== "#") {
        index = getCurrentWord(text, anchorOffset - 1, anchorOffset - 1);
      }
      if (!index || !suggestion) {
        return undefined;
      }
      return change
        .deleteBackward(1)
        .insertText(suggestion.suggestion)
        .extend(0 - suggestion.suggestion.length)
        .wrapInline({
          type: "link",
          data: {
            href: suggestion.value
          }
        })
        .collapseToStartOfNextText()
        .insertText(" ")
        .collapseToEnd()
        .focus();
    }
  });

  const softBreakPlugin = SoftBreak({
    onlyIn: ["code"]
  });

  const listPlugin = PluginEditList({
    types: ["bulleted-list", "numbered-list"],
    typeItem: "list-item",
    typeDefault: "paragraph"
  });

  // const editCodePlugin = PluginEditCode({
  //   containerType: "code_block",
  //   lineType: "code_line",
  //   onlyIn: node => node.type === "code_template"
  // });

  const plugins = {
    suggestionsPlugin,
    softBreakPlugin,
    // tablePlugin,
    listPlugin
    // editCodePlugin
  };
  return plugins;
}

export async function loadPrismPlugin() {
  const slatePrismModule = await import("slate-prism");
  const prismPlugin = slatePrismModule.default({
    onlyIn: node => {
      return node.type === "code_block";
    },
    getSyntax: () => "jsx"
  });
  await Promise.all([
    import("../../../node_modules/prismjs/themes/prism-tomorrow.css"),
    import("prismjs/components/prism-jsx")
  ]);
  return prismPlugin;
}

export const defaultPlugins = createPlugins();

export default createPlugins;
