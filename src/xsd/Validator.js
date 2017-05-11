import DFA from './DFA'

export default
class Validator {

  constructor(data) {
    const tagNames = data.map(e=>e.name)
    this.elementNames = tagNames
    this.elementIds = tagNames.reduce((m,k,idx)=>{m[k]=idx;return m}, {})
    let specs = {}
    let dfas = {}
    // HACK: hard-coded constant for EPSILON
    const EPSILON = 0
    data.forEach((e) => {
      specs[e.name] = e
      if (e.dfa) {
        dfas[e.name] = new DFA(e.dfa, EPSILON)
      }
    })
    this.specs = specs
    this.dfas = dfas
    this.errors = []
  }

  getElementValidator(tagName) {
    let spec = this.specs[tagName]
    if (!spec) throw new Error('Unsupported element')
    let dfa = this.dfas[tagName]
    return new ElementValidator(this.elementIds, spec, dfa)
  }

  isValid(el) {
    let valid = true
    const name = el.tagName
    const elValidator = this.getElementValidator(name)
    const errors = elValidator.checkAttributes(el)
    if (errors) {
      this.errors = this.errors.concat(errors)
    }
    const iterator = el.getChildNodeIterator()
    while (iterator.hasNext()) {
      let error = null
      const childEl = iterator.next()
      if (childEl.isTextNode()) {
        error = elValidator.consumeText(childEl.textContent)
        if (error) {
          valid = false
          this.errors.push(error)
        }
        continue
      }
      // skip all other nodes
      if (!childEl.isElementNode()) continue

      // check if the child element is valid here
      error = elValidator.consume(childEl.tagName)
      if (error) {
        this.errors.push(error)
      }
      // validate the child element recursively
      valid = this.isValid(childEl) && valid
    }
    if (!elValidator.isFinished()) {
      this.errors.push(`<${el.tagName}> is incomplete`)
      valid = false
    }
    return valid
  }

  getValidatingChildNodeIterator(el) {
    return new ValidatingChildNodeIterator(el.getChildNodeIterator(), this.getElementValidator(el.tagName))
  }
}

class ElementValidator {

  constructor(elementIds, spec, dfa) {
    this.elementIds = elementIds
    this.spec = spec
    this.dfa = dfa

    this.reset()
  }

  reset() {
    this.state = 0
  }

  checkAttributes() {
    // TODO: check attributes
  }

  consumeText(textContent) {
    const spec = this.spec
    if (!spec.mixed && /^\s*$/.exec(textContent)) {
      return `Text is not allowed in element: <${spec.name}>`
    }
  }

  consume(tagName) {
    let id = this.elementIds[tagName]
    if (id === undefined) {
      return `Unsupported element: <${tagName}>`
    }
    this.state = this.dfa.consume(this.state, id)
    if (this.state === -1) {
      return `<${tagName}> is not valid in ${this.spec.name}`
    }
  }

  isFinished() {
    return this.dfa.isFinished(this.state)
  }
}

class ValidatingChildNodeIterator {

  constructor(it, validator) {
    this._it = it
    this._validator = validator
    this._states = []
  }

  hasNext() {
    return this._it.hasNext()
  }

  next() {
    let error
    let next = this._it.next()
    if (next.isTextNode()) {
      error = this._validator.consumeText(next.textContent)
    } else if (next.isElementNode()) {
      error = this._validator.consume(next.tagName)
    }
    if (error) {
      throw new Error(error)
    }
    this._states.push(this._validator.state)
    return next
  }

  back() {
    this._it.back()
    this._validator.state = this._states.pop()
    return this
  }

  peek() {
    return this._it.peek()
  }

}
