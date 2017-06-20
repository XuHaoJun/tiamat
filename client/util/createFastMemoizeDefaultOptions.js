export default function createFastMemoizeDefaultOptions(size = 100) {
  return {
    serializer(...args) {
      return JSON.stringify(args[0].map((arg) => {
        return typeof arg.hashCode === 'function'
          ? arg.hashCode()
          : arg;
      }));
    },
    cache: {
      create() {
        let store = {};
        let count = 0;
        return {
          has(key) {
            return (key in store);
          },
          get(key) {
            return store[key];
          },
          set(key, value) {
            if (count >= size) {
              store = {};
              count = 0;
            }
            store[key] = value;
            count += 1;
          }
        };
      }
    }
  };
}
