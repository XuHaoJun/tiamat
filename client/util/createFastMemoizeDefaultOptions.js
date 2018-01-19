export default function createFastMemoizeDefaultOptions(size = 100) {
  return {
    serializer(...args) {
      return JSON.stringify(
        args.map(arg => {
          if (typeof arg === "object" && typeof arg.hashCode === "function") {
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
