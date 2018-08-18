// TODO
// calc sizeof and limit it.
class MemoryCache {
  constructor(maxSize) {
    this.store = new Map();
    this.maxSize = maxSize || 10;
    this.count = 0;
  }

  has(key) {
    return this.store.has(key);
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    if (this.store.size >= this.maxSize) {
      this.store.clear();
    }
    this.store.set(key, value);
  }
}

function serializer(...callerArgs) {
  return JSON.stringify(
    callerArgs.map(arg => {
      if (arg && arg.hashCode && typeof arg.hashCode === 'function') {
        return arg.hashCode();
      } else if (typeof arg === 'function') {
        return String(arg);
      } else {
        return arg;
      }
    })
  );
}

export default function createFastMemoizeDefaultOptions(...args) {
  const options = args[0] || {};
  const size = (typeof args[0] === 'number' ? args[0] : options.size) || 10;
  return {
    serializer,
    cache: {
      create() {
        return new MemoryCache(size);
      },
    },
  };
}
