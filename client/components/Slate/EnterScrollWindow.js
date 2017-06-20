import keycode from 'keycode';

function scrollTo(el) {
  const rect = el.getBoundingClientRect();
  const {innerWidth, innerHeight, pageYOffset, pageXOffset} = window;
  const top = rect.bottom + pageYOffset;
  const left = rect.right + pageXOffset;

  const x = left < pageXOffset || innerWidth + pageXOffset < left
    ? left - (innerWidth / 2)
    : pageXOffset;
  const y = top < pageYOffset || innerHeight + pageYOffset < top
    ? top - (innerHeight / 2)
    : pageYOffset;

  //window.scrollTo(x, y);
  console.log('x, y', x, y);
}

const EnterScrollWindow = () => {
  return {
    onKeyDown(e, data, state) {
      if (!window || keycode(e.which) !== 'enter') {
        return;
      }
      if (false) {
        e.preventDefault();
        const block = state
          .blocks
          .get(0);
        const el = document.querySelector(`[data-key="${block.key}"]`);
        scrollTo(el);
      }
    }
  };
};

export default EnterScrollWindow;
