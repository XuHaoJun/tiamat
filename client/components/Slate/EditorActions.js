export const CHANGE_LOCAL_EDITOR = "CHANGE_LOCAL_EDITOR";
export const COMPILE_TEMPLATES_LOCAL_EDITOR = "COMPILE_TEMPLATES_LOCAL_EDITOR";

export function changeEditor(change) {
  return {
    type: CHANGE_LOCAL_EDITOR,
    change
  };
}

export function compileTemplates() {
  return {
    type: COMPILE_TEMPLATES_LOCAL_EDITOR
  };
}
