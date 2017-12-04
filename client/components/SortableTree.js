import React from "react";
import Loadable from "react-loadable";

function Loading() {
  return <div>loading...</div>;
}

// FIXME
// SortableTree can't work with server-side so that show loading only.
const SortableTree = Loadable({
  loader: () => {
    if (typeof window === "undefined") {
      return Promise.resolve(Loading);
    } else {
      return Promise.all([
        import("react-dnd-touch-backend"),
        import("react-dnd-html5-backend"),
        import("react-dnd-multi-backend"),
        import("react-dnd"),
        import("react-sortable-tree")
      ]).then(result => {
        const [
          TouchBackend,
          HTML5Backend,
          MultiBackend,
          reactDnd,
          reactSortableTree
        ] = result;
        const { TouchTransition } = MultiBackend;
        const { DragDropContext } = reactDnd;
        const HTML5toTouch = {
          backends: [
            {
              backend: HTML5Backend.default
            },
            {
              backend: TouchBackend.default({
                delayTouchStart: 10
              }), // Note that you can call your backends with options
              preview: true,
              transition: TouchTransition
            }
          ]
        };
        const { SortableTreeWithoutDndContext } = reactSortableTree;
        const sortableTreeComponent = DragDropContext(
          MultiBackend.default(HTML5toTouch)
        )(SortableTreeWithoutDndContext);
        return sortableTreeComponent;
      });
    }
  },
  loading: Loading
});

export default SortableTree;
