import XMLNode from './XMLNode'

export default
class TextNode extends XMLNode {}

TextNode.type = 'text-node'

TextNode.schema = {
  content: { type: 'text', optional: true},
  // when used as annotation
  start: { type: "coordinate", optional: true },
  end: { type: "coordinate", optional: true },
}
