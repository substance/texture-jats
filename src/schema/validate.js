import { DefaultDOMElement as DOM } from 'substance'
import Validator from './Validator'

export default function validate(xmlSchema, xmlString) {
  let validator = new Validator(xmlSchema)
  let dom = DOM.parseXML(xmlString)
  // TODO: for sake of generality we should take the start element from the schema
  let root = dom.find('article')
  if (!root) {
    return 'Start element is missing.'
  } else {
    if (!validator.isValid(root)) {
      return {
        errors: validator.errors,
        elements: validator.errorElements.map(el => el.getNativeElement())
      }
    }
  }
}