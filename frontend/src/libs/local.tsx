type Storage = { [x: string]: string | undefined };

const PREFIX = "_local_";

let storage: Storage;

try {
  storage = window.localStorage as Storage;
  storage["____temp____"] = "foo";
} catch (e) {
  try {
    storage = sessionStorage as Storage;
    storage["____temp____"] = "foo";
  } catch (e) {
    storage = {} as Storage;
  }
}

const local = {
  get(key: string, defaultValue?: any) {
    const stringified = storage[PREFIX + key];
    if (stringified) {
      try {
        return JSON.parse(stringified);
      } catch (e) {
        return defaultValue;
      }
    }
    return defaultValue;
  },
  has(key: string) {
    const value = storage[PREFIX + key];
    if (!value) return false;
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  },
  delete(key: string) {
    delete storage[PREFIX + key];
  },
  set(key: string, value: any) {
    try {
      storage[PREFIX + key] = JSON.stringify(value);
      return true;
    } catch (e) {
      console.error("[local]: Could not persist value\n", value);
    }
    return false;
  },
  toggle(key: string) {
    this.set(key, !this.get(key));
  },
};

export default local;
