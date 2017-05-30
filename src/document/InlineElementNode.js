import { InlineNode } from 'substance'

export default
class InlineElementNode extends InlineNode {}

InlineElementNode.type = 'inline-element'

InlineElementNode.schema = {
  attributes: { type: 'object', default: {} },
  childNodes: { type: ['array', 'id'], default: [], owned: true},
}
