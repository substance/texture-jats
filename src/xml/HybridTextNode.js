import TextNode from './TextNode'

export default
class HybridTextNode extends TextNode {}

HybridTextNode.type = 'hybrid-text-node'

HybridTextNode.schema = {
  // can be used as annotation
  start: { type: "coordinate", optional: true },
  end: { type: "coordinate", optional: true },
}
