import { observable } from 'mobx'

class Portal {
  @observable title = ''
  @observable target = null

  constructor(...args) {
    if (args[0] && typeof args[0] === 'object') return this.fromObject(args[0])
    return this.fromTitleAndTarget(args[0], args[1], args[2])
  }

  fromTitleAndTarget(title, target, index) {
    this.title = title
    this.target = target
    this.index = index
  }

  fromObject(object) {
    Object.assign(this, object)
  }
}

export default Portal
