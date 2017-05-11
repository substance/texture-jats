import XMLNode from './XMLNode'

export default
class TextNode extends XMLNode {}

TextNode.type = 'text-node'

TextNode.schema = {
  content: { type: 'text', optional: true}
}

TextNode.isBlock = true