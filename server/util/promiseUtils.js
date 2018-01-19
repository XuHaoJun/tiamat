function forcePromise(p) {
  if (!p.then) {
    return Promise.resolve(p);
  } else {
    return p;
  }
}

/**
 * Throw an array to it and a function which can generate promises
 * and it will call them sequentially, one after another
 */
export function sequence(_items, consumer) {
  const results = [];
  const items = Array.isArray(_items) ? _items : [_items];
  const runner = () => {
    const item = items.shift();
    if (item) {
      const p = forcePromise(consumer(item));
      return p
        .then(result => {
          results.push(result);
        })
        .then(runner);
    }
    return Promise.resolve(results);
  };
  return runner();
}

export default sequence;
