import React from 'react';
import Loadable from 'react-loadable';

function Loading() {
  return <div>Loading...</div>;
}

const SortableTree = Loadable({
  loader: async () => {
    if (process.browser) {
      const modules = await Promise.all([
        import(/* webpackChunkName: "react-dnd-touch-backend" */ 'react-dnd-touch-backend'),
        import(/* webpackChunkName: "react-dnd-html5-backend" */ 'react-dnd-html5-backend'),
        import(/* webpackChunkName: "react-dnd-multi-backend" */ 'react-dnd-multi-backend'),
        import(/* webpackChunkName: "react-dnd" */ 'react-dnd'),
        import(/* webpackChunkName: "react-sortable-tree" */ 'react-sortable-tree'),
        import(/* webpackChunkName: "react-sortable-tree/style.css" */ '../../node_modules/react-sortable-tree/style.css'),
      ]);
      const [TouchBackend, HTML5Backend, MultiBackend, reactDnd, reactSortableTree] = modules;
      const { TouchTransition } = MultiBackend;
      const { DragDropContext } = reactDnd;
      const HTML5toTouch = {
        backends: [
          {
            backend: HTML5Backend.default,
          },
          {
            backend: TouchBackend.default({
              delayTouchStart: 10,
            }), // Note that you can call your backends with options
            preview: true,
            transition: TouchTransition,
          },
        ],
      };
      const { SortableTreeWithoutDndContext } = reactSortableTree;
      const SortableTreeComponent = DragDropContext(MultiBackend.default(HTML5toTouch))(
        SortableTreeWithoutDndContext
      );
      return SortableTreeComponent;
    } else {
      return Loading;
    }
  },
  loading: Loading,
});

export default SortableTree;
