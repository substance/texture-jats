import { DocumentNode } from 'substance'

export default
class ElementNode extends DocumentNode {}

ElementNode.type = 'element'

ElementNode.schema = {
  attributes: { type: 'object', default: {} },
  childNodes: { type: ['array', 'id'], default: [], owned: true}
}

ElementNode.isBlock = true