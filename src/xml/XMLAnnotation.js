import XMLNode from './XMLNode'

export default
class XMLAnnotation extends XMLNode {}

XMLAnnotation.type = 'annotation'

XMLAnnotation.schema = {
  start: { type: "coordinate", optional: true },
  end: { type: "coordinate", optional: true },
}

XMLAnnotation.isAnnotation = true