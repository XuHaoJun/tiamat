export default function createFastMemoizeDefaultOptions(...args) {
  const options = args[0] || {};
  const size = (typeof args[0] === "number" ? args[0] : options.size) || 10;
  return {
    serializer(...callerArgs) {
      return JSON.stringify(
        callerArgs.map(arg => {
          if (arg && arg.hashCode && typeof arg.hashCode === "function") {
            return arg.hashCode();
          } else if (typeof arg === "function") {
            return String(arg);
          } else {
            return arg;
          }
        })
      );
    },
    cache: {
      create() {
        let memoryStore = {};
        let count = 0;
        return {
          has(key) {
            return key in memoryStore;
          },
          get(key) {
            return memoryStore[key];
          },
          set(key, value) {
            if (count >= size) {
              memoryStore = {};
              count = 0;
            }
            memoryStore[key] = value;
            count += 1;
          }
        };
      }
    }
  };
}
