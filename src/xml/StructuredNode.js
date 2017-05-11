import XMLNode from './XMLNode'

export default
class StructuredNode extends XMLNode {}

StructuredNode.type = 'structured-node'

StructuredNode.schema = {
  childNodes: { type: ['array', 'id'], default: [], owned: true},
}

StructuredNode.isBlock = true