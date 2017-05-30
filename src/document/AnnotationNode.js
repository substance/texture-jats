import { PropertyAnnotation } from 'substance'

export default
class AnnotationNode extends PropertyAnnotation {}

AnnotationNode.type = 'annotation'

AnnotationNode.schema = {
  attributes: { type: 'object', default: {} }
}
