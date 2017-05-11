import { DocumentNode } from 'substance'

// TODO: we should not duplicate the DOM, instead
// make css-select capable to deal with the indirection via node ids
export default
class XMLNode extends DocumentNode {}

XMLNode.type = 'xml-node'

XMLNode.schema = {
  attributes: { type: 'object', default: {} }
}
