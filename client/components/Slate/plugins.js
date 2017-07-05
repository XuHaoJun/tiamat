import SoftBreak from "slate-soft-break";
import SuggestionsPlugin from "@xuhaojun/slate-suggestions";
import PluginEditTable from "slate-edit-table";
import EnterScrollWindow from "./EnterScrollWindow";

function getCurrentWord(text, index, initialIndex) {
  if (index === initialIndex) {
    return {
      start: getCurrentWord(text, index - 1, initialIndex),
      end: getCurrentWord(text, index + 1, initialIndex)
    };
  }
  if (text[index] === " " || text[index] === "@" || text[index] === undefined) {
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
    trigger: "@",
    capture: /@([\w]*)/,
    onEnter: (suggestion, state) => {
      const { anchorText, anchorOffset, selection, document } = state;
      const hasMention = state.inlines.some(
        inline => inline.type === "mention"
      );
      if (hasMention) {
        return;
      }
      const text = anchorText.text;
      let index = {
        start: anchorOffset - 1,
        end: anchorOffset
      };
      if (text[anchorOffset - 1] !== "@") {
        index = getCurrentWord(text, anchorOffset - 1, anchorOffset - 1);
      }
      if (!index || !suggestion) {
        console.log("returned");
        return;
      }
      return state
        .transform()
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
        .focus()
        .apply();
    }
  });

  const enterScrollWindowPlugin = EnterScrollWindow();
  const softBreakPlugin = SoftBreak({
    onlyIn: ["code"]
  });

  const plugins = {
    enterScrollWindowPlugin,
    suggestionsPlugin,
    softBreakPlugin,
    tablePlugin
  };
  return plugins;
}

export const defaultPlugins = createPlugins();

export default createPlugins;
