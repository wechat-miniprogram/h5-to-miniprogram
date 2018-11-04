const load = require('../index')

const Event = load('Event')

class CustomEvent extends Event {
  constructor(name = '', options = {}) {
    super({
      name,
      ...options,
    })
  }
}

module.exports = CustomEvent
