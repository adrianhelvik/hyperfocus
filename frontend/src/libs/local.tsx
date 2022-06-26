const PREFIX = '_local_'

let storage

try {
  storage = window.localStorage
  storage['____temp____'] = true
} catch (e) {
  try {
    storage = sessionStorage
    storage['____temp____'] = true
  } catch (e) {
    storage = {}
  }
}

const local = {
  get(key, defaultValue) {
    if (storage[PREFIX + key]) {
      try {
        return JSON.parse(storage[PREFIX + key])
      } catch (e) {
        return defaultValue
      }
    }
    return defaultValue
  },
  has(key) {
    const value = storage[PREFIX + key]
    if (!value) return false
    try {
      JSON.parse(value)
      return true
    } catch (e) {
      return false
    }
  },
  delete(key) {
    delete storage[PREFIX + key]
  },
  set(key, value) {
    try {
      storage[PREFIX + key] = JSON.stringify(value)
      return true
    } catch (e) {
      console.error('[local]: Could not persist value\n', value)
    }
    return false
  },
  toggle(key) {
    this.set(key, !this.get(key))
  },
}

if (import.meta.env.NODE_ENV === 'development') window.local = local

export default local
