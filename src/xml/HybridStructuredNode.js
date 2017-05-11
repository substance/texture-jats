import StructuredNode from './StructuredNode'

export default
class HybridStructuredNode extends StructuredNode {}

HybridStructuredNode.type = 'hybrid-structured-node'

HybridStructuredNode.schema = {
  // can be used as annotation
  start: { type: "coordinate", optional: true },
  end: { type: "coordinate", optional: true },
}

HybridStructuredNode.isAnnotation = true
HybridStructuredNode.isInline = true
HybridStructuredNode.isBlock = true