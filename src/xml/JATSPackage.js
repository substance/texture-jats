import JATS from '../JATS'
import JATSDocument from './JATSDocument'
import TextNode from './TextNode'
import TextNodeConverter from './TextNodeConverter'
import StructuredNode from './StructuredNode'
import StructuredNodeConverter from './StructuredNodeConverter'
import XMLAnnotation from './XMLAnnotation'
import XMLAnnotationConverter from './XMLAnnotationConverter'
import HybridTextNode from './HybridTextNode'
import HybridStructuredNode from './HybridStructuredNode'

export default {
  name: 'JATS',
  configure(config) {
    defineSchema(config)
  }
}

function defineSchema(config) {
  // schema declaration
  config.defineSchema({
    name: 'jats',
    version: '1.1',
    DocumentClass: JATSDocument,
    defaultTextType: 'p'
  })
  // add node definitions and converters
  JATS.forEach((element) => {
    if (element.name === 'EPSILON') return
    let NodeClass, ConverterClass
    if (element.categories.annotation) {
      NodeClass = XMLAnnotation
      ConverterClass = XMLAnnotationConverter
    } else if (element.categories.text) {
      if (element.categories.hybrid) {
        NodeClass = HybridTextNode
      } else {
        NodeClass = TextNode
      }
      ConverterClass = TextNodeConverter
    } else if (element.categories.structured) {
      if (element.categories.hybrid) {
        NodeClass = HybridStructuredNode
      } else {
        NodeClass = StructuredNode
      }
      ConverterClass = StructuredNodeConverter
    } else {
      throw new Error('Illegal state')
    }
    // anonymous class definition
    class Node extends NodeClass {}
    Node.type = element.name
    config.addNode(Node)
    let converter = new ConverterClass()
    converter.tagName = element.name
    converter.type = element.name
    config.addConverter('jats', converter)
  })
}